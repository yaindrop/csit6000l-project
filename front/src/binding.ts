import 'web/index.data'
import 'web/index.wasm'
import { WebModule } from 'web'
import { parse, resolve } from 'path'

export type Arguments = {
    inputFile: string
    outputFile: string
    // size
    width?: number
    height?: number

    // depth map
    depthFile?: string
    depthMin?: number
    depthMax?: number

    // normals map
    normalsFile?: string

    // raytracing
    bounces?: number
    shadows?: boolean

    // supersampling
    jitter?: boolean
    filter?: boolean

    // renderer
    rayCasting?: boolean

    // blurring
    blurry: number

    pixelated?: boolean
}

export function argsToFlags(args: Arguments): string[] {
    const res: string[] = []
    if (args.inputFile) {
        res.push('-input')
        res.push(args.inputFile)
    }
    if (args.outputFile) {
        res.push('-output')
        res.push(args.outputFile)
    }
    if (args.width || args.height) {
        res.push('-size')
        res.push(args.width ? `${args.width}` : '100')
        res.push(args.height ? `${args.height}` : '100')
    }
    if (args.bounces) {
        res.push('-bounces')
        res.push(`${args.bounces}`)
    }
    if (args.shadows) {
        res.push('-shadows')
    }
    if (args.jitter) {
        res.push('-jitter')
    }
    if (args.filter) {
        res.push('-filter')
    }
    if (args.rayCasting) {
        res.push('-casting')
    }
    if (args.blurry) {
        res.push(`-blurry`)
        res.push(`${args.blurry}`)
    }
    if (args.pixelated) {
        res.push('-pixelated')
    }
    return res
}

export function isArgsValid(args: Partial<Arguments>): args is Arguments {
    return !!args.inputFile && !!args.outputFile
}

export const defaultArguments: Partial<Arguments> = {
    outputFile: 'output/1.bmp',
    width: 100,
    height: 100,
    bounces: 4,
}

export function parseModuleArgs(module: WebModule, args: string[]): WebModule.StringVector {
    const argvec = new module.StringVector()
    for (const s of args)
        argvec.push_back(s)
    return argvec
}

export type PathTreeNode = {
    path: string
    children?: PathTreeNode[]
}

export function rootDirectories({ FS }: WebModule) {
    return (FS.readdir('/') as string[]).filter(p => p !== '.' && p !== '..')
}

export function recursivelyMkdirForPath(
    { FS }: WebModule,
    path: string,
): void {
    const parents = parse(path).dir.split('/').filter(p => p.length)
    let current = '/'
    for(const p of parents) {
        if ((FS.readdir(current) as string[]).indexOf(p) < 0) {
            FS.mkdir(current + p)
        }
        current += p + '/'
    }
}

export function walkModuleFileSystem(
    { FS }: WebModule,
    root: string,
): PathTreeNode {
    const res: PathTreeNode = { path: root }
    for (const stack: PathTreeNode[] = [res]; stack.length;) {
        const node = stack.pop()!
        const { mode } = FS.lookupPath(node.path, {}).node as any
        if (FS.isDir(mode)) {
            node.children = []
            const dirChildren = (FS.readdir(node.path) as string[]).sort()
            for (const child of dirChildren) {
                if (child === '.' || child === '..')
                    continue
                const childNode = { path: `${node.path}/${child}`, parent: node }
                node.children.push(childNode)
                stack.push(childNode)
            }
        }
    }
    return res
}

export function filterPathTree(tree: PathTreeNode, predicate: (node: PathTreeNode) => boolean) {
    for (let stack: PathTreeNode[] = [tree]; stack.length;) {
        const node = stack.pop()!
        if (node.children) {
            node.children = node.children.filter(predicate)
            stack = stack.concat(node.children)
        }
    }
}
