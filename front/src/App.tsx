import { Alert, Button, Cascader, Col, Divider, Form, Input, InputNumber, Layout, PageHeader, Progress, Row, Select, Spin, Switch } from 'antd';
import { Content, Footer } from 'antd/lib/layout/layout';
import Tree, { DataNode } from 'antd/lib/tree';
import { FileOutlined, FileImageOutlined, FileJpgOutlined, FileMarkdownOutlined, FileTextOutlined, FileZipOutlined, LinkOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';
import { parse as parsePath, resolve as resolvePath } from 'path';
import { SingleValueType } from 'rc-cascader/lib/Cascader';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { monarchTokensProvider, sceneDefinitionTheme, semanticTokensProvider } from './scene/monacoSupport';
import { sceneModelParsed } from './store';
import { SceneParser } from './scene/cstParser';
import { lexer, tokens } from './scene/cstLexer';
import { clamp, cstLocationToMonacoRange, useEditor } from './utils';

import './App.scss'

import initModule, { WebModule } from 'web'
import 'web/index.data'
import 'web/index.wasm'
import { argsToFlags, Arguments, defaultArguments, filterPathTree, isArgsValid, parseModuleArgs, PathTreeNode, rootDirectories, walkModuleFileSystem } from './binding';
import { fullParse } from './scene';

const { Option } = Select;

// @ts-ignore
self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: any, label: string) {
        return './editor.worker.bundle.js'
    }
}

type CascaderDataNode = {
    label: string
    value: string
    children?: CascaderDataNode[]
}

function pathTreeToCascaderTree(tree: PathTreeNode[]) {
    const res: [CascaderDataNode, PathTreeNode][] = tree.map(n => [{ label: n.path, value: n.path }, n])
    for (const stack = [...res]; stack.length;) {
        const [node, fileNode] = stack.pop()!
        if (fileNode.children) {
            node.children = []
            for (const c of fileNode.children) {
                const { base } = parsePath(c.path)
                const child = { label: base, value: base }
                node.children.push(child)
                stack.push([child, c])
            }
        }
    }
    return res.map(([n]) => n)
}

function extToIcon(ext: string) {
    switch (ext) {
        case '.bmp':
        case '.png':
            return <FileImageOutlined />
        case '.jpg':
            return <FileJpgOutlined />
        case '.md':
            return <FileMarkdownOutlined />
        case '.txt':
            return <FileTextOutlined />
        case '.zip':
            return <FileZipOutlined />
        default:
            return <FileOutlined />
    }
}
function pathTreeToDataNode(tree: PathTreeNode[]): DataNode[] {
    const res: [DataNode, PathTreeNode][] = tree.map(n => [{ key: n.path, title: n.path }, n])
    for (const stack = [...res]; stack.length;) {
        const [node, fileNode] = stack.pop()!
        if (fileNode.children) {
            node.selectable = false
            node.children = []
            for (const c of fileNode.children) {
                const { base } = parsePath(c.path)
                const child = { key: c.path, title: base }
                node.children.push(child)
                stack.push([child, c])
            }
        } else {
            node.icon = extToIcon(parsePath(fileNode.path).ext)
        }
    }
    return res.map(([n]) => n)
}

const MIN_OUTPUT_SIZE = 1
const MAX_OUTPUT_SIZE = 4096

const sceneCstLexer = lexer
const sceneCstParser = new SceneParser(tokens, {
    recoveryEnabled: true,
    nodeLocationTracking: "full",
})

type EditorAlterContent = {
    url: string
}

function readImage(module: WebModule, path: string) {
    return URL.createObjectURL(
        new Blob([module.FS.readFile(path).buffer], { type: 'image/png' })
    )
}

