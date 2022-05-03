#ifndef ARGUMENTS_H
#define ARGUMENTS_H

#include <cassert>
#include <cstdio>
#include <cstdlib>
#include <cstring>

struct Arguments {
    Arguments() = delete;
    Arguments(int argc, char *argv[]);

    char *inputFile = NULL;
    char *outputFile = NULL;

    // size
    int width = 100;
    int height = 100;

    // depth map
    char *depthFile = NULL;
    float depthMin = 0;
    float depthMax = 1;

    // normals map
    char *normalsFile = NULL;

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
    char *blurryFile = NULL;
};

#endif // ARGUMENTS_H
