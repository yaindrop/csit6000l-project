#ifndef RAYCASTER_H
#define RAYCASTER_H

#include "Arguments.h"
#include "Renderer.h"

class RayCaster : public RenderFunction {
public:
    RayCaster() = delete;
    RayCaster(const Arguments &args)
        : args(args) {}
    ~RayCaster() {}

    virtual Vector3f render(const Scene &scene, const Ray &ray);

protected:
    const Arguments &args;
    bool useRayCastingShaing = true;
};

class DepthRayCaster : public RayCaster {
public:
    DepthRayCaster(const Arguments &args) : RayCaster(args) {}
    virtual Vector3f render(const Scene &scene, const Ray &ray);
};

class NormalsRayCaster : public RayCaster {
public:
    NormalsRayCaster(const Arguments &args) : RayCaster(args) {}
    virtual Vector3f render(const Scene &scene, const Ray &ray);
};

class BlurryRayCaster : public RayCaster {
public:
    BlurryRayCaster(const Arguments &args) : RayCaster(args) {
        useRayCastingShaing = false;
    }
    virtual Vector3f renderPixel(const Scene &scene, const Camera &camera, Vector2f position);
};

#endif // RAYCASTER_H
