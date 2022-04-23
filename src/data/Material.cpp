#include "Material.h"

Vector3f Material::getShadingColor(const Ray &ray, const Hit &hit,
                                   const Vector3f &dirToLight, const Vector3f &lightColor,
                                   bool rayCasting, bool getSpecularColor) const {
    bool useTextureColor = t.valid() && hit.hasTex;
    auto diffuseColor = noise.inited
                            ? noise.getColor(ray.getOrigin() + ray.getDirection() * hit.getT())
                        : useTextureColor
                            ? t(hit.texCoord)
                            : this->diffuseColor;
    auto n = hit.getNormal();
    float diffuseShading = max(0.0f, Vector3f::dot(dirToLight, n));
    auto diffuse = diffuseShading * lightColor * diffuseColor;
    if (rayCasting) {
        float specularShading = max(0.0f, Vector3f::dot(dirToLight - 2 * diffuseShading * n, ray.getDirection()));
        auto specular = pow(specularShading, shininess) * lightColor * specularColor;
        if(getSpecularColor)
            return specular;
        return diffuse + specular;
    } else {
        return diffuse;
    }
}
