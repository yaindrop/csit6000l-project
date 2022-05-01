declare module 'web' {
    export interface WebModule extends EmscriptenModule {
        FS: typeof FS
        StringVector: new () => WebModule.StringVector
        exec(
            argvec: WebModule.StringVector,
            onProgress: (percentage: number) => void,
        ): Promise<void> | string
    }

    export namespace WebModule {
        export type StringVector = {
            push_back(s: string): void
        }
    }

    const initModule: EmscriptenModuleFactory<WebModule>
    export = initModule
}
