import { Button, Cascader, Col, Divider, Input, InputNumber, Layout, PageHeader, Progress, Radio, Row, Select, Switch, TreeDataNode, TreeSelect } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import * as monaco from 'monaco-editor';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { LinkOutlined } from '@ant-design/icons';
const { Option } = Select;

import 'web/index.data'
import 'web/index.wasm'
import initModule, { WebModule } from 'web'

import './App.scss'
import path from 'path';
import { argsToFlags, Arguments, isArgsValid } from './type';
import { DefaultOptionType } from 'antd/lib/cascader';
import { SingleValueType } from 'rc-cascader/lib/Cascader';

function parseModuleArgs(module: WebModule, args: string[]): WebModule.StringVector {
    const argvec = new module.StringVector()
    for (const s of args)
        argvec.push_back(s)
    return argvec
}

type CascaderDataNode = {
    label: string
    value: string
    children?: CascaderDataNode[]
}


function cascaderFileTree(
    { FS }: WebModule,
    root: string,
    filter: (path: string) => boolean = () => true,
): CascaderDataNode {
    const res: CascaderDataNode = { label: root, value: root }
    const stack: [string, CascaderDataNode][] = [[root, res]]

    for (; stack.length;) {
        const [path, node] = stack.pop()!
        const { mode } = FS.lookupPath(path, {}).node as any
        // console.log(path)
        if (FS.isFile(mode)) {
            continue
        } else if (FS.isDir(mode)) {
            node.children = []
            const dirChildren = FS.readdir(path)
            dirChildren.sort()

            for (let i = 0; i < dirChildren.length; ++i) {
                const child = dirChildren[i]
                if (child === '.' || child === '..' || !filter(child))
                    continue
                const childNode = { label: child, value: child }
                node.children.push(childNode)
                stack.push([`${path}/${child}`, childNode])
            }
        }
    }

    return res
}

const defaultArguments: Partial<Arguments> = {
    width: 100,
    height: 100,
    bounces: 4,
}

