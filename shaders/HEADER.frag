#version 460 core

struct Ray {
   vec3 origin;
   vec3 dir;
};

struct Material {
   vec3 color;
   float roughness;
   float transparency;
   float density;
};

struct Sphere {
   Material material;
   vec3 center;
   float radius;
};

struct Hit {
   bool hit;
   float dist;
   bool stopped;
   Material material;
   Ray nextRay;
};

uniform Sphere Spheres[100];
uniform vec3 camPos;
uniform float UniformRandomSeed;
in vec3 rayDir;
out vec4 FragColor;
float randomSeed;

const float delta = 0.00001f;
const float PI = 3.14159265359;
const float PI_2 = 6.28318530718;

const vec3 coolblue = vec3(0.545, 0.714, 0.988);
const vec3 darkerblue = 0.4*coolblue;
const Material whiteMat = {
   {1.0f, 1.0f, 1.0f},
   1.0f,
   0.0f,
   1.0f
};

// RANDOM.FRAG
float rng();
float normal_rng();
bool prob_b(float probability);
float prob_f(float probability);
vec3 randomVec_rad(vec3 input_vec, float rads);

// SHADER.FRAG
vec3 backgroundColor(vec3 rayDir);
vec4 quat_mult(vec4 q1, vec4 q2);
vec3 rotate(vec3 point, vec3 axis, float angle);
Hit intersect_sphere(Ray ray, Sphere sphere);
Hit do_intersections (Ray ray);