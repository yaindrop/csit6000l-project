#ifndef TRANSFORM_H
#define TRANSFORM_H

#include "Object3D.h"
#include <vecmath.h>

class Transform : public Object3D {
public:
    Transform() {}
    Transform(const Matrix4f &m, Object3D *obj)
        : o(obj), m(m), invM(m.inverse()) {}
    ~Transform() {}
    virtual bool intersect(const Ray &r, Hit &h, float tmin);

protected:
    Object3D *o; // un-transformed object
    Matrix4f m;
    Matrix4f invM;
};

#endif // TRANSFORM_H
