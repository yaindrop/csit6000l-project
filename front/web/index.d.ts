declare module 'web' {
    export enum ModuleEventType {
        Progress = 0,
    }
    
    export type ModuleProgressEvent = {
        type: ModuleEventType.Progress
        percentage: number
    }
    
    export type ModuleEvent = ModuleProgressEvent

    export interface WebModule extends EmscriptenModule {
        FS: typeof FS
        StringVector: new () => WebModule.StringVector
        exec(
            argvec: WebModule.StringVector,
            callback: (event: ModuleProgressEvent) => number, // return 0 for continue, 1 for exit
            callbackFreq: number
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
