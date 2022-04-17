#include "Light.h"

void DirectionalLight::getIllumination(
    __attribute__((unused)) const Vector3f &p,
    Vector3f &dir,
    Vector3f &col,
    float &distanceToLight) const {
    // the direction to the light is the opposite of the
    // direction of the directional light source
    dir = -direction;
    col = color;
    distanceToLight = FLT_MAX;
}

void PointLight::getIllumination(
    const Vector3f &p,
    Vector3f &dir,
    Vector3f &col,
    float &distanceToLight) const {
    // the direction to the light is the opposite of the
    // direction of the directional light source
    dir = (position - p);
    distanceToLight = dir.abs();
    dir = dir / distanceToLight;
    col = color / (1 + falloff * distanceToLight * distanceToLight);
}
