import { ILexingError, IRecognitionException, Lexer } from "chevrotain"
import { ifNonEmpty } from "src/utils"
import { Scene, SceneAstError } from "./ast"
import { parseRoot } from "./astParser"
import { RootNode } from "./cst"
import { SceneParser } from "./cstParser"

type FullParseResult = {
    lexError?: ILexingError[]
    cstError?: IRecognitionException[]
    astError?: SceneAstError
    cst?: RootNode
    ast?: Scene
}

export function fullParse(cstLexer: Lexer, cstParser: SceneParser, text: string): FullParseResult {
    const res: FullParseResult = {}
    const lexed = cstLexer.tokenize(text)
    res.lexError = ifNonEmpty(lexed.errors)
    if (res.lexError)
        return res
    cstParser.input = lexed.tokens
    res.cstError = ifNonEmpty(cstParser.errors)
    if (res.cstError)
        return res
    res.cst = cstParser.Root()
    try {
        res.ast = parseRoot(res.cst)
    } catch (e: any) {
        res.astError = e
    }
    return res
}
