#include "RayCaster.h"

Vector3f RayCaster::render(const Scene &scene, const Ray &ray) {
    Hit hit(true);
    if (scene.getGroup().intersect(ray, hit, scene.getCamera().getTMin())) {
        auto color = scene.getAmbientLight() * hit.getMaterial()->getDiffuseColor();
        for (int li = 0; li < scene.getNumLights(); ++li) {
            Vector3f lightDirection, lightColor, shadingColor;
            float dist;
            scene.getLight(li).getIllumination(ray(hit.getT()), lightDirection, lightColor, dist);
            shadingColor = hit.getMaterial()->getShadingColor(ray, hit, lightDirection, lightColor, rayCasting);
            color = color + shadingColor;
        }
        return color;
    } else {
        return scene.getBackgroundColor(ray.getDirection());
    }
}

Vector3f DepthRayCaster::render(const Scene &scene, const Ray &ray) {
    Hit hit(true);
    if (scene.getGroup().intersect(ray, hit, scene.getCamera().getTMin())) {
        if (hit.getT() < args.depthMin) {
            return Vector3f(1);
        } else if (hit.getT() > args.depthMax) {
            return Vector3f(0);
        } else {
            return Vector3f((args.depthMax - hit.getT()) / (args.depthMax - args.depthMin));
        }
    } else {
        return Vector3f::ZERO;
    }
}

Vector3f NormalsRayCaster::render(const Scene &scene, const Ray &ray) {
    Hit hit(true);
    if (scene.getGroup().intersect(ray, hit, scene.getCamera().getTMin())) {
        auto n = hit.getNormal();
        for (int i = 0; i < 3; ++i)
            if (n[i] < 0)
                n[i] = -n[i];
        return n;
    } else {
        return Vector3f::ZERO;
    }
}

Vector3f BlurryRayCaster::render(const Scene &scene, const Ray &ray) {
    rayCasting = false;
    return RayCaster::render(scene, ray);
}