#ifndef LIGHT_H
#define LIGHT_H

#include <Vector3f.h>
#include <float.h>

class Light {
public:
    Light() {}
    virtual ~Light() {}
    virtual void getIllumination(const Vector3f &p, Vector3f &dir, Vector3f &col, float &distanceToLight) const = 0;
};

class DirectionalLight : public Light {
public:
    DirectionalLight() = delete;
    DirectionalLight(const Vector3f &d, const Vector3f &c)
        : direction(d.normalized()), color(c) {}
    ~DirectionalLight() {}
    virtual void getIllumination(const Vector3f &p, Vector3f &dir, Vector3f &col, float &distanceToLight) const;

private:
    Vector3f direction;
    Vector3f color;
};

class PointLight : public Light {
public:
    PointLight() = delete;
    PointLight(const Vector3f &p, const Vector3f &c, float fall)
        : position(p), color(c), falloff(fall) {}
    ~PointLight() {}
    virtual void getIllumination(const Vector3f &p, Vector3f &dir, Vector3f &col, float &distanceToLight) const;

private:
    Vector3f position;
    Vector3f color;
    float falloff;
};

#endif // LIGHT_H
