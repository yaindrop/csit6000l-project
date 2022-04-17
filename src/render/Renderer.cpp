#include "Renderer.h"

#include <iostream>

using namespace std;

#define LEFT_BRACKET "▕"
#define RIGHT_BRACKET "▏"
#define FULL_BLOCK "█"
const char *partialBlocks[] = {" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉"};
void printProgress(double percentage, int length = 60) {
    int fullBlocks = (int)floor(percentage * length);
    int partialIndex = (int)(8 * length * (percentage - (double)fullBlocks / length));
    cout << "\r" << LEFT_BRACKET;
    for (int i = 0; i < length; ++i)
        cout << (i < fullBlocks
                     ? FULL_BLOCK
                 : i == fullBlocks
                     ? partialBlocks[partialIndex]
                     : " ");
    cout << RIGHT_BRACKET << setprecision(2) << fixed
         << 100 * percentage << "% " << flush;
}

void Renderer::renderScene(
    const Scene &scene,
    Image &img,
    RenderFunction &func,
    bool jittered) {
    int w = img.getWidth(), h = img.getHeight();
    if (jittered) {
        w *= 3;
        h *= 3;
        img.reset(w, h);
    }
    auto &camera = scene.getCamera();
    for (int i = 0; i < w; ++i) {
        for (int j = 0; j < h; ++j) {
            float x = i, y = j;
            if (jittered) {
                x += (float)rand() / RAND_MAX - 0.5;
                y += (float)rand() / RAND_MAX - 0.5;
            }
            x = -1 + 2 * x / (w - 1), y = -1 + 2 * y / (h - 1);
            auto ray = camera.generateRay(Vector2f(x, y));
            img.setPixel(j, i, func.render(scene, ray));
        }
        printProgress((float)(i + 1) / w);
    }
    cout << endl;
}
