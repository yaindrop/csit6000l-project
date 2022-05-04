#include "Material.h"

Vector3f Material::getShadingColor(const Ray &ray, const Hit &hit,
                                   const Vector3f &dirToLight, const Vector3f &lightColor,
                                   bool rayCasting) const {
    bool useNormalMap = normalMap.valid() && hit.hasTex && hit.hasTbn;
    Vector3f n = hit.getNormal();
    if (useNormalMap) {
        n = hit.tbn * normalMap(hit.texCoord);
    }

    bool useTextureColor = t.valid() && hit.hasTex;
    auto diffuseColor = noise.inited
                            ? noise.getColor(ray.getOrigin() + ray.getDirection() * hit.getT())
                        : useTextureColor
                            ? t(hit.texCoord)
                            : this->diffuseColor;
    float diffuseShading = max(0.0f, Vector3f::dot(dirToLight, n));
    auto diffuse = diffuseShading * lightColor * diffuseColor;
    if (rayCasting) {
        float specularShading = max(0.0f, Vector3f::dot(dirToLight.normalized() - 2 * diffuseShading * n, ray.getDirection().normalized()));
        auto specular = pow(specularShading, shininess) * lightColor * specularColor;
        return diffuse + specular;
    } else {
        return diffuse;
    }
}
