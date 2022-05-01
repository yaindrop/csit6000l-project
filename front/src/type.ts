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
        res.push(args.height ? `${args.height}:` : '100')
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
    return res
}

export function isArgsValid(args: Partial<Arguments>): args is Arguments {
    return !!args.inputFile && !!args.outputFile
}
