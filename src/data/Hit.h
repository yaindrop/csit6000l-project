#ifndef HIT_H
#define HIT_H

#include "Ray.h"
#include <float.h>
#include <iostream>
#include <vecmath.h>

class Material;

class Hit {
public:
    bool hasTex = false;
    Vector2f texCoord;

    Hit() {}
    Hit(float t) : t(t) {}
    Hit(float t, Material *m, const Vector3f &n) {
        set(t, m, n);
    }
    Hit(const Hit &h)
        : hasTex(h.hasTex), t(h.t), material(h.material), normal(h.normal) {}
    ~Hit() {}

    float getT() const {
        return t;
    }
    Material *getMaterial() const {
        return material;
    }
    const Vector3f &getNormal() const {
        return normal;
    }

    void set(float t, Material *m, const Vector3f &n) {
        this->t = t;
        material = m;
        normal = n.normalized();
    }
    void setTexCoord(const Vector2f &coord) {
        texCoord = coord;
        hasTex = true;
    }

private:
    float t = FLT_MAX;
    Material *material = NULL;
    Vector3f normal = Vector3f::ZERO;
};

inline ostream &operator<<(ostream &os, const Hit &h) {
    os << "Hit <" << h.getT() << ", " << h.getNormal() << ">";
    return os;
}

#endif // HIT_H
