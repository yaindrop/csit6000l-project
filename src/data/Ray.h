#ifndef RAY_H
#define RAY_H

#include <Vector3f.h>
#include <iostream>

using namespace std;

// Ray class mostly copied from Peter Shirley and Keith Morley
class Ray {
public:
    Ray() = delete;
    Ray(const Vector3f &orig, const Vector3f &dir)
        : origin(orig), direction(dir) {}
    Ray(const Ray &r) : Ray(r.origin, r.direction) {}

    const Vector3f &getOrigin() const {
        return origin;
    }
    const Vector3f &getDirection() const {
        return direction;
    }

    /// @brief Eval point
    Vector3f operator()(float t) const {
        return origin + direction * t;
    }

private:
    Vector3f origin;
    Vector3f direction;
};

inline ostream &operator<<(ostream &os, const Ray &r) {
    os << "Ray <" << r.getOrigin() << ", " << r.getDirection() << ">";
    return os;
}

#endif // RAY_H
