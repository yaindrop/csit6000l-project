#ifndef SPHERE_H
#define SPHERE_H

#include "Object3D.h"
#include <vecmath.h>

class Sphere : public Object3D {
public:
    // unit ball at the center
    Sphere() {}
    Sphere(Vector3f center, float radius, Material *material)
        : Object3D(material), center(center), radius(radius) {}
    ~Sphere() {}
    virtual bool intersect(const Ray &r, Hit &h, float tmin);

protected:
    Vector3f center;
    float radius;
};

#endif // SPHERE_H
