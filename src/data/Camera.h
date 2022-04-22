#ifndef CAMERA_H
#define CAMERA_H

#include "Ray.h"
#include <vecmath.h>

class Camera
{
public:
    // generate rays for each screen-space coordinate
    virtual Ray generateRay(const Vector2f &point) = 0;
    virtual float getTMin() const = 0;
    virtual ~Camera() {}

protected:
    Vector3f center;
    Vector3f direction;
    Vector3f up;
    Vector3f horizontal;
};

class PerspectiveCamera : public Camera
{
public:
    PerspectiveCamera(const Vector3f &center, const Vector3f &direction,
                      const Vector3f &up, float angle)
        : center(center),
          angle(angle),
          w(direction.normalized()),
          u(Vector3f::cross(w, up).normalized()),
          v(Vector3f::cross(u, w).normalized()) {}
    Ray generateRay(const Vector2f &point);
    float getTMin() const
    {
        return 0.0f;
    }

private:
    float aspect = 1;
    Vector3f center;
    float angle;
    Vector3f w;
    Vector3f u;
    Vector3f v;
};

class ThinLensCamera : public Camera
{
public:
    ThinLensCamera(const Vector3f &center, const Vector3f &direction,
                   const Vector3f &up, float angle, float focus_dist, float aperture)
        : center(center),
          angle(angle),
          w(direction.normalized()),
          u(Vector3f::cross(w, up).normalized()),
          v(Vector3f::cross(u, w).normalized()),
          focus_dist(focus_dist),
          aperture(aperture) {}
    Ray generateRay(const Vector2f &point);
    float getTMin() const
    {
        return 0.0f;
    }

private:
    float aspect = 1;
    Vector3f center;
    float angle;
    Vector3f w;
    Vector3f u;
    Vector3f v;
    float focus_dist;
    float aperture;
};
#endif // CAMERA_H
