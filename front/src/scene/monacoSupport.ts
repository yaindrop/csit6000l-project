import * as monaco from 'monaco-editor';
import { IToken } from "chevrotain";
import { AstType, bindedTo, expectIdentifier, isBinded, isCstNode, visitCst } from "./ast";
import { InlineEntryNode, MultiLineEntryNode } from "./cst";
import { sceneModelParsed } from "src/store";
import { hasKey } from "src/utils"

const colors = {
    "black": "#1b1f23",
    "white": "#fff",
    "gray": ["#fafbfc", "#f6f8fa", "#e1e4e8", "#d1d5da", "#959da5", "#6a737d", "#586069", "#444d56", "#2f363d", "#24292e"],
    "blue": ["#f1f8ff", "#dbedff", "#c8e1ff", "#79b8ff", "#2188ff", "#0366d6", "#005cc5", "#044289", "#032f62", "#05264c"],
    "green": ["#f0fff4", "#dcffe4", "#bef5cb", "#85e89d", "#34d058", "#28a745", "#22863a", "#176f2c", "#165c26", "#144620"],
    "yellow": ["#fffdef", "#fffbdd", "#fff5b1", "#ffea7f", "#ffdf5d", "#ffd33d", "#f9c513", "#dbab09", "#b08800", "#735c0f"],
    "orange": ["#fff8f2", "#ffebda", "#ffd1ac", "#ffab70", "#fb8532", "#f66a0a", "#e36209", "#d15704", "#c24e00", "#a04100"],
    "red": ["#ffeef0", "#ffdce0", "#fdaeb7", "#f97583", "#ea4a5a", "#d73a49", "#cb2431", "#b31d28", "#9e1c23", "#86181d"],
    "purple": ["#f5f0ff", "#e6dcfd", "#d1bcf9", "#b392f0", "#8a63d2", "#6f42c1", "#5a32a3", "#4c2889", "#3a1d6e", "#29134e"],
    "pink": ["#ffeef8", "#fedbf0", "#f9b3dd", "#f692ce", "#ec6cb9", "#ea4aaa", "#d03592", "#b93a86", "#99306f", "#6d224f"]
}

export function monarchTokensProvider(): monaco.languages.IMonarchLanguage {
    return {
        tokenizer: {
            root: [
                [/[a-zA-Z_$][a-zA-Z_$0-9]*/, 'Identifier'],
                [/[+-]?(?:\d*\.)?\d+/, 'Numeric'],
                [/[^{}\s]+/, 'Text'],
            ]
        }
    }
}

export function sceneDefinitionTheme(): monaco.editor.IStandaloneThemeData {
    return {
        base: 'vs',
        inherit: false,
        rules: [
            // simple syntax
            { token: 'Identifier', foreground: colors.blue[4] },
            { token: 'Numeric', foreground: colors.pink[4] },
            { token: 'Text', foreground: colors.purple[4] },
            // semantic
            { token: legendType(AstType.PerspectiveCamera), foreground: colors.blue[3], fontStyle: 'bold' },

            { token: legendType(AstType.Lights), foreground: colors.orange[3], fontStyle: 'bold' },
            { token: legendType(AstType.DirectionalLight), foreground: colors.orange[5] },
            { token: legendType(AstType.PointLight), foreground: colors.orange[7] },

            { token: legendType(AstType.Background), foreground: colors.green[3], fontStyle: 'bold' },

            { token: legendType(AstType.Materials), foreground: colors.pink[3], fontStyle: 'bold' },
            { token: legendType(AstType.Material), foreground: colors.pink[5], fontStyle: 'bold' },

            { token: legendType(AstType.Group), foreground: colors.purple[3], fontStyle: 'bold' },
            { token: legendType(AstType.MaterialIndex), foreground: colors.pink[3] },
            { token: legendType(AstType.TriangleMesh), foreground: colors.purple[7] },
            { token: legendType(AstType.Plane), foreground: colors.purple[5] },
            { token: legendType(AstType.Sphere), foreground: colors.purple[5] },
            { token: legendType(AstType.Transform), foreground: colors.purple[5], fontStyle: 'bold' },
            { token: legendType(AstType.Triangle), foreground: colors.purple[5] },

            { token: legendType(AstType.NumberEntry), foreground: colors.gray[5], fontStyle: 'italic' },
            { token: legendType(AstType.Vector3Entry), foreground: colors.gray[5], fontStyle: 'italic' },
            { token: legendType(AstType.TextEntry), foreground: colors.gray[5], fontStyle: 'italic' },
        ],
        colors: {
            'editor.foreground': '#000000'
        }
    }
}

