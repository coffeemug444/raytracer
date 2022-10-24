#ifndef SHADER_TYPES_H
#define SHADER_TYPES_H
#include <glm/glm.hpp>

struct Material {
   glm::vec3 color;
   float roughness;
   float transparency;
   float density;
};

struct Sphere {
   Material material;
   glm::vec3 center;
   float radius;
};


#endif