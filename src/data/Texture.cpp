#include "Texture.h"

Texture::~Texture() {
    if (bimg != 0) {
        delete bimg;
    }
}

bool Texture::valid() const {
    return bimg != 0;
}

void Texture::load(const char *filename) {
    bimg = new bitmap_image(filename);
    height = bimg->height();
    width = bimg->width();
}

void Texture::operator()(int x, int y, unsigned char *color) const {
    x = clamp(x, 0, width - 1);
    y = clamp(y, 0, height - 1);
    bimg->get_pixel(x, y, color[0], color[1], color[2]);
}

Vector3f Texture::operator()(float x, float y) const {
    Vector3f color;
    int ix, iy;
    x = x * width;
    y = (1 - y) * height;
    ix = (int)x;
    iy = (int)y;
    unsigned char pixels[4][3];
    float alpha = x - ix;
    float beta = y - iy;
    operator()(ix, iy, pixels[0]);
    operator()(ix + 1, iy, pixels[1]);
    operator()(ix, iy + 1, pixels[2]);
    operator()(ix + 1, iy + 1, pixels[3]);
    for (int ii = 0; ii < 3; ii++) {
        color[ii] = (1 - alpha) * (1 - beta) * pixels[0][ii] + alpha * (1 - beta) * pixels[1][ii] + (1 - alpha) * beta * pixels[2][ii] + alpha * beta * pixels[3][ii];
    }
    return color / 255;
}

Vector3f Texture::operator()(const Vector2f &point) const {
    return operator()(point[0], point[1]);
}
