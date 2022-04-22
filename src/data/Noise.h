#ifndef NOISE_H
#define NOISE_H
#include "vecmath.h"

class Noise {
public:
    Noise() {}
    Noise(int octaves,
          const Vector3f &color1 = Vector3f::ZERO,
          const Vector3f &color2 = Vector3f(1, 1, 1),
          float freq = 1,
          float amp = 1)
        : inited(true),
          octaves(octaves),
          color{color1, color2},
          frequency(freq),
          amplitude(amp) {}
    Noise(const Noise &n) = default;
    Vector3f getColor(const Vector3f &pos) const;

    bool inited = false;
    int octaves;
    Vector3f color[2];
    float frequency;
    float amplitude;
    
};

#endif // NOISE_H
