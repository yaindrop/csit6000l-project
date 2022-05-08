#include "Material.h"

Vector3f Material::getShadingColor(const Ray &ray, const Hit &hit,
                                   const Vector3f &dirToLight, const Vector3f &lightColor,
                                   bool rayCasting) const {
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
        float specularShading = max(0.0f, Vector3f::dot(dirToLight.normalized() - 2 * diffuseShading * n, ray.getDirection().normalized()));
        auto specular = pow(specularShading, shininess) * lightColor * specularColor;
        return diffuse + specular;
    } else {
        return diffuse;
    }
}

Vector3f Material::getEnvironmentColor(const Ray &ray, const Hit &hit) const {
    auto N = hit.getNormal();
    auto d = ray.getDirection();
    auto reflection =  d - 2 * Vector3f::dot(d, N) * N;
    return 0.5 * cubemap->operator()(reflection) + 0.5 * noise.getColor(ray.getOrigin() + ray.getDirection() * hit.getT());
}
