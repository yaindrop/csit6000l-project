#include "Renderer.h"

#include <functional>
#include <iostream>

using namespace std;

Vector3f RenderFunction::renderPixel(const Scene &scene, const Camera &camera, Vector2f position) {
    auto ray = camera.generateRay(position);
    return render(scene, ray);
}

void Renderer::renderScene(
    const Scene &scene,
    Image &img,
    RenderFunction &func,
    bool jittered,
    function<void(double)> onProgress) {
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
            auto pixel = func.renderPixel(scene, camera, Vector2f(x, y));
            img.setPixel(i, j, pixel);
        }
        onProgress((float)(i + 1) / w);
    }
    cout << endl;
}
