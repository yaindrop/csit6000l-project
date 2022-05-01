import * as fs from 'fs'
import * as path from 'path'

export function mountContext(
    context: __WebpackModuleApi.RequireContext
): void {
    for (const k of context.keys()) {
        const filename = context.resolve(k).split('!')[1].replace('./', '/')
        if (!filename.length)
            continue
        const content = context(k)['default']
        const dir = path.dirname(filename)
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filename, content)
    }
}

export function lazyMountContext(
    context: __WebpackModuleApi.RequireContext,
    lazyFiles = new Map<string, string>(),
) {
    for (const k of context.keys()) {
        const filename = context.resolve(k).split('!')[1].replace('./', '/')
        if (!filename.length)
            continue
        const content = context(k)['default']
        const dir = path.dirname(filename)
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(filename, '')
        lazyFiles.set(filename, content)
    }
    return lazyFiles
}

export function resolveLazyFileSync(
    path: string,
    lazyFiles: Map<string, string>,
) {
    if (lazyFiles.has(path)) {
        fs.writeFileSync(path, lazyFiles.get(path)!)
        lazyFiles.delete(path)
    }
}

export function* walkFiles(dir: string): Generator<string> {
    const dirents = fs.readdirSync(dir, { withFileTypes: true })
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name)
        if (dirent.isDirectory()) {
            yield* walkFiles(res)
        } else {
            yield res
        }
    }
}