export const App = () => {
    const [module, setModule] = useState<WebModule>()
    const isModuleLoading = !module

    const [imgUrl, setImgUrl] = useState<string>()

    const [moduleArgs, setModuleArgs] = useState<Partial<Arguments>>(defaultArguments)
    const [inputFileTree, setInputFileTree] = useState<CascaderDataNode[]>([])
    const [isSizeLinked, setSizeLinked] = useState<boolean>(true)
    const [sizeLinkRatio, setSizeLinkRatio] = useState<number>(1)
    const [isCheckingArgs, setCheckingArgs] = useState<boolean>(false)

    const [isModuleRunning, setModuleRunning] = useState<boolean>(false)
    const [moduleStatus, setModuleStatus] = useState<number>(0)
    const [moduleCommand, setModuleCommand] = useState<string>()

    const [fileTree, setFileTree] = useState<DataNode[]>([])
    const [expandedDirs, setExpandedDirs] = useState(new Set<string>(['scene', 'output']))
    const [selectedFile, setSelectedFile] = useState<string>()
    const [divRef, editor] = useEditor({
        automaticLayout: true,
        readOnly: true,
        'semanticHighlighting.enabled': true,
    })
    const [useEditorAlter, setUseEditorAlter] = useState<boolean>(true)
    const [alterContent, setAlterContent] = useState<EditorAlterContent>()
    const [isEditorEdited, setEditorEdited] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    function updateModuleArgs(args: Partial<Arguments>) {
        const newArgs = { ...moduleArgs, ...args }
        setModuleArgs(newArgs)
        if (isCheckingArgs && isArgsValid(newArgs))
            setCheckingArgs(false)
    }

    const { inputFile, outputFile } = moduleArgs

    useEffect(() => {
        initModule({ arguments: ['-noargs'] }).then(setModule)
    }, [])

    const updateFileTree = useCallback((module: WebModule) => {
        const customPath = rootDirectories(module).filter(p => p !== 'tmp' && p !== 'dev' && p !== 'home' && p !== 'proc')
        const fileEditorPathTree = customPath.map(p => walkModuleFileSystem(module, p))
        console.debug('File editor path tree', fileEditorPathTree)
        const dataNodes = pathTreeToDataNode(fileEditorPathTree)
        console.debug('File editor data', dataNodes)
        setFileTree(dataNodes)
    }, [])

    useEffect(() => {
        if (module) {
            console.debug('Module loaded', module)
            module.FS.mkdir('output')

            const pathTree = walkModuleFileSystem(module, 'scene')
            console.debug('Scene path tree', pathTree)
            filterPathTree(pathTree, node => !!node.children || parsePath(node.path).name.startsWith('scene'))
            console.debug('Filtered path tree for input file cascader', pathTree)

            const cascaderTree = pathTreeToCascaderTree(pathTree.children!)
            console.debug('Cascader tree', cascaderTree)
            setInputFileTree(cascaderTree)

            updateFileTree(module)
        }
    }, [module])

    useEffect(() => {
        setIsSaving(false)
        console.log(module, editor, selectedFile)
        if (!module || !editor || !selectedFile)
            return
        const model = editor.getModel()
        if (!model || !isEditorEdited)
            return
        const { FS } = module
        FS.writeFile(selectedFile, model.getValue())
        setEditorEdited(false)
    }, [isSaving])

    useEffect(() => {
        if (!editor)
            return
        editor.getModel()?.dispose()
        monaco.languages.register({ id: 'SceneDefinition' });
        monaco.languages.registerDocumentSemanticTokensProvider('SceneDefinition', semanticTokensProvider());
        monaco.languages.setMonarchTokensProvider('SceneDefinition', monarchTokensProvider())
        monaco.editor.defineTheme('SceneDefinitionTheme', sceneDefinitionTheme())
        monaco.editor.setTheme('SceneDefinitionTheme')
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => setIsSaving(true));
    }, [editor])

    const astErrorDecorationIds = useRef<string[]>([])
    const parseSceneModel = useCallback((editor: monaco.editor.ICodeEditor, model: monaco.editor.ITextModel) => {
        astErrorDecorationIds.current = editor.deltaDecorations(astErrorDecorationIds.current, [])
        const uri = model.uri.toString()
        const text = model.getValue()

        const { cst, ast, astError } = fullParse(sceneCstLexer, sceneCstParser, text)
        if (cst && ast) {
            sceneModelParsed.set(uri, [cst, ast])
        } else {
            sceneModelParsed.delete(uri)
            if (astError) {
                const message = astError.message ? `: ${astError.message}` : ''
                const range = cstLocationToMonacoRange(astError.node.location!)
                astErrorDecorationIds.current = editor.deltaDecorations(astErrorDecorationIds.current, [{
                    range,
                    options: {
                        hoverMessage: {
                            value: `AST parsing error at (${range.startLineNumber}, ${range.startColumn})${message}`
                        },
                        inlineClassName: 'ast-error'
                    }
                }])
            }
        }
    }, [])

    useEffect(() => {
        setEditorEdited(false)
        setUseEditorAlter(true)
        setAlterContent(undefined)
        if (module && editor) {
            editor.getModel()?.dispose()
            if (selectedFile) {
                if (parsePath(selectedFile).base.match(/^scene.+\.txt$/)) {
                    const selectedFileContent = new TextDecoder().decode(module.FS.readFile(selectedFile))

                    editor.updateOptions({ readOnly: false })
                    const model = monaco.editor.createModel(
                        selectedFileContent,
                        'SceneDefinition',
                        monaco.Uri.parse(`file://${selectedFile}`)
                    )
                    editor.setModel(model)
                    setUseEditorAlter(false)

                    parseSceneModel(editor, model)
                    model.onDidChangeContent(() => {
                        setEditorEdited(true)
                        parseSceneModel(editor, model)
                    })
                } else {
                    editor.updateOptions({ readOnly: true })
                    if (parsePath(selectedFile).ext === '.bmp') {
                        setAlterContent({ url: readImage(module, selectedFile) })
                    }
                }
            } else {
                editor.updateOptions({ readOnly: true })
            }
        }
    }, [selectedFile])

    function onRenderClick() {
        if (!module)
            return
        if (!isArgsValid(moduleArgs)) {
            setCheckingArgs(true)
            return
        }

        const flags = argsToFlags(moduleArgs)
        setModuleCommand(['./proj', ...flags].join(' '))
        const argvec = parseModuleArgs(module, argsToFlags(moduleArgs))

        const execHandle = module.exec(argvec, e => setModuleStatus(e.percentage))
        setModuleRunning(true)
        if (typeof execHandle === "object") {
            execHandle.then(() => {
                setImgUrl(readImage(module, moduleArgs.outputFile))
                setModuleRunning(false)
                updateFileTree(module)
            })
        } else {
            setImgUrl(readImage(module, moduleArgs.outputFile))
            setModuleRunning(false)
            updateFileTree(module)
        }
    }

    function renderButton() {
        const buttonText = isModuleLoading ? "Loading" : isModuleRunning ? "Running" : "Render"
        return (
            <div className='output-render-button'>
                <Button
                    children={buttonText}
                    type='primary'
                    onClick={onRenderClick}
                    loading={isModuleLoading || isModuleRunning}
                />
                {isModuleRunning ?
                    <Progress
                        style={{ width: "100%" }}
                        percent={Math.round(moduleStatus * 100)}
                    /> : undefined}
            </div>
        )
    }

    function outputFrameContent() {
        return (
            <div>
                {imgUrl && <img className='output-image' src={imgUrl} />}
                {renderButton()}
            </div>
        )
    }

    /*
     * Arguments Form
     */

    // File
    const inputFileSelectStatus = isCheckingArgs
        ? inputFile ? "success" : "error"
        : undefined
    const inputFileSelectHelp = isCheckingArgs && !inputFile ? "Input file is required" : undefined
    function onInputFileSelectChange(value?: SingleValueType) {
        const inputFile = value?.join('/')
        updateModuleArgs({ inputFile })
    }
    const inputFileSelectValue = inputFile ? inputFile.split('/') : undefined
    function inputFileSelect() {
        return (
            <Form.Item
                label="Input"
                validateStatus={inputFileSelectStatus}
                help={inputFileSelectHelp}>
                <Cascader
                    options={inputFileTree}
                    placeholder="Input Scene File"
                    expandTrigger="hover"
                    displayRender={labels => <span>{labels.join('/')}</span>}
                    value={inputFileSelectValue}
                    onChange={onInputFileSelectChange}
                />
            </Form.Item >
        )
    }

    const outputFileInputStatus = isCheckingArgs
        ? outputFile ? "success" : "error"
        : undefined
    const outputFileInputHelp = isCheckingArgs && !outputFile ? "Output file is required" : undefined
    function onOutputFileInputChange(e: ChangeEvent<HTMLInputElement>) {
        const outputFile = e.target.value ? e.target.value + '.bmp' : undefined
        updateModuleArgs({ outputFile })
    }
    const outputFileInputValue = outputFile ? outputFile.substring(0, outputFile.lastIndexOf('.')) : undefined
    function outputFileInput() {
        return (
            <Form.Item
                label="Output"
                validateStatus={outputFileInputStatus}
                help={outputFileInputHelp}>
                <Input
                    placeholder="Output Filename"
                    addonAfter=".bmp"
                    value={outputFileInputValue}
                    onChange={onOutputFileInputChange}
                />
            </Form.Item >
        )
    }

    function updateLinkedWidth(newWidth: number) {
        let { width, height } = moduleArgs
        if (height && width) {
            height = clamp(MIN_OUTPUT_SIZE, MAX_OUTPUT_SIZE, Math.round(newWidth / sizeLinkRatio))
        } else if (!height) {
            height = newWidth
        }
        width = newWidth
        updateModuleArgs({ width, height })
    }
    function updateLinkedHeight(newHeight: number) {
        let { width, height } = moduleArgs
        if (width && height) {
            width = clamp(1, MAX_OUTPUT_SIZE, Math.round(newHeight * sizeLinkRatio))
        } else if (!width) {
            width = newHeight
        }
        height = newHeight
        updateModuleArgs({ width, height })
    }
    function onWidthChange(width: number) {
        if (isSizeLinked) {
            updateLinkedWidth(width)
        } else {
            updateModuleArgs({ width })
        }
    }
    function onHeightChange(height: number) {
        if (isSizeLinked) {
            updateLinkedHeight(height)
        } else {
            updateModuleArgs({ height })
        }
    }
    function onLinkClick() {
        if (!isSizeLinked) {
            if (moduleArgs.width && moduleArgs.height) {
                setSizeLinked(true)
                setSizeLinkRatio(moduleArgs.width / moduleArgs.height)
            }
        } else {
            setSizeLinked(false)
            setSizeLinkRatio(1)
        }
    }
    function sizeInputs() {
        return (
            <Form.Item label="Size" >
                <InputNumber
                    style={{ width: 72 }}
                    placeholder={"Width"}
                    min={MIN_OUTPUT_SIZE}
                    max={MAX_OUTPUT_SIZE}
                    step={100}
                    value={moduleArgs?.width}
                    onChange={onWidthChange}
                />
                <Button
                    style={{ marginLeft: 8, marginRight: 8 }}
                    icon={<LinkOutlined />}
                    shape="circle"
                    type={isSizeLinked ? "primary" : "ghost"}
                    onClick={onLinkClick}
                />
                <InputNumber
                    style={{ width: 72 }}
                    placeholder={"Height"}
                    min={MIN_OUTPUT_SIZE}
                    max={MAX_OUTPUT_SIZE}
                    step={100}
                    value={moduleArgs?.height}
                    onChange={onHeightChange}
                />
            </Form.Item >
        )
    }

    // Rendering
    function rendererSelect() {
        return (
            <Form.Item label="Renderer" >
                <Select
                    style={{ width: 120 }}
                    value={moduleArgs.rayCasting ? "caster" : "tracer"}
                    onChange={v => updateModuleArgs({ rayCasting: v === "caster" })}>
                    <Option value="caster">RayCaster</Option>
                    <Option value="tracer">RayTracer</Option>
                </Select>
            </Form.Item >
        )
    }

    function rayTracerOptions() {
        return (
            <Form.Item label="Bounces" style={{ marginBottom: 0 }}>
                <Form.Item
                    style={{ display: 'inline-block', width: 'calc(50% - 36px)' }}>
                    <InputNumber
                        style={{ width: 56 }}
                        value={moduleArgs?.bounces}
                        onChange={bounces => { updateModuleArgs({ bounces }) }}
                    />
                </Form.Item >
                <span
                    style={{ display: 'inline-block', width: '72px', lineHeight: '32px', textAlign: 'center' }}>
                    Shadows:
                </span>
                <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 36px)' }}>
                    <Switch
                        checked={moduleArgs?.shadows}
                        onChange={shadows => { updateModuleArgs({ shadows }) }}
                    />
                </Form.Item >
            </Form.Item>
        )
    }

    function rayCasterOptions() {
        return (
            <Form.Item label="Blurring" style={{ marginBottom: 0 }}>
                <Form.Item
                    style={{ display: 'inline-block', width: 'calc(50% - 36px)' }}>
                    <Switch
                        disabled
                    // checked={moduleArgs?.shadows}
                    // onChange={shadows => { updateModuleArgs({ shadows }) }}
                    />
                </Form.Item >
                <span
                    style={{ display: 'inline-block', width: '72px', lineHeight: '32px', textAlign: 'center' }}>
                    Focus:
                </span>
                <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 36px)' }}>
                    <InputNumber
                        disabled
                        style={{ width: 56 }}
                    // value={moduleArgs?.bounces}
                    // onChange={bounces => { updateModuleArgs({ bounces }) }}
                    />
                </Form.Item >
            </Form.Item>
        )
    }

    // Sampling
    function samplingOptions() {
        return (
            <Form.Item label="Jitter" style={{ marginBottom: 0 }}>
                <Form.Item
                    style={{ display: 'inline-block', width: 'calc(50% - 36px)' }}>
                    <Switch
                        checked={moduleArgs?.jitter}
                        onChange={jitter => { updateModuleArgs({ jitter }) }}
                    />
                </Form.Item >
                <span
                    style={{ display: 'inline-block', width: '72px', lineHeight: '32px', textAlign: 'center' }}>
                    Filter:
                </span>
                <Form.Item style={{ display: 'inline-block', width: 'calc(50% - 36px)' }}>
                    <Switch
                        checked={moduleArgs?.filter}
                        onChange={filter => { updateModuleArgs({ filter }) }}
                    />
                </Form.Item >
            </Form.Item>
        )
    }

    function argsForm() {
        return (
            <Spin tip="Loading Module" spinning={isModuleLoading}>
                <Form labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}>
                    {inputFileSelect()}
                    {outputFileInput()}
                    {sizeInputs()}

                    {rendererSelect()}
                    {moduleArgs.rayCasting ? rayCasterOptions() : rayTracerOptions()}

                    {samplingOptions()}
                </Form>
            </Spin>
        )
    }

    function renderingCommand() {
        return (
            <div className='rendering-command'>
                <h4>Command </h4>
                <div style={{
                    fontFamily: "consolas, monospace",
                    marginLeft: '16px',
                }}>
                    {moduleCommand}
                </div>
            </div>
        )
    }

    function updateDirExpand(path: string, expand: boolean) {
        const newExpandedDirs = new Set(expandedDirs)
        if (expand) {
            newExpandedDirs.add(path)
        } else {
            newExpandedDirs.delete(path)
        }
        setExpandedDirs(newExpandedDirs)
    }

    function renderingSection() {
        return (
            <Row className='rendering-section'>
                <Col span={12}>
                    <div className='output-panel'>
                        <div className='output-frame'>
                            {outputFrameContent()}
                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <div className='args-panel'>
                        <h4>Arguments</h4>
                        {argsForm()}
                        {moduleCommand ? renderingCommand() : undefined}
                    </div>
                </Col>
            </Row>
        )
    }

    function editorAlter() {
        return (
            <div className='editor-alter'>
                {alterContent
                    ? <img className='editor-alter-image' src={alterContent.url} />
                    : <span>{selectedFile ? 'File not supported' : 'No file selected'}</span>}
            </div>
        )
    }

    function fileSection() {
        return (
            <Spin tip="Loading Module" spinning={isModuleLoading}>
                <Row className='file-section'>
                    <Col span={7} className='file-panel'>
                        <Tree
                            showIcon
                            className='file-tree'
                            treeData={fileTree}
                            selectedKeys={selectedFile ? [selectedFile] : []}
                            onSelect={([path]) => setSelectedFile(path as string)}
                            onClick={(_, { children, key, expanded }) => { if (children) updateDirExpand(key as string, !expanded) }}
                            expandedKeys={Array.from(expandedDirs)}
                        />
                    </Col>
                    <Col span={1} className='editor-gap' />
                    <Col span={16} className='editor-panel'>
                        <div ref={divRef} className='editor' style={{ width: 'auto' }} >
                            {useEditorAlter ? editorAlter() : undefined}
                        </div>
                        <div className='editor-bar'>
                            <div className='editor-bar-corner'>
                                <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <span>Emscripten</span>
                                </div>
                            </div>
                            <div className='editor-bar-filename'>
                                {selectedFile}
                            </div>
                            {isEditorEdited ? <div className='editor-bar-edit-sign'>
                                &nbsp;|&nbsp;Edited
                            </div> : undefined}
                        </div>
                    </Col>
                </Row>
            </Spin>
        )
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <PageHeader
                className="site-page-header"
                title="Minecraft-like Game Scene Renderer"
                subTitle="Group 3 of CSIT6000L Digital Design, 2022 Spring"
            />
            <Content className='content'>
                <Divider orientation="left">Rendering</Divider>
                {renderingSection()}
                <Divider orientation="left">File System</Divider>
                {fileSection()}
            </Content>
            <Footer style={{ textAlign: 'center' }}> Group 3 of CSIT6000L Digital Design, 2022 Spring </Footer>
        </Layout >
    )
}
