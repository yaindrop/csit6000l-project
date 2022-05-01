#include "Entry.h"
#include "data/Camera.h"
#include "data/Scene.h"
#include "render/Image.h"
#include "render/RayCaster.h"
#include "render/RayTracer.h"
#include "render/Renderer.h"
#include "render/Smoothing.h"
#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <string.h>

const float kernel[5] = {0.1201, 0.2339, 0.2931, 0.2339, 0.1201};

void entry(const Arguments &args, function<void(double)> onProgress) {
    Scene scene(args.inputFile);

    if (args.outputFile) {
        Image img(args.width, args.height);
        if (args.rayCasting) {
            RayCaster rc(args);
            Renderer::renderScene(scene, img, rc, args.jitter, onProgress);
        } else {
            RayTracer rt(args);
            Renderer::renderScene(scene, img, rt, args.jitter, onProgress);
        }
        if (args.filter) {
            Smoothing::gaussian(img, kernel);
            img.setSamplingRate(3);
        }
        img.saveImage(args.outputFile);
    }

    if (args.depthFile) {
        Image img(args.width, args.height);
        DepthRayCaster drc(args);
        Renderer::renderScene(scene, img, drc, false, onProgress);
        img.saveImage(args.depthFile);
    }

    if (args.normalsFile) {
        Image img(args.width, args.height);
        NormalsRayCaster nrc(args);
        Renderer::renderScene(scene, img, nrc, false, onProgress);
        img.saveImage(args.normalsFile);
    }
}
