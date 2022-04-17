#include "Camera.h"
#include <cmath>

Ray PerspectiveCamera::generateRay(const Vector2f &point) {
    float d = 1.0f / tan(angle / 2);
    auto r = point.x() * v + aspect * point.y() * u + d * w;
    r.normalize();
    return Ray(center, r);
}
