#include "Noise.h"
#include "PerlinNoise.h"

Vector3f Noise::getColor(const Vector3f &pos) const {
    // M(x, y, z) = (1 + sin(wx + aN(x, y, z))) / 2
    float M = (1 + sin(frequency * pos[0] + amplitude * PerlinNoise::octaveNoise(pos, octaves))) / 2;
    return M * color[0] + (1 - M) * color[1];
}
