#ifndef RENDERER_H
#define RENDERER_H

#include "../data/Scene.h"
#include "Arguments.h"
#include "Image.h"
#include <functional>

class RenderFunction {
public:
    virtual Vector3f render(const Scene &scene, const Ray &ray) = 0;
};

class Renderer {
public:
    static void renderScene(
        const Scene &scene,
        Image &img,
        RenderFunction &renderFunc,
        bool jittered,
        function<void(double)> onProgress);
};

#endif // RENDERER_H
