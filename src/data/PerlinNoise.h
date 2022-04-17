// JAVA REFERENCE IMPLEMENTATION OF IMPROVED NOISE - COPYRIGHT 2002 KEN PERLIN.
// http://mrl.nyu.edu/~perlin/noise/
// translated to C++ for 6.837

#ifndef PERLINNOISE_H
#define PERLINNOISE_H

#include <Vector3f.h>

class PerlinNoise {
public:
    static double noise(double x, double y, double z);
    static double octaveNoise(const Vector3f &pt, int octaves);

private:
    // permutation
    static int p[512];
};

#endif // PERLINNOISE_H
