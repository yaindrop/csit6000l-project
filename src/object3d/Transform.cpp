#include "Transform.h"

bool Transform::intersect(const Ray &r, Hit &h, float tmin) {
    auto transformedOrigin = (invM * Vector4f(r.getOrigin(), 1)).xyz();
    auto transformedDirection = (invM * Vector4f(r.getDirection(), 0)).xyz();
    Ray transformedRay(transformedOrigin, transformedDirection);
    if (o->intersect(transformedRay, h, tmin)) {
        auto transformedNormal = (invM.transposed() * Vector4f(h.getNormal(), 0)).normalized().xyz();
        h.set(h.getT(), h.getMaterial(), transformedNormal);
        return true;
    }
    return false;
}
