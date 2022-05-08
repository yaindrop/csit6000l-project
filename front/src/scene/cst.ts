
/**
  * This file is generated with meta-chevrotain
  */

import { CstNode, IToken } from 'chevrotain'

export interface EntryListNode extends CstNode {
    readonly children: {
        LCurly?: IToken[]
        RCurly?: IToken[]
        Entry?: EntryNode[]
    }
}

export interface MultiLineEntryNode extends CstNode {
    readonly children: {
        Identifier?: IToken[]
        EntryList?: EntryListNode[]
    }
}

export interface ArgumentNode extends CstNode {
    readonly children: {
        Numeric?: IToken[]
        Identifier?: IToken[]
        Text?: IToken[]
    }
}

export interface InlineEntryNode extends CstNode {
    readonly children: {
        Identifier?: IToken[]
        Argument?: ArgumentNode[]
    }
}

export interface EntryNode extends CstNode {
    readonly children: {
        MultiLineEntry?: MultiLineEntryNode[]
        InlineEntry?: InlineEntryNode[]
    }
}

export interface RootNode extends CstNode {
    readonly children: {
        Entry?: EntryNode[]
    }
}
