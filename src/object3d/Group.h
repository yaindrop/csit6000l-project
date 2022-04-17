#ifndef GROUP_H
#define GROUP_H

#include "Object3D.h"
#include <vector>

class Group : public Object3D {
public:
    Group() {}
    Group(int num_objects) {
        objects.reserve(num_objects);
    }
    ~Group() {}
    int getGroupSize() const {
        return objects.size();
    }
    void addObject(Object3D *obj) {
        objects.push_back(obj);
    }
    virtual bool intersect(const Ray &r, Hit &h, float tmin);

private:
    vector<Object3D *> objects;
};

#endif // GROUP_H
