import { CstElement, CstNode, CstNodeLocation, IToken } from 'chevrotain';
import { isDefinedNonEmpty, isDefinedWithLength, expect, hasKey } from 'src/utils';
import { ArgumentNode, EntryListNode, EntryNode, InlineEntryNode, MultiLineEntryNode, RootNode } from './cst';

export class SceneAstError extends Error {
    constructor(public node: CstNode, msg?: string) {
        super(msg)
        // debugger
    }
}

export enum AstType {
    Scene,

    PerspectiveCamera,

    Lights,
    DirectionalLight,
    PointLight,

    Materials,
    Material,
    Noise,

    Background,

    Group,
    MaterialIndex,
    TriangleMesh,
    Plane,
    Sphere,
    Transform,
    Triangle,

    NumberEntry,
    Vector3Entry,
    TextEntry,
}

export type AnyAstNode = Scene
    | PerspectiveCamera
    | Lights | DirectionalLight | PointLight
    | Materials | Material | Noise
    | Background
    | Object3d | MaterialIndex
    | NumberEntry | Vector3Entry | TextEntry

export type AstNodeOf<T extends AstType> = Extract<AnyAstNode, { type: T }>
export type CstNodeOf<T extends AstType> = AstNodeOf<T>['cst']

export interface AstNode<C extends CstNode> {
    type: AstType
    cst: BindedCstNode<C, this>
}
export type BindedCstNode<C extends CstNode, A extends AstNode<C>> = C & {
    ast: A
}
export function isBinded(cst: CstNode): cst is AnyAstNode['cst'] {
    return hasKey(cst, 'ast')
}
export function bindedTo<T extends AstType>(cst: CstNodeOf<AstType>, type: T): cst is CstNodeOf<T> {
    return cst.ast.type === type
}
export function isBindedTo<T extends AstType>(cst: CstNode, type: T): cst is CstNodeOf<T> {
    return hasKey(cst, 'ast') && (cst.ast as AnyAstNode).type === type
}

export interface Scene extends AstNode<RootNode> {
    type: AstType.Scene
    perspectiveCamera: PerspectiveCamera
    lights: Lights
    background: Background
    materials: Materials
    group: Group
}

export interface PerspectiveCamera extends AstNode<MultiLineEntryNode> {
    type: AstType.PerspectiveCamera
    center: Vector3Entry
    direction: Vector3Entry
    up: Vector3Entry
    angle: NumberEntry
}

export interface Lights extends AstNode<MultiLineEntryNode> {
    type: AstType.Lights
    numLights: NumberEntry,
    lights: (DirectionalLight | PointLight)[]
}
export interface DirectionalLight extends AstNode<MultiLineEntryNode> {
    type: AstType.DirectionalLight
    cst: BindedCstNode<MultiLineEntryNode, this>
    direction: Vector3Entry
    color: Vector3Entry
}
export interface PointLight extends AstNode<MultiLineEntryNode> {
    type: AstType.PointLight
    position: Vector3Entry
    color: Vector3Entry
    falloff?: NumberEntry
}

export interface Background extends AstNode<MultiLineEntryNode> {
    type: AstType.Background
    cst: BindedCstNode<MultiLineEntryNode, this>
    color?: Vector3Entry
    ambientLight?: Vector3Entry
    cubeMap?: TextEntry
}

export interface Materials extends AstNode<MultiLineEntryNode> {
    type: AstType.Materials
    numMaterials: NumberEntry
    materials: Material[]
}
export interface Material extends AstNode<MultiLineEntryNode> {
    type: AstType.Material
    diffuseColor: Vector3Entry
    specularColor?: Vector3Entry
    shininess?: NumberEntry
    refractionIndex?: NumberEntry
    texture?: TextEntry
    normal?: TextEntry
    cubeMap?: TextEntry
    noise?: Noise
}
export interface Noise extends AstNode<MultiLineEntryNode> {
    type: AstType.Noise
    octaves: NumberEntry
    color0?: Vector3Entry
    color1?: Vector3Entry
    frequency?: NumberEntry
    amplitude?: NumberEntry
}

