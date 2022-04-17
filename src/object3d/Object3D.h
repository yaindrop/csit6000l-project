#ifndef OBJECT3D_H
#define OBJECT3D_H

#include <iostream>

#include "../data/Hit.h"
#include "../data/Material.h"
#include "../data/Ray.h"

class Object3D {
public:
    Object3D() {}
    Object3D(Material *material)
        : material(material) {}
    virtual ~Object3D() {}
    virtual bool intersect(const Ray &r, Hit &h, float tmin) = 0;
    char *type;

protected:
    Material *material = NULL;
};

#endif // OBJECT3D_H
