import { createToken, Lexer } from 'chevrotain'

export const LCurly = createToken({ name: "LCurly", pattern: /{/ });
export const RCurly = createToken({ name: "RCurly", pattern: /}/ });
export const Text = createToken({ name: "Text", pattern: /[^{}\s]+/ })
export const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z_$][a-zA-Z_$0-9]*/, longer_alt: Text });
export const Numeric = createToken({ name: "Numeric", pattern: /[+-]?(?:\d*\.)?\d+/, longer_alt: Text });
export const Space = createToken({
    name: "Space",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const tokens = [
    LCurly,
    RCurly,
    Identifier,
    Numeric,
    Text,
    Space
]

export const lexer = new Lexer(tokens, {
    // Less position info tracked, reduces verbosity of the playground output.
    positionTracking: "full"
});