export type Object3d = Group | Sphere | Plane | Triangle | TriangleMesh | Transform
export interface Group extends AstNode<MultiLineEntryNode> {
    type: AstType.Group
    numObjects: NumberEntry
    objects: (Object3d | MaterialIndex)[]
}
export interface MaterialIndex extends AstNode<InlineEntryNode> {
    type: AstType.MaterialIndex
    index: NumberEntry
}
export interface TriangleMesh extends AstNode<MultiLineEntryNode> {
    type: AstType.TriangleMesh
    objFile: TextEntry
}
export interface Plane extends AstNode<MultiLineEntryNode> {
    type: AstType.Plane
    normal: Vector3Entry
    offset: NumberEntry
}
export interface Sphere extends AstNode<MultiLineEntryNode> {
    type: AstType.Sphere
    center: Vector3Entry
    radius: NumberEntry
}
export interface Transform extends AstNode<MultiLineEntryNode> {
    type: AstType.Transform
    translate?: Vector3Entry
    xRotate?: NumberEntry
    yRotate?: NumberEntry
    zRotate?: NumberEntry
    scale?: Vector3Entry
    uniformScale?: NumberEntry,
    object: Object3d
}
export interface Triangle extends AstNode<MultiLineEntryNode> {
    type: AstType.Triangle
    vertex0: Vector3Entry
    vertex1: Vector3Entry
    vertex2: Vector3Entry
}

export interface NumberEntry extends AstNode<InlineEntryNode> {
    type: AstType.NumberEntry
    id: IToken
    numeric: IToken
}
export interface Vector3Entry extends AstNode<InlineEntryNode> {
    type: AstType.Vector3Entry
    id: IToken
    numerics: [IToken, IToken, IToken]
}
export interface TextEntry extends AstNode<InlineEntryNode> {
    type: AstType.TextEntry
    id: IToken
    text: IToken
}

export function expectNumeric(arg: ArgumentNode): IToken {
    const { Numeric } = arg.children
    expect(Numeric, isDefinedNonEmpty, SceneAstError, arg, 'Expects a Numeric')
    const [res] = Numeric
    return res
}
export function expectText(arg: ArgumentNode): IToken {
    const { Identifier, Text } = arg.children
    if (Identifier && Identifier.length === 1)
        return Identifier[0]
    expect(Text, isDefinedWithLength(1), SceneAstError, arg, 'Expects a Text')
    const [res] = Text
    return res
}
export function expectIdentifier(entry: InlineEntryNode | MultiLineEntryNode): IToken {
    const { Identifier } = entry.children
    expect(Identifier, isDefinedNonEmpty, SceneAstError, entry, 'Expects an Identifier')
    const [id] = Identifier
    return id
}
export function expectLCurly(entry: EntryListNode): IToken {
    const { LCurly } = entry.children
    expect(LCurly, isDefinedNonEmpty, SceneAstError, entry, 'Expects a LCurly')
    const [t] = LCurly
    return t
}
export function expectRCurly(entry: EntryListNode): IToken {
    const { RCurly } = entry.children
    expect(RCurly, isDefinedNonEmpty, SceneAstError, entry, 'Expects a RCurly')
    const [t] = RCurly
    return t
}

export function expectInlineEntry(e: EntryNode): InlineEntryNode {
    const { InlineEntry } = e.children
    expect(InlineEntry, isDefinedNonEmpty, SceneAstError, e, 'Expects an inline entry')
    const [ie] = InlineEntry
    return ie
}
export function expectMultiLineEntry(e: EntryNode): MultiLineEntryNode {
    const { MultiLineEntry } = e.children
    expect(MultiLineEntry, isDefinedNonEmpty, SceneAstError, e, 'Expects an multi-line entry')
    const [me] = MultiLineEntry
    return me
}

export function expectEntryList(me: MultiLineEntryNode) {
    const { EntryList } = me.children
    expect(EntryList, isDefinedNonEmpty, SceneAstError, me, 'Expects an entry list')
    const [list] = EntryList
    return list
}
export function expectEntries(list: EntryListNode) {
    const { Entry } = list.children
    expect(Entry, isDefinedNonEmpty, SceneAstError, list, 'Expects entries')
    return Entry
}

export function isCstNode(e: CstElement): e is CstNode {
    return hasKey(e, 'children')
}

function sortByReversedPosition(e0: CstElement, e1: CstElement): number {
    const l0: CstNodeLocation = isCstNode(e0) ? e0.location! : e0
    const l1: CstNodeLocation = isCstNode(e1) ? e1.location! : e1
    return l1.startOffset - l0.startOffset
}
export function visitCst(cst: CstNode, action: (e: CstElement) => void, matchNames?: Set<string>, skipNames?: Set<string>) {
    for (const stack: CstElement[] = [cst]; stack.length;) {
        const current = stack.pop()!
        action(current)
        if (!isCstNode(current))
            continue
        const allChildren: CstElement[] = []
        for (const [cstNodeName, children] of Object.entries(current.children)) {
            if (skipNames?.has(cstNodeName))
                continue
            if (matchNames && !matchNames.has(cstNodeName))
                continue
            allChildren.push(...children)
        }
        allChildren.sort(sortByReversedPosition)
        stack.push(...allChildren)
    }
}
