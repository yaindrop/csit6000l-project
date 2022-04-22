#include "Material.h"

Vector3f Material::getShadingColor(const Ray &ray, const Hit &hit,
                                   const Vector3f &dirToLight, const Vector3f &lightColor,
                                   bool rayCasting) const
{
    bool useTextureColor = t.valid() && hit.hasTex;
    auto diffuseColor = noise.inited
                            ? noise.getColor(ray.getOrigin() + ray.getDirection() * hit.getT())
                        : useTextureColor
                            ? t(hit.texCoord)
                            : this->diffuseColor;
    auto n = hit.getNormal();
    float diffuseShading = max(0.0f, Vector3f::dot(dirToLight, n));
    auto diffuse = diffuseShading * lightColor * diffuseColor;
    if (rayCasting)
    {
        float specularShading = max(0.0f, Vector3f::dot(dirToLight - 2 * diffuseShading * n, ray.getDirection()));
        auto specular = pow(specularShading, shininess) * lightColor * specularColor;
        return diffuse + specular;
    }
    else
    {
        return diffuse;
    }
}

Vector3f Material::Shade(const Ray &ray, const Hit &hit,
                         const Vector3f &dirToLight, const Vector3f &lightColor)
{
    Vector3f kd;
    if (t.valid() && hit.hasTex)
    {
        Vector2f texCoord = hit.texCoord;
        Vector3f texColor = t(texCoord[0], texCoord[1]);
        kd = texColor;
    }
    else
    {
        kd = this->diffuseColor;
    }
    Vector3f n = hit.getNormal().normalized();

    if (noise.inited)
    {
        kd = noise.getColor(ray.getOrigin() + ray.getDirection() * hit.getT());
    }
    Vector3f color = clampedDot(dirToLight, n) * pointwiseDot(lightColor, kd);
    return color;
}

Vector3f Material::pointwiseDot(const Vector3f &v1, const Vector3f &v2)
{
    Vector3f out = Vector3f(v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]);
    return out;
}

float Material::clampedDot(const Vector3f &L, const Vector3f &N) const
{
    float d = Vector3f::dot(L, N);
    return (d > 0) ? d : 0;
}
