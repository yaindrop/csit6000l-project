import { CstNode, IToken } from "chevrotain"
import { expect, isDefinedWithLength, isDefinedWithLengthLeast, isDefinedNonEmpty } from "src/utils"
import { AstType, AstNode, BindedCstNode, PerspectiveCamera, SceneAstError, Lights, DirectionalLight, PointLight, Materials, Material, Noise, Background, Object3d, Group, Sphere, Triangle, TriangleMesh, Transform, Scene, AstNodeOf, Vector3Entry, expectEntryList, expectIdentifier, expectInlineEntry, expectMultiLineEntry, expectNumeric, NumberEntry, expectText, TextEntry, Plane } from "./ast"
import { EntryNode, InlineEntryNode, MultiLineEntryNode, RootNode } from "./cst"

type PartialNode<T extends AstType> = Partial<AstNodeOf<T>> & AstNode<CstNode>

function partial<T extends AstType>(type: T): PartialNode<T> {
    return { type, ...partial } as PartialNode<T>
}
function assertFilled<T extends AstType>(node: PartialNode<T>): asserts node is AstNodeOf<T> {
    // todo    
}
function bind<C extends CstNode, A extends AstNode<C>>(ast: A, cst: C) {
    const bindedCst = cst as BindedCstNode<C, A>
    ast.cst = bindedCst
    bindedCst.ast = ast
}
function distinct<T = any>() {
    const seen = new Set<T>()
    return function (id: T) {
        if (seen.has(id))
            return false
        seen.add(id)
        return true
    }
}

