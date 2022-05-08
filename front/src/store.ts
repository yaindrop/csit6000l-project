import * as monaco from 'monaco-editor';
import { Scene } from './scene/ast';
import { RootNode } from './scene/cst';

export const sceneModelParsed = new Map<string, [RootNode, Scene]>()
