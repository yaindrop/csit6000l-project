#ifndef MATERIAL_H
#define MATERIAL_H

#include "CubeMap.h"
#include "Hit.h"
#include "Noise.h"
#include "Ray.h"
#include "Texture.h"
#include <vecmath.h>

class Material {
public:
    Material(const Vector3f &d_color, const Vector3f &s_color = Vector3f::ZERO, float s = 0, float r = 0, CubeMap *c = NULL)
        : diffuseColor(d_color), specularColor(s_color), shininess(s), refractionIndex(r), cubemap(c) {}
    ~Material() {}

    float getRefractionIndex() {
        return refractionIndex;
    }
    Vector3f getDiffuseColor() const {
        return diffuseColor;
    }
    Vector3f getSpecularColor() const {
        return specularColor;
    }
    Vector3f getShadingColor(const Ray &ray, const Hit &hit,
                             const Vector3f &dirToLight, const Vector3f &lightColor,
                             bool pixelated, bool rayCasting = false) const;
    Vector3f getEnvironmentColor(const Ray &ray, const Hit &hit) const;

    void loadTexture(const char *filename) {
        t.load(filename);
    }
    void loadNormalMap(const char *filename) {
        normalMap.load(filename);
    }
    void setNoise(const Noise &n) {
        noise = n;
    }
    bool hasCubeMap() const {
        return cubemap != NULL;
    }

protected:
    Vector3f diffuseColor;
    Vector3f specularColor;
    float shininess;
    float refractionIndex;
    Texture t;
    NormalMap normalMap;
    Noise noise;
    CubeMap *cubemap = NULL;
};

#endif // MATERIAL_H
