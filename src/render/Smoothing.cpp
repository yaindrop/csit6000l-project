#include "Smoothing.h"
#include <algorithm>

using namespace std;

void Smoothing::gaussian(Image &image, const float kernel[5]) {
    int w = image.getWidth(), h = image.getHeight();
    Image res(w, h);
    for (int i = 0; i < w; ++i) {
        for (int j = 0; j < h; ++j) {
            Vector3f color;
            for (int k = 0; k < 5; ++k) {
                int y = max(0, min(j - 2 + k, h - 1));
                color += kernel[k] * image.getPixel(i, y);
            }
            res.setPixel(i, j, color);
        }
    }
    image.setImage(res);
    for (int i = 0; i < w; ++i) {
        for (int j = 0; j < h; ++j) {
            Vector3f color;
            for (int k = 0; k < 5; ++k) {
                int x = max(0, min(i - 2 + k, w - 1));
                color += kernel[k] * image.getPixel(x, j);
            }
            res.setPixel(i, j, color);
        }
    }
    image.setImage(res);
}
