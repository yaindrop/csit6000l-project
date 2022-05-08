#include "RayTracer.h"
#include "../data/Camera.h"
#include "../data/Light.h"
#include "../data/Material.h"
#include "../object3d/Group.h"

#include <iostream>

#define VACCUM_REFRACTION_INDEX 1
#define EPSILON 0.001
#define SQUARED(x) x *x

/**
 * @brief Mirror reflection
 *
 * @param N surface normal
 * @param d incoming ray direction
 * @return reflection direction
 */
Vector3f mirrorDirection(const Vector3f &N, const Vector3f &d) {
    // R = d - 2 (d . N) N
    return d - 2 * Vector3f::dot(d, N) * N;
}

/**
 * @brief Simple refraction
 *
 * @param N surface normal
 * @param d incoming ray direction
 * @param n current refraction index
 * @param nt next refraction index
 * @param r resulting reflection weight
 * @return refraction direction
 */
Vector3f transmittedDirection(const Vector3f &N, const Vector3f &d,
                              float n, float nt, float &r) {
    // t = n (d - N (d . N)) / nt - N * sqrt(1 - (n^2 (1 - (d . N)^2)) / (nt^2))
    float ratio = n / nt;
    float dDotN = Vector3f::dot(d, N);
    float radicand = 1 - SQUARED(ratio) * (1 - SQUARED(dDotN));
    if (radicand >= 0) {
        Vector3f t = ratio * (d - N * dDotN) - N * sqrt(radicand);
        t.normalize();
        // r0 = ((nt - n) / (nt + n))^2
        // c = abs(d . N) if n <= nt, abs(t . N) if n > nt
        // r = r0 + (1 - r0)(1 - c)^5
        float r0 = pow((nt - n) / (nt + n), 2);
        float c = n <= nt ? abs(dDotN) : abs(Vector3f::dot(t, N));
        r = r0 + (1 - r0) * pow(1 - c, 5);
        return t;
    } else {
        r = 1; // total reflection
        return Vector3f::ZERO;
    }
}

Vector3f RayTracer::traceReflection(const Ray &ray, const Hit &hit,
                                    int bounces, float refractionIndex) const {
    auto reflectionDirection = mirrorDirection(hit.getNormal(), ray.getDirection());
    Ray reflectionRay(ray(hit.getT()), reflectionDirection);
    auto nextBounceColor = traceRay(reflectionRay, EPSILON, bounces + 1, refractionIndex);
    return hit.getMaterial()->getSpecularColor() * nextBounceColor;
}

Vector3f RayTracer::traceRefraction(const Ray &ray, const Hit &hit,
                                    int bounces, float refractionIndex, float &r) const {
    auto N = hit.getNormal();
    const auto &d = ray.getDirection();
    float n = refractionIndex, nt = hit.getMaterial()->getRefractionIndex();
    if (Vector3f::dot(d, N) > 0) { // ray exiting object
        N = -N;
        nt = VACCUM_REFRACTION_INDEX;
    }
    Vector3f t = transmittedDirection(N, d, n, nt, r);
    if (r < 1) { // refraction occurs
        Ray refractionRay(ray(hit.getT()), t);
        auto nextBounceColor = traceRay(refractionRay, EPSILON, bounces + 1, nt);
        return hit.getMaterial()->getSpecularColor() * nextBounceColor;
    }
    return Vector3f::ZERO;
}

bool inShadow(Group &g, const Ray &ray, const Hit &hit,
              const Vector3f &lightDirection, float lightDistance) {
    Ray shadowRay(ray(hit.getT()), lightDirection);
    Hit shadowHit(lightDistance);
    return g.intersect(shadowRay, shadowHit, EPSILON);
}

Vector3f RayTracer::traceRay(const Ray &ray, float tmin, int bounces,
                             float refractionIndex) const {
    Hit hit;
    auto &g = scene->getGroup();
    if (g.intersect(ray, hit, tmin)) {
        auto color = scene->getAmbientLight() * hit.getMaterial()->getDiffuseColor();
        for (int li = 0; li < scene->getNumLights(); ++li) {
            Vector3f lightDirection, lightColor;
            float lightDistance;
            scene->getLight(li).getIllumination(ray(hit.getT()), lightDirection, lightColor, lightDistance);
            if (args.shadows && inShadow(g, ray, hit, lightDirection, lightDistance))
                continue;
            auto shadingColor = hit.getMaterial()->getShadingColor(ray, hit, lightDirection, lightColor, args.pixelated);
            color = color + shadingColor;
        }
        if (bounces < args.bounces) {
            float r;
            auto reflectionColor = traceReflection(ray, hit, bounces, refractionIndex);
            auto refractionColor = traceRefraction(ray, hit, bounces, refractionIndex, r);
            color = color + r * reflectionColor + (1 - r) * refractionColor;
        }
        return color;
    } else {
        return scene->getBackgroundColor(ray.getDirection());
    }
}

Vector3f RayTracer::render(const Scene &scene, const Ray &ray) {
    this->scene = &scene;
    return traceRay(ray, scene.getCamera().getTMin(), 0, VACCUM_REFRACTION_INDEX);
}