export const App = () => {
    const [outputUrl, setOutputUrl] = useState<string>()
    const [module, setModule] = useState<WebModule>()
    const [treeData, setTreeData] = useState<CascaderDataNode[]>([])
    const [moduleArgs, setModuleArgs] = useState<Partial<Arguments>>(defaultArguments)
    const [isSizeLinked, setSizeLinked] = useState<boolean>(true)
    const [isCheckingArgs, setCheckingArgs] = useState<boolean>(false)
    const [moduleRunning, setModuleRunning] = useState<boolean>(false)
    const [moduleProgress, setModuleProgress] = useState<number>(0)

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

    useEffect(() => {
        if (module) {
            console.log("module")
            console.log(module)
            console.log("module")
            const tree = cascaderFileTree(module, 'scene', p => path.parse(p).ext === '.txt')
            console.log(tree)
            setTreeData([tree])
        }
    }, [module])

    function displayImage(module: WebModule, outputFile: string) {
        setOutputUrl(URL.createObjectURL(
            new Blob([module.FS.readFile(outputFile).buffer], { type: 'image/png' })
        ))
    }

    function onRenderClick() {
        if (!module)
            return
        if (!isArgsValid(moduleArgs)) {
            setCheckingArgs(true)
            return
        }
        console.log(argsToFlags(moduleArgs))
        const argvec = parseModuleArgs(module, argsToFlags(moduleArgs))

        const execHandle = module.exec(argvec, setModuleProgress)
        if (typeof execHandle === "object") {
            // const t1 = performance.now()
            setModuleRunning(true)
            execHandle.then(() => {
                // console.log(performance.now() - t1)
                setModuleRunning(false)
                displayImage(module, moduleArgs.outputFile)
            })
        } else {
            displayImage(module, moduleArgs.outputFile)
        }
    }

    function outputFrameContent() {
        if (outputUrl) {
            return (
                <img className='output-image' src={outputUrl} />
            )
        }
        if (moduleRunning) {
            return (
                <div className='output-placeholder'>
                    <Progress type="dashboard" percent={Math.round(moduleProgress * 100)} />
                </div>
            )
        }
        return (
            <div className='output-placeholder'>
                <Button
                    type='primary'
                    onClick={onRenderClick}
                    disabled={!module}>
                    Render
                </Button>
            </div>
        )
    }

    /*
     * Arguments Frame
     */

    function argsFrameSection(title: string) {
        return (
            <Row className='args-frame-section'>
                <h5>{title}</h5>
            </Row>
        )
    }
    function argsFrameOptionLabel(title: string, span = 6) {
        return (
            <Col span={span} className='args-frame-option-label'>
                <span>{title}</span>
            </Col>
        )
    }

    // File
    function inputFileCascaderDisplayRender(labels: string[], selectedOptions: DefaultOptionType[] | undefined) {
        return labels.map((label, i) => {
            return selectedOptions && <span key={selectedOptions[i].value}>{i !== 0 && '/'}{label}</span>
        })
    }
    const inputFileSelectValue = inputFile ? inputFile.split('/') : undefined
    const inputFileSelectStatus = isCheckingArgs && !inputFile ? "error" : undefined
    function onInputFileSelectChange(value: SingleValueType) {
        const inputFile = value.join('/')
        updateModuleArgs({ inputFile })
    }
    function inputFileSelect() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Input")}
                <Col span={18}>
                    <Cascader
                        style={{ width: "100%" }}
                        options={treeData}
                        placeholder="Input Scene File"
                        expandTrigger="hover"
                        displayRender={inputFileCascaderDisplayRender}
                        value={inputFileSelectValue}
                        status={inputFileSelectStatus}
                        onChange={onInputFileSelectChange}
                    />
                </Col>
            </Row>
        )
    }

    const outputFileInputValue = outputFile ? outputFile.substring(0, outputFile.lastIndexOf('.')) : undefined
    const outputFileInputStatus = isCheckingArgs && !outputFile ? "error" : undefined
    function onOutputFileInputChange(e: ChangeEvent<HTMLInputElement>) {
        const outputFile = e.target.value ? e.target.value + '.bmp' : undefined
        updateModuleArgs({ outputFile })
    }
    function outputFileInput() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Output")}
                <Col span={18}>
                    <Input
                        placeholder="Output Filename"
                        addonAfter=".bmp"
                        value={outputFileInputValue}
                        status={outputFileInputStatus}
                        onChange={onOutputFileInputChange}
                    />
                </Col>
            </Row>
        )
    }

    function onWidthChange(width: number) {
        let height = moduleArgs.height
        if (isSizeLinked && moduleArgs.width && moduleArgs.height)
            height = Math.round(width / moduleArgs.width * moduleArgs.height)
        updateModuleArgs({ width, height })
    }
    function onHeightChange(height: number) {
        let width = moduleArgs.width
        if (isSizeLinked && moduleArgs.width && moduleArgs.height)
            width = Math.round(height / moduleArgs.height * moduleArgs.width)
        updateModuleArgs({ width, height })
    }
    function sizeInputs() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Size")}
                <Col span={18}>
                    <InputNumber
                        style={{ width: 72 }}
                        placeholder={"Width"}
                        min={1}
                        max={4096}
                        step={100}
                        value={moduleArgs?.width}
                        onChange={onWidthChange}
                    />
                    <Button
                        style={{ marginLeft: 4, marginRight: 4 }}
                        icon={<LinkOutlined />}
                        shape="circle"
                        type={isSizeLinked ? "primary" : "ghost"}
                        onClick={() => setSizeLinked(!isSizeLinked)}
                    />
                    <InputNumber
                        style={{ width: 72 }}
                        placeholder={"Height"}
                        min={1}
                        max={4096}
                        step={100}
                        value={moduleArgs?.height}
                        onChange={onHeightChange}
                    />
                </Col>
            </Row>
        )
    }

    // Rendering
    function rendererSelect() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Renderer")}
                <Col span={18}>
                    <Select
                        style={{ width: 120 }}
                        value={moduleArgs.rayCasting ? "caster" : "tracer"}
                        onChange={v => updateModuleArgs({ rayCasting: v === "caster" })}>
                        <Option value="caster">RayCaster</Option>
                        <Option value="tracer">RayTracer</Option>
                    </Select>
                </Col>
            </Row>
        )
    }

    function rayTracerOptions() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Bounces")}
                <Col span={6}>
                    <InputNumber
                        style={{ width: 56 }}
                        value={moduleArgs?.bounces}
                        onChange={bounces => { updateModuleArgs({ bounces }) }}
                    />
                </Col>
                {argsFrameOptionLabel("Shadows")}
                <Col span={6}>
                    <Switch
                        checked={moduleArgs?.shadows}
                        onChange={shadows => { updateModuleArgs({ shadows }) }}
                    />
                </Col>
            </Row>
        )
    }

    function rayCasterOptions() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Bluring")}
                <Col span={6}>
                    <Switch />
                </Col>
                {argsFrameOptionLabel("Focus")}
                <Col span={6}>
                    <InputNumber />
                </Col>
            </Row>
        )
    }

    // Sampling
    function samplingOptions() {
        return (
            <Row className='args-frame-option'>
                {argsFrameOptionLabel("Jitter")}
                <Col span={6}>
                    <Switch
                        checked={moduleArgs?.jitter}
                        onChange={jitter => { updateModuleArgs({ jitter }) }}
                    />
                </Col>
                {argsFrameOptionLabel("Filter")}
                <Col span={6}>
                    <Switch
                        checked={moduleArgs?.filter}
                        onChange={filter => { updateModuleArgs({ filter }) }}
                    />
                </Col>
            </Row>
        )
    }

    function argsFrame() {
        return (
            <div className='args-frame'>
                {argsFrameSection('File')}
                {inputFileSelect()}
                {outputFileInput()}
                {sizeInputs()}

                {argsFrameSection('Rendering')}
                {rendererSelect()}
                {rayTracerOptions()}

                {argsFrameSection('Sampling')}
                {samplingOptions()}
            </div>
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
                <Row className='rendering-section'>
                    <Col span={12} className='output-panel'>
                        <div className='output-frame'>
                            {outputFrameContent()}
                        </div>
                    </Col>
                    <Col span={12} className='args-panel'>
                        <h4>Arguments</h4>
                        {argsFrame()}
                    </Col>
                </Row>
            </Content>
        </Layout >
    )
}
