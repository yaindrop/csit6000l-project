#include "Triangle.h"

void Triangle::setTbn(Hit &h) {
    auto &[p0, p1, p2] = texCoords;
    auto e0 = b - a, e1 = c - a;
    auto invDuDv = Matrix2f(p1 - p0, p2 - p0, false).inverse();
    auto tbx = invDuDv * Vector2f(e0.x(), e1.x());
    auto tby = invDuDv * Vector2f(e0.y(), e1.y());
    auto tbz = invDuDv * Vector2f(e0.z(), e1.z());
    auto t = Vector3f(tbx.x(), tby.x(), tbz.x()).normalized();
    auto b = Vector3f(tbx.y(), tby.y(), tbz.y()).normalized();
    auto n = Vector3f::cross(t, b).normalized();
    h.setTbn(Matrix3f(t, b, n));
}

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
            setTbn(h);
            return true;
        }
    }
    return false;
}
