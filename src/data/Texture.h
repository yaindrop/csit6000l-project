#ifndef TEXTURE_H
#define TEXTURE_H

#include "bitmap_image.hpp"
#include <vecmath.h>

///@brief helper class that stores a texture and faciliates lookup
/// assume 4byte RGBA image data
class Texture {
public:
    Texture() : bimg(0), width(0), height(0) {}
    ~Texture();

    bool valid() const;
    void load(const char *filename);
    void operator()(int x, int y, unsigned char *color) const;
    ///@param x assumed to be between 0 and 1
    Vector3f operator()(float x, float y, bool pixelated = false) const;
    virtual Vector3f operator()(const Vector2f &point, bool pixelated = false) const;

private:
    bitmap_image *bimg;
    int width, height;
};

class NormalMap : public Texture {
public:
    virtual Vector3f operator()(const Vector2f &point, bool pixelated = false) const;
};

#endif // TEXTURE_H
