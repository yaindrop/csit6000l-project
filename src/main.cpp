#include "data/Camera.h"
#include "data/Scene.h"
#include "render/Arguments.h"
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

using namespace std;

const float kernel[5] = {0.1201, 0.2339, 0.2931, 0.2339, 0.1201};

int main(int argc, char *argv[]) {
    const Arguments args(argc, argv);

    if (args.inputFile == NULL) {
        cout << "Insufficient argument: expecting -input [inputFile], exiting ..." << endl;
        return 1;
    }

    Scene scene(args.inputFile);

    if (args.outputFile) {

        Image img(args.width, args.height);

        if (args.rayCasting) {
            RayCaster rc(args);
            Renderer::renderScene(scene, img, rc);
        } else {
            RayTracer rt(args);
            Renderer::renderScene(scene, img, rt, args.jitter);
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
        Renderer::renderScene(scene, img, drc);
        img.saveImage(args.depthFile);
    }

    if (args.normalsFile) {
        Image img(args.width, args.height);
        NormalsRayCaster nrc(args);
        Renderer::renderScene(scene, img, nrc);
        img.saveImage(args.normalsFile);
    }

    if (args.blurry) {
        Image img(args.width, args.height);
        BlurryRayCaster brc(args);
        scene.setThinLensCamera(args.focus_dist);
        Renderer::renderBlurryScene(scene, img, brc, args.jitter);
        img.saveImage(args.blurryFile);
    }

    return 0;
}
