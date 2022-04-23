#ifndef MATERIAL_H
#define MATERIAL_H

#include "Hit.h"
#include "Noise.h"
#include "Ray.h"
#include "Texture.h"
#include <vecmath.h>

class Material {
public:
    Material(const Vector3f &d_color, const Vector3f &s_color = Vector3f::ZERO, float s = 0, float r = 0)
        : diffuseColor(d_color), specularColor(s_color), shininess(s), refractionIndex(r) {}
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
                             bool rayCasting = false,
                             bool getSpecularColor = false) const;

    void loadTexture(const char *filename) {
        t.load(filename);
    }
    void setNoise(const Noise &n) {
        noise = n;
    }

protected:
    Vector3f diffuseColor;
    Vector3f specularColor;
    float shininess;
    float refractionIndex;
    Texture t;
    Noise noise;
};

#endif // MATERIAL_H
