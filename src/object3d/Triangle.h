#ifndef TRIANGLE_H
#define TRIANGLE_H

#include "Object3D.h"
#include <vecmath.h>

class Triangle : public Object3D {
public:
    Triangle();
    ///@param a b c are three vertex positions of the triangle
    Triangle(const Vector3f &a, const Vector3f &b, const Vector3f &c, Material *m)
        : Object3D(m), a(a), b(b), c(c) {}
    virtual bool intersect(const Ray &ray, Hit &hit, float tmin);
    bool hasTex = false;
    Vector3f normals[3];
    Vector2f texCoords[3];

protected:
    Vector3f a;
    Vector3f b;
    Vector3f c;
    void setTbn(Hit &h);
};

#endif // TRIANGLE_H
