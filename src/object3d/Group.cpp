#include "Group.h"

bool Group::intersect(const Ray &r, Hit &h, float tmin) {
    bool res = false;
    for (auto obj : objects)
        if (obj->intersect(r, h, tmin))
            res = true;
    return res;
}
