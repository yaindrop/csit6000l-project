#include "Arguments.h"
#include <iostream>

Arguments::Arguments(int argc, const char **argv) {
    // This loop loops over each of the input arguments.
    // argNum is initialized to 1 because the first
    // "argument" provided to the program is actually the
    // name of the executable (in our case, "a5").
    for (int i = 1; i < argc; ++i) {
        std::cout << "Argument " << i << " is: " << argv[i] << std::endl;
    }
    for (int i = 1; i < argc; ++i) {
        if (!strcmp(argv[i], "-input")) {
            i++;
            assert(i < argc);
            inputFile = argv[i];
        } else if (!strcmp(argv[i], "-output")) {
            i++;
            assert(i < argc);
            outputFile = argv[i];
        } else if (!strcmp(argv[i], "-size")) {
            i++;
            assert(i < argc);
            width = atoi(argv[i]); 
            i++;
            assert(i < argc);
            height = atoi(argv[i]);
        } else if (!strcmp(argv[i], "-depth")) {
            i++;
            assert(i < argc);
            depthMin = (float)atof(argv[i]);
            i++;
            assert(i < argc);
            depthMax = (float)atof(argv[i]);
            i++;
            assert(i < argc);
            depthFile = argv[i];
        } else if (!strcmp(argv[i], "-normals")) {
            i++;
            assert(i < argc);
            normalsFile = argv[i];
        } else if (!strcmp(argv[i], "-bounces")) {
            i++;
            assert(i < argc);
            bounces = atoi(argv[i]);
        } else if (!strcmp(argv[i], "-shadows")) {
            shadows = true;
        } else if (strcmp(argv[i], "-jitter") == 0) {
            jitter = true;
        } else if (strcmp(argv[i], "-filter") == 0) {
            filter = true;
        } else if (strcmp(argv[i], "-casting") == 0) {
            rayCasting = true;
        } else if (!strcmp(argv[i], "-blurry")) {
            blurry = true;
            focus_dist = atof(argv[++i]);
            blurryFile = argv[++i];
        } else if (strcmp(argv[i], "-pixelated") == 0) {
            pixelated = true;
        } else if (strcmp(argv[i], "-noargs") == 0) {
            exit(0);
        } else {
            printf("Unknown command line argument %d: '%s'\n", i, argv[i]);
            assert(0);
        }
    }
}
