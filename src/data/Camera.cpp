#include "Camera.h"
#include <cmath>

Ray PerspectiveCamera::generateRay(const Vector2f &point) const {
    float D = 1.0f / tan(angle / 2);
    Vector3f r = (point.x() * u + aspect * point.y() * v + w * D).normalized();
    return Ray(center, r);
}

Ray ThinLensCamera::generateRay(const Vector2f &point) const {
    float D = 1.0 / tan(angle / 2.0);
    Vector3f originalDir = (point[0] * u + point[1] * v + w * D).normalized();
    Vector3f focal_pt = center + focus_dist * originalDir;
    float x = (((float)rand() / RAND_MAX) * 1) - 0.5;
    float y = (((float)rand() / RAND_MAX) * 1) - 0.5;
    Vector3f offset(x * aperture, y * aperture, 0);
    Vector3f newCenter = center + offset;
    Vector3f len_r = focal_pt - newCenter;
    len_r.normalized();
    return Ray(newCenter, len_r);
}
