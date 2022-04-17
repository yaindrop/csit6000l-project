#ifndef SMOOTHING_H
#define SMOOTHING_H

#include "Arguments.h"
#include "Image.h"

class Smoothing {
public:
    static void gaussian(Image &image, const float kernel[5]);
};

#endif // SMOOTHING_H
