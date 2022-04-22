#ifndef RENDERER_H
#define RENDERER_H

#include "../data/Scene.h"
#include "Arguments.h"
#include "Image.h"

class RenderFunction
{
public:
    virtual Vector3f render(const Scene &scene, const Ray &ray) = 0;
};

class Renderer
{
public:
    static void renderScene(
        const Scene &scene,
        Image &img,
        RenderFunction &renderFunc,
        bool jittered = false);
    
    // Blurry Scene
    static void rendeBlurryScene(
        const Scene &scene,
        Image &img,
        RenderFunction &renderFunc,
        bool jittered = false);
};

#endif // RENDERER_H
