import { Button, Cascader, Col, Divider, Form, Input, InputNumber, Layout, PageHeader, Progress, Radio, Row, Select, Switch, TreeDataNode, TreeSelect } from 'antd';
import { Content, Header } from 'antd/lib/layout/layout';
import * as monaco from 'monaco-editor';
import React, { ChangeEvent, Component, useEffect, useRef, useState } from 'react';
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
import { clamp } from './utils';

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

const MAX_SIZE = 4096
const MIN_SIZE = 1

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
    outputFile: 'out.bmp',
    width: 100,
    height: 100,
    bounces: 4,
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
            setInputFileTree([tree])
        }
    }, [module])

    function displayImage(module: WebModule, outputFile: string) {
        setImgUrl(URL.createObjectURL(
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

        const flags = argsToFlags(moduleArgs)
        setModuleCommand(['./proj', ...flags].join(' '))
        const argvec = parseModuleArgs(module, argsToFlags(moduleArgs))

        const execHandle = module.exec(argvec, e => setModuleStatus(e.percentage))
        setModuleRunning(true)
        if (typeof execHandle === "object") {
            execHandle.then(() => {
                displayImage(module, moduleArgs.outputFile)
                setModuleRunning(false)
            })
        } else {
            displayImage(module, moduleArgs.outputFile)
            setModuleRunning(false)
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
    function inputFileCascaderDisplayRender(labels: string[], selectedOptions: DefaultOptionType[] | undefined) {
        return labels.map((label, i) => {
            return selectedOptions && <span key={selectedOptions[i].value}>{i !== 0 && '/'}{label}</span>
        })
    }
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
                    displayRender={inputFileCascaderDisplayRender}
                    value={inputFileSelectValue}
                    // status={inputFileSelectStatus}
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
            height = clamp(MIN_SIZE, MAX_SIZE, Math.round(newWidth / sizeLinkRatio))
        } else if (!height) {
            height = newWidth
        }
        width = newWidth
        updateModuleArgs({ width, height })
    }
    function updateLinkedHeight(newHeight: number) {
        let { width, height } = moduleArgs
        if (width && height) {
            width = clamp(1, MAX_SIZE, Math.round(newHeight * sizeLinkRatio))
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
                    min={MIN_SIZE}
                    max={MAX_SIZE}
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
                    min={MIN_SIZE}
                    max={MAX_SIZE}
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
            <Form labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}>
                {inputFileSelect()}
                {outputFileInput()}
                {sizeInputs()}

                {rendererSelect()}
                {moduleArgs.rayCasting ? rayCasterOptions() : rayTracerOptions()}

                {samplingOptions()}
            </Form>
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
                        {argsForm()}
                        {moduleCommand ? renderingCommand() : undefined}
                    </Col>
                </Row>
            </Content>
        </Layout >
    )
}
