#ifndef MESH_H
#define MESH_H

#include "../data/Octree.h"
#include "Object3D.h"
#include "Triangle.h"
#include <vecmath.h>
#include <vector>

// by default counterclockwise winding is front face
struct Trig {
    Trig() {
        x[0] = 0;
        x[1] = 0;
        x[2] = 0;
    }
    int &operator[](int i) { return x[i]; }
    int operator[](int i) const { return x[i]; }
    int x[3];
    int texID[3];
};

class Mesh : public Object3D {
public:
    Mesh(const char *filename, Material *m);

    std::vector<Vector3f> v;
    std::vector<Trig> t;
    std::vector<Vector3f> n;
    std::vector<Vector3f> sn; // smooth normal
    std::vector<Vector2f> texCoord;

    virtual bool intersect(const Ray &r, Hit &h, float tmin);
    virtual bool intersectTrig(int idx);

private:
    const Ray *ray;
    Hit *hit;
    float tm;
    void compute_norm();
    Octree octree;
};

#endif // MESH_H
