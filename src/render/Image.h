#ifndef IMAGE_H
#define IMAGE_H

#include <cassert>
#include <iostream>
#include <vecmath.h>
// Simple image class
class Image {
private:
    int width;
    int height;
    Vector3f *data;
    float samplingRate = 1;
    int sampled(int n) const {
        return floor(n * samplingRate);
    }

public:
    Image(int w, int h)
        : width(w), height(h), data(new Vector3f[width * height]) {}
    ~Image() {
        delete[] data;
    }

    int getWidth() const {
        return width;
    }
    int getHeight() const {
        return height;
    }
    const Vector3f &getPixel(int x, int y) const {
        assert(x >= 0 && x < width);
        assert(y >= 0 && y < height);
        return data[y * width + x];
    }
    int getSampledWidth() const {
        if (samplingRate == 1)
            return width;
        return floor(width / samplingRate);
    }
    int getSampledHeight() const {
        if (samplingRate == 1)
            return height;
        return floor(height / samplingRate);
    }
    Vector3f getSampledPixel(int x, int y) const;

    void reset() {
        reset(width, height);
    }
    void reset(int w, int h) {
        width = w;
        height = h;
        delete[] data;
        data = new Vector3f[width * height];
        samplingRate = 1;
    }
    void setSamplingRate(float r = 1) {
        assert(r > 0);
        samplingRate = r;
    }
    void setAllPixels(const Vector3f &color) {
        for (int i = 0; i < width * height; ++i) {
            data[i] = color;
        }
    }
    void setPixel(int x, int y, const Vector3f &color) {
        assert(x >= 0 && x < width);
        assert(y >= 0 && y < height);
        data[y * width + x] = color;
    }
    void setImage(const Image &image) {
        reset(image.width, image.height);
        samplingRate = image.samplingRate;
        for (int i = 0; i < width; ++i) {
            for (int j = 0; j < height; ++j) {
                setPixel(i, j, image.getPixel(i, j));
            }
        }
    }

    static Image *loadPpm(const char *filename);
    void savePpm(const char *filename) const;

    static Image *loadTga(const char *filename);
    void saveTga(const char *filename) const;
    int saveBmp(const char *filename);
    void saveImage(const char *filename);
    // extension for image comparison
    static Image *compare(Image *img1, Image *img2);
};

#endif // IMAGE_H
