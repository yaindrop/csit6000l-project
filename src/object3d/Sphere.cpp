#include "Sphere.h"

#define SQUARED(x) x *x

bool Sphere::intersect(const Ray &r, Hit &h, float tmin) {
    /**
     * a = 1
     * b = 2(Rd . Ro)
     * c = ||Ro|| - r^2
     * d = sqrt(b^2 - 4ac)
     * t = (-b +- d) / 2a
     */
    auto Ro = r.getOrigin() - center;
    auto Rd = r.getDirection();
    float a = Rd.absSquared();
    float b = 2 * Vector3f::dot(Rd, Ro);
    float c = Ro.absSquared() - SQUARED(radius);
    float discriminant = SQUARED(b) - 4 * a * c;

    if (discriminant >= 0) {
        for (int i = -1; i <= 1; i += 2) {
            float t = (-b + i * sqrt(discriminant)) / (2 * a);
            if (t >= tmin && t <= h.getT()) {
                auto normal = (Ro + t * Rd).normalized();
                h.set(t, material, normal);
                return true;
            }
        }
    }

    return false;
}