export function parseNumberEntry(node: InlineEntryNode): NumberEntry {
    const { Argument } = node.children
    expect(Argument, isDefinedWithLength(1), SceneAstError, node, 'Expects a number')
    const res = partial(AstType.NumberEntry)
    res.id = expectIdentifier(node)
    res.numeric = Argument.map(expectNumeric)[0]
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseVector3Entry(node: InlineEntryNode): Vector3Entry {
    const { Argument } = node.children
    expect(Argument, isDefinedWithLength(3), SceneAstError, node, 'Expects a 3D vector')
    const res = partial(AstType.Vector3Entry)
    res.id = expectIdentifier(node)
    res.numerics = Argument.map(expectNumeric) as [IToken, IToken, IToken]
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseTextEntry(node: InlineEntryNode): TextEntry {
    const { Argument } = node.children
    expect(Argument, isDefinedWithLength(1), SceneAstError, node, 'Expects a string')
    const res = partial(AstType.TextEntry)
    res.id = expectIdentifier(node)
    res.text = Argument.map(expectText)[0]
    assertFilled(res)
    bind(res, node)
    return res
}

export function entryListLength(entries: EntryNode[], name: string): NumberEntry {
    const ie = expectInlineEntry(entries[0])
    const res = parseNumberEntry(ie)
    expect(res, e => e.id.image === name, SceneAstError, ie, 'Expects length of the list')
    return res
}



// Entries
export function parsePerspectiveCamera(node: MultiLineEntryNode): PerspectiveCamera {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLength(4), SceneAstError, list, 'Expects 4 arguments for PerspectiveCamera (center, direction, up, angle)')
    const res = partial(AstType.PerspectiveCamera)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'center') {
            res.center = parseVector3Entry(ie)
        } else if (name === 'direction') {
            res.direction = parseVector3Entry(ie)
        } else if (name === 'up') {
            res.up = parseVector3Entry(ie)
        } else if (name === 'angle') {
            res.angle = parseNumberEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}

export function parseLights(node: MultiLineEntryNode): Lights {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLengthLeast(1), SceneAstError, list, 'Expects at least 1 argument for Lights (numLights)')
    const res = partial(AstType.Lights)
    res.numLights = entryListLength(Entry, 'numLights')
    res.lights = []
    for (let i = 1; i < Entry.length; ++i) {
        const me = expectMultiLineEntry(Entry[i]), name = expectIdentifier(me).image
        if (name === 'DirectionalLight') {
            res.lights.push(parseDirectionalLight(me))
        } else if (name === 'PointLight') {
            res.lights.push(parsePointLight(me))
        } else {
            throw new SceneAstError(me, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseDirectionalLight(node: MultiLineEntryNode): DirectionalLight {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLength(2), SceneAstError, list, 'Expects 2 arguments for DirectionalLight (direction, color)')
    const res = partial(AstType.DirectionalLight)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'direction') {
            res.direction = parseVector3Entry(ie)
        } else if (name === 'color') {
            res.color = parseVector3Entry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parsePointLight(node: MultiLineEntryNode): PointLight {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLengthLeast(2), SceneAstError, list, 'Expects at least 2 arguments for PointLight (position, color, falloff?)')
    const res = partial(AstType.PointLight)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'position') {
            res.position = parseVector3Entry(ie)
        } else if (name === 'color') {
            res.color = parseVector3Entry(ie)
        } else if (name === 'falloff') {
            res.falloff = parseNumberEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}

export function parseMaterials(node: MultiLineEntryNode): Materials {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLengthLeast(2), SceneAstError, list, 'Expects at least 1 argument for Materials (numMaterials)')
    const res = partial(AstType.Materials)
    res.numMaterials = entryListLength(Entry, 'numMaterials')
    res.materials = []
    for (let i = 1; i < Entry.length; ++i) {
        const me = expectMultiLineEntry(Entry[i]), name = expectIdentifier(me).image
        if (name === 'PhongMaterial' || name === 'Material') {
            res.materials.push(parseMaterial(me))
        } else {
            throw new SceneAstError(me, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseMaterial(node: MultiLineEntryNode): Material {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedNonEmpty, SceneAstError, list, 'Expects non-empty arguments for Material')
    const res = partial(AstType.Material)
    const isDistinct = distinct()
    for (const e of Entry) {
        const { InlineEntry } = e.children
        if (isDefinedNonEmpty(InlineEntry)) {
            const [ie] = InlineEntry, name = expectIdentifier(ie).image
            expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
            if (name === 'diffuseColor') {
                res.diffuseColor = parseVector3Entry(ie)
            } else if (name === 'specularColor') {
                res.specularColor = parseVector3Entry(ie)
            } else if (name === 'shininess') {
                res.shininess = parseNumberEntry(ie)
            } else if (name === 'refractionIndex') {
                res.refractionIndex = parseNumberEntry(ie)
            } else if (name === 'texture') {
                res.texture = parseTextEntry(ie)
            } else if (name === 'normal') {
                res.normal = parseTextEntry(ie)
            } else {
                throw new SceneAstError(ie, `Unexpected argument "${name}"`)
            }
        } else {
            const me = expectMultiLineEntry(e), name = expectIdentifier(me).image
            expect(name, isDistinct, SceneAstError, me)
            if (name === 'Noise') {
                res.noise = parseNoise(me)
            } else {
                throw new SceneAstError(me, `Unexpected argument "${name}"`)
            }
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseNoise(node: MultiLineEntryNode): Noise {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedNonEmpty, SceneAstError, list, 'Expects non-empty arguments for Noise')
    const res = partial(AstType.Noise)
    let colorIdx = 0
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        if (name === 'color') {
            if (colorIdx === 0) {
                res.color0 = parseVector3Entry(ie)
            } else if (colorIdx === 1) {
                res.color1 = parseVector3Entry(ie)
            } else {
                throw new SceneAstError(ie, `Unexpected argument "${name}"`)
            }
            ++colorIdx
        } else if (name === 'amplitude') {
            res.amplitude = parseNumberEntry(ie)
        } else if (name === 'frequency') {
            res.frequency = parseNumberEntry(ie)
        } else if (name === 'octaves') {
            res.octaves = parseNumberEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}

export function parseBackground(node: MultiLineEntryNode): Background {
    const list = expectEntryList(node), { Entry } = list.children
    const res = partial(AstType.Background)
    if (!isDefinedNonEmpty(Entry))
        return res
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'ambientLight') {
            res.ambientLight = parseVector3Entry(ie)
        } else if (name === 'color') {
            res.color = parseVector3Entry(ie)
        } else if (name === 'cubeMap') {
            res.cubeMap = parseTextEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}

export function parseObject3d(node: MultiLineEntryNode): Object3d {
    const name = expectIdentifier(node).image
    if (name === 'Group') {
        return parseGroup(node)
    } else if (name === 'Sphere') {
        return parseSphere(node)
    } else if (name === 'Plane') {
        return parsePlane(node)
    } else if (name === 'Triangle') {
        return parseTriangle(node)
    } else if (name === 'TriangleMesh') {
        return parseTriangleMesh(node)
    } else if (name === 'Transform') {
        return parseTransform(node)
    } else {
        throw new SceneAstError(node, `Unexpected argument "${name}"`)
    }
}
export function parseGroup(node: MultiLineEntryNode): Group {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLengthLeast(1), SceneAstError, list, 'Expects at least 1 arguments for Group (numObjects)')
    const res = partial(AstType.Group)
    res.numObjects = entryListLength(Entry, 'numObjects')
    res.objects = []
    for (let i = 1; i < Entry.length; ++i) {
        const { MultiLineEntry } = Entry[i].children
        if (isDefinedNonEmpty(MultiLineEntry)) {
            const [me] = MultiLineEntry
            res.objects.push(parseObject3d(me))
        } else {
            const ie = expectInlineEntry(Entry[i]), name = expectIdentifier(ie).image
            if (name === 'MaterialIndex') {
                const materialIndex = partial(AstType.MaterialIndex)
                materialIndex.index = parseNumberEntry(ie)
                assertFilled(materialIndex)
                bind(materialIndex, ie)
                res.objects.push(materialIndex)
            } else {
                throw new SceneAstError(ie, `Unexpected argument "${name}"`)
            }
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseSphere(node: MultiLineEntryNode): Sphere {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLength(2), SceneAstError, list, 'Expects 2 arguments for Sphere (center, radius)')
    const res = partial(AstType.Sphere)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'center') {
            res.center = parseVector3Entry(ie)
        } else if (name === 'radius') {
            res.radius = parseNumberEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parsePlane(node: MultiLineEntryNode): Plane {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLength(2), SceneAstError, list, 'Expects 2 arguments for Plane (normal, offset)')
    const res = partial(AstType.Plane)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'normal') {
            res.normal = parseVector3Entry(ie)
        } else if (name === 'offset') {
            res.offset = parseNumberEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseTriangle(node: MultiLineEntryNode): Triangle {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLength(3), SceneAstError, list, 'Expects 3 arguments for Triangle (vertex0, vertex1, vertex2)')
    const res = partial(AstType.Triangle)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'vertex0') {
            res.vertex0 = parseVector3Entry(ie)
        } else if (name === 'vertex1') {
            res.vertex1 = parseVector3Entry(ie)
        } else if (name === 'vertex2') {
            res.vertex2 = parseVector3Entry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseTriangleMesh(node: MultiLineEntryNode): TriangleMesh {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLength(1), SceneAstError, list, 'Expects at least 1 argument for TriangleMesh (obj_file)')
    const res = partial(AstType.TriangleMesh)
    const isDistinct = distinct()
    for (const e of Entry) {
        const ie = expectInlineEntry(e), name = expectIdentifier(ie).image
        expect(name, isDistinct, SceneAstError, ie, 'Expects distinct arguments')
        if (name === 'obj_file') {
            res.objFile = parseTextEntry(ie)
        } else {
            throw new SceneAstError(ie, `Unexpected argument "${name}"`)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}
export function parseTransform(node: MultiLineEntryNode): Transform {
    const list = expectEntryList(node), { Entry } = list.children
    expect(Entry, isDefinedWithLengthLeast(1), SceneAstError, list, 'Expects at least 1 argument for Transform')
    const res = partial(AstType.Transform)
    for (const e of Entry) {
        const { InlineEntry } = e.children
        if (isDefinedNonEmpty(InlineEntry)) {
            const [ie] = InlineEntry, name = expectIdentifier(ie).image
            if (name === 'Scale') {
                res.scale = parseVector3Entry(ie)
            } else if (name === 'Translate') {
                res.translate = parseVector3Entry(ie)
            } else if (name === 'UniformScale') {
                res.uniformScale = parseNumberEntry(ie)
            } else if (name === 'XRotate') {
                res.xRotate = parseNumberEntry(ie)
            } else if (name === 'YRotate') {
                res.yRotate = parseNumberEntry(ie)
            } else if (name === 'ZRotate') {
                res.zRotate = parseNumberEntry(ie)
            } else {
                throw new SceneAstError(ie, `Unexpected argument "${name}"`)
            }
        } else {
            const me = expectMultiLineEntry(e)
            res.object = parseObject3d(me)
        }
    }
    assertFilled(res)
    bind(res, node)
    return res
}

export function parseRoot(node: RootNode): Scene {
    const { children: { Entry } } = node
    expect(Entry, isDefinedWithLength(5), SceneAstError, node, 'Expects 5 segments for Scene (PerspectiveCamera, Lights, Materials, Background, Group)')
    const res = partial(AstType.Scene)
    for (const e of Entry) {
        const me = expectMultiLineEntry(e), name = expectIdentifier(me).image
        if (name === 'PerspectiveCamera')
            res.perspectiveCamera = parsePerspectiveCamera(me)
        else if (name === 'Lights')
            res.lights = parseLights(me)
        else if (name === 'Materials')
            res.materials = parseMaterials(me)
        else if (name === 'Background')
            res.background = parseBackground(me)
        else if (name === 'Group')
            res.group = parseGroup(me)
        else
            throw new SceneAstError(me, `Unexpected argument "${name}"`)
    }
    assertFilled(res)
    bind(res, node)
    return res
}
