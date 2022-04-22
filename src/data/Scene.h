#ifndef SCENE_H
#define SCENE_H

#include "../object3d/Group.h"
#include "../object3d/Mesh.h"
#include "../object3d/Object3D.h"
#include "../object3d/Plane.h"
#include "../object3d/Sphere.h"
#include "../object3d/Transform.h"
#include "../object3d/Triangle.h"
#include "Camera.h"
#include "CubeMap.h"
#include "Light.h"
#include "Material.h"
#include <cassert>
#include <filesystem>
#include <vecmath.h>

#define MAX_PARSER_TOKEN_LENGTH 100

class Scene {
    friend class SceneParser;

public:
    Scene(const char *filename);
    ~Scene();

    Group &getGroup() const {
        return *group;
    }
    Camera &getCamera() const {
        return *camera;
    }
    Vector3f getBackgroundColor(Vector3f dir = Vector3f::RIGHT) const {
        if (cubemap == NULL) {
            return background_color;
        }
        return cubemap->operator()(dir);
    }
    Vector3f getAmbientLight() const {
        return ambient_light;
    }
    int getNumLights() const {
        return num_lights;
    }
    Light &getLight(int i) const {
        assert(i >= 0 && i < num_lights);
        return *lights[i];
    }
    int getNumMaterials() const {
        return num_materials;
    }
    Material &getMaterial(int i) const {
        assert(i >= 0 && i < num_materials);
        return *materials[i];
    }
    bool hasCubeMap() const {
        return cubemap != NULL;
    }

private:
    Group *group = NULL;
    Camera *camera = NULL;
    Camera *thinLenCamera = NULL;
    Vector3f background_color = Vector3f(0.5, 0.5, 0.5);
    Vector3f ambient_light = Vector3f(0, 0, 0);
    int num_lights = 0;
    Light **lights = NULL;
    int num_materials = 0;
    Material **materials = NULL;
    CubeMap *cubemap = NULL;
};

class SceneParser {
    friend class Scene;

    SceneParser(Scene &scene, const char *filename);

    Scene &scene;
    const char *filename;
    FILE *file;
    Material *current_material;

    void parseFile();
    void parsePerspectiveCamera();
    void parseBackground();
    CubeMap *parseCubeMap();

    void parseLights();
    Light *parseDirectionalLight();
    Light *parsePointLight();
    void parseMaterials();
    Material *parseMaterial();
    Noise *parseNoise();

    Object3D *parseObject(char token[MAX_PARSER_TOKEN_LENGTH]);
    Group *parseGroup();
    Sphere *parseSphere();
    Plane *parsePlane();
    Triangle *parseTriangle();
    Mesh *parseTriangleMesh();
    Transform *parseTransform();

    int getToken(char token[MAX_PARSER_TOKEN_LENGTH]);
    Vector3f readVector3f();
    Vector2f readVec2f();
    float readFloat();
    int readInt();
    std::filesystem::path getRelativePath(const char *resource);

    Camera &getThinLensCamera(float focus_dist, float aperture);
    Vector3f center, direction, up;
    float angle_radians;
};

#endif // SCENE_H
