#ifndef ARGUMENTS_H
#define ARGUMENTS_H

#include <cassert>
#include <cstdio>
#include <cstdlib>
#include <cstring>

struct Arguments {
    Arguments() = delete;
    Arguments(int argc, const char **argv);

    const char *inputFile = NULL;
    const char *outputFile = NULL;

    // size
    int width = 100;
    int height = 100;

    // depth map
    const char *depthFile = NULL;
    float depthMin = 0;
    float depthMax = 1;

    // normals map
    const char *normalsFile = NULL;

    // raytracing
    int bounces = 4;
    bool shadows = false;

    // supersampling
    bool jitter = false;
    bool filter = false;

    bool rayCasting = false;

    // blurring
    bool blurry = false;
    float focus_dist = 0;

    bool pixelated = false;
};

#endif // ARGUMENTS_H
