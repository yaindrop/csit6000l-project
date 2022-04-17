#include "Triangle.h"

bool Triangle::intersect(const Ray &r, Hit &h, float tmin) {
    auto rd = r.getDirection();
    auto ro = r.getOrigin();
    float detA = Matrix3f(a - b, a - c, rd).determinant();
    float beta = Matrix3f(a - ro, a - c, rd).determinant() / detA;
    float gamma = Matrix3f(a - b, a - ro, rd).determinant() / detA;
    float alpha = 1 - beta - gamma;
    if (alpha >= 0 && beta >= 0 && gamma >= 0) {
        float t = Matrix3f(a - b, a - c, a - ro).determinant() / detA;
        if (t > tmin && t < h.getT()) {
            Vector3f normal = (alpha * normals[0] + beta * normals[1] + gamma * normals[2]).normalized();
            h.set(t, material, normal);
            Vector2f coord = alpha * texCoords[0] + beta * texCoords[1] + gamma * texCoords[2];
            h.setTexCoord(coord);
            return true;
        }
    }
    return false;
}
