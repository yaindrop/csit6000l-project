#ifndef PLANE_H
#define PLANE_H

#include "Object3D.h"
#include <vecmath.h>

class Plane : public Object3D {
public:
    Plane() {}
    Plane(const Vector3f &normal, float d, Material *m)
        : Object3D(m), normal(normal.normalized()), d(d) {}
    ~Plane() {}
    virtual bool intersect(const Ray &r, Hit &h, float tmin);

protected:
    Vector3f normal;
    float d;
};
#endif // PLANE_H
