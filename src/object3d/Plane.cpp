#include "Plane.h"

bool Plane::intersect(const Ray &r, Hit &h, float tmin) {
    // t = - (D + n . Ro) / (n . Rd)
    float nRd = Vector3f::dot(normal, r.getDirection());
    if (nRd == 0) // parallel
        return false;
    float nRo = Vector3f::dot(normal, r.getOrigin());
    float t = -(-d + nRo) / nRd;
    bool res = t > tmin && t < h.getT();
    if (res)
        h.set(t, material, normal);
    return res;
}
