#ifndef RAYTRACER_H
#define RAYTRACER_H

#include "../data/Hit.h"
#include "../data/Ray.h"
#include "Arguments.h"
#include "Renderer.h"
#include <cassert>
#include <vector>

class RayTracer : public RenderFunction {
public:
    RayTracer() = delete;
    RayTracer(const Arguments &args)
        : args(args) {}
    ~RayTracer() {}

    virtual Vector3f render(const Scene &scene, const Ray &ray);

protected:
    const Arguments &args;
    Scene const *scene = NULL;

    Vector3f traceRay(const Ray &ray,
                      float tmin, int bounces, float refr_index) const;
    Vector3f traceReflection(const Ray &ray, const Hit &hit,
                             int bounces, float refractionIndex) const;
    Vector3f traceRefraction(const Ray &ray, const Hit &hit,
                             int bounces, float refractionIndex, float &r) const;
};

#endif // RAYTRACER_H
