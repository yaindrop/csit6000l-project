
/**
  * This file is generated with meta-chevrotain
  */

import { CstParser, IParserConfig, TokenVocabulary } from 'chevrotain'
import { Identifier, LCurly, Numeric, RCurly, Text } from './cstLexer';
import { RootNode } from './cst';
export class SceneParser extends CstParser {
    constructor(tokenVocabulary: TokenVocabulary, config ? : IParserConfig) {
        super(tokenVocabulary, config)
        this.performSelfAnalysis();
    }

    expectSameLineSpaceSep() {
        return this.LA(0).startLine === this.LA(1).startLine &&
            this.LA(0).endColumn! + 1 !== this.LA(1).startColumn
    }
    private EntryList = this.RULE("EntryList", () => {
        this.consume(0, LCurly);
        this.MANY({
            DEF: () => this.subrule(0, this.Entry)
        });
        this.consume(1, RCurly);
    });
    private MultiLineEntry = this.RULE("MultiLineEntry", () => {
        this.consume(0, Identifier);
        this.subrule(0, this.EntryList);
    });
    private Argument = this.RULE("Argument", () => {
        this.or(0, [{
            ALT: () => this.consume(0, Numeric)
        }, {
            ALT: () => this.consume(1, Identifier)
        }, {
            ALT: () => this.consume(2, Text)
        }, ]);
    });
    private InlineEntry = this.RULE("InlineEntry", () => {
        this.consume(0, Identifier);
        this.MANY({
            DEF: () => this.subrule(0, this.Argument),
            GATE: () => this.expectSameLineSpaceSep()
        });
    });
    private Entry = this.RULE("Entry", () => {
        this.or(0, [{
            ALT: () => this.subrule(0, this.MultiLineEntry),
        }, {
            ALT: () => this.subrule(1, this.InlineEntry),
        }, ]);
    });
    public Root = this.RULE("Root", () => {
        this.MANY({
            DEF: () => this.subrule(0, this.Entry)
        });
    }) as () => RootNode;
}