export function legendType(type: AstType) {
    return semanticTokensLegend.tokenTypes[type]
}
export const semanticTokensLegend = {
    tokenTypes: [
        'Scene',

        'PerspectiveCamera',

        'Lights',
        'DirectionalLight',
        'PointLight',

        'Materials',
        'Material',
        'Noise',

        'Background',

        'Group',
        'MaterialIndex',
        'TriangleMesh',
        'Plane',
        'Sphere',
        'Transform',
        'Triangle',

        'NumberEntry',
        'VectorEntry',
        'TextEntry',
    ],
    tokenModifiers: [
        'normal',
    ]
};

export function semanticTokensProvider(): monaco.languages.DocumentSemanticTokensProvider {
    return {
        getLegend: function () {
            return semanticTokensLegend;
        },
        provideDocumentSemanticTokens: function (model, lastResultId, token) {
            const data: number[] = [];

            const uri = model.uri.toString()
            if (!sceneModelParsed.has(uri))
                return
            const [cst] = sceneModelParsed.get(uri)!

            const dataTokens: [IToken, number, number][] = []
            visitCst(cst, e => {
                if (!isCstNode(e) || !isBinded(e))
                    return
                let type = e.ast.type
                let tokens: IToken[] = []
                if (hasKey(e.children, 'Identifier')) {
                    tokens.push(expectIdentifier(e as (InlineEntryNode | MultiLineEntryNode)))
                }
                if (bindedTo(e, AstType.PerspectiveCamera)) {

                } else if (bindedTo(e, AstType.Lights)) {

                } else if (bindedTo(e, AstType.DirectionalLight)) {

                } else if (bindedTo(e, AstType.PointLight)) {

                } else if (bindedTo(e, AstType.Background)) {

                } else if (bindedTo(e, AstType.Materials)) {

                } else if (bindedTo(e, AstType.Material)) {
                    const diffuseColor = expectIdentifier(e.ast.diffuseColor.cst)
                    tokens.push(diffuseColor)
                } else if (bindedTo(e, AstType.Group)) {

                } else if (bindedTo(e, AstType.NumberEntry)) {
                    tokens.push(e.ast.numeric)
                } else if (bindedTo(e, AstType.Vector3Entry)) {
                    tokens.push(...e.ast.numerics)
                } else if (bindedTo(e, AstType.TextEntry)) {
                    tokens.push(e.ast.text)
                }
                for (const token of tokens) {
                    dataTokens.push([token, type, 0])
                }
            })

            dataTokens.sort(([t0], [t1]) => t0.startLine! === t1.startLine! ? t0.startColumn! - t1.startColumn! : t0.startLine! - t1.startLine!)
            let prevLine = 0, prevColumn = 0
            for (const [{ startLine, startColumn, image }, type, modifier] of dataTokens) {
                const l = startLine! - 1, c = startColumn! - 1
                data.push(
                    l - prevLine,
                    c - (l === prevLine ? prevColumn : 0),
                    image.length,
                    type,
                    modifier
                )
                prevLine = l
                prevColumn = c
            }

            console.debug('Semanic tokens generated', dataTokens, data)

            return {
                data: new Uint32Array(data)
            }
        },
        releaseDocumentSemanticTokens: function (resultId) { }
    }
}
