import { CstNodeLocation } from 'chevrotain'
import * as monaco from 'monaco-editor'
import { useEffect, useRef, useState } from 'react'

export type Vector3 = [number, number, number]

export type KeyofWithType<T, U> = {
    [P in keyof T]: T[P] extends U ? P : never
}[keyof T]

export type Constructor<T = {}> = new (...args: any[]) => T

export function isDefinedNonEmpty<T>(arr: T[] | undefined): arr is T[] {
    return arr !== undefined && arr.length !== 0
}
export function isDefinedWithLength<T>(length: number): (arr: T[] | undefined) => arr is T[] {
    return function (arr): arr is T[] {
        return arr !== undefined && arr.length === length
    }
}
export function isDefinedWithLengthLeast<T>(length: number): (arr: T[] | undefined) => arr is T[] {
    return function (arr): arr is T[] {
        return arr !== undefined && arr.length >= length
    }
}

export function expect<T, F extends T, E extends Error, ErrorArgs extends any[]>(
    v: T,
    assertion: (v: T) => v is F,
    ElseError: new (...args: ErrorArgs) => E,
    ...errorArgs: ErrorArgs
): asserts v is F
export function expect<T, E extends Error, ErrorArgs extends any[]>(
    v: T,
    assertion: (v: T) => boolean,
    ElseError: new (...args: ErrorArgs) => E,
    ...errorArgs: ErrorArgs
): void
export function expect<T, E extends Error, ErrorArgs extends any[]>(
    v: T,
    assertion: (v: T) => boolean,
    ElseError: new (...args: ErrorArgs) => E,
    ...errorArgs: ErrorArgs
) {
    if (!assertion(v)) {
        throw new ElseError(...errorArgs)
    }
}

export function clamp(min: number, max: number, n: number): number {
    return Math.max(min, Math.min(n, max))
}

export function hasKey<T extends {}, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}

export function ifNonEmpty<T>(arr: T[]): T[] | undefined {
    return arr.length ? arr : undefined
}

type CodeEditor = monaco.editor.IStandaloneCodeEditor
export function useEditor(
    options?: monaco.editor.IStandaloneEditorConstructionOptions,
    override?: monaco.editor.IEditorOverrideServices,
): [React.RefObject<HTMLDivElement>, CodeEditor | undefined] {
    const divRef = useRef<HTMLDivElement>(null)
    const [editor, setEditor] = useState<CodeEditor>()
    useEffect(() => {
        if (divRef.current) {
            setEditor(monaco.editor.create(divRef.current, options, override))
        }
        return () => {
            editor?.dispose()
        }
    }, [])
    return [divRef, editor]
}

export function cstLocationToMonacoRange(location: CstNodeLocation): monaco.Range {
    const { startLine, startColumn, endLine, endColumn } = location
    if (!(startLine && startColumn && endLine && endColumn))
        throw new Error()
    return new monaco.Range(startLine, startColumn, endLine, endColumn + 1)
}
