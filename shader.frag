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

const vec3 coolblue = vec3(0.545, 0.714, 0.988);
const vec3 darkerblue = 0.4*coolblue;
const Material whiteMat = {
   {1.0f, 1.0f, 1.0f},
   1.0f,
   0.0f,
   1.0f
};

vec3 backgroundColor(vec3 rayDir) {
   float x = rayDir.y;
   bool up = x > 0;

   if (up) {
      return coolblue;
   } else {
      // this bit provides a smooth transition from the sky background colour
      // to the ground background colour. Any values here were picked based on how
      // they looked by trial and error
      x = abs(x);
      x = min(x, 1.0f);
      x = 1 - x;
      x = x*x*x*x;
      float dip = 0.3;
      x = dip + x*(1.0 - dip);
      return coolblue * x;
   }
}


float rng() {
   randomSeed = abs(fract(sin(dot(rayDir, vec3(12.9898,78.233,58.5453)))*(randomSeed*100000)));
   return randomSeed;
}

// randomly returns true with probability provided
bool prob_b(float probability) {
   return rng() < probability;
}

float prob_f(float probability) {
   return prob_b(probability) ? 1.0f : 0.0f;
}

vec4 quat_mult(vec4 q1, vec4 q2)
{ 
  vec4 qr;
  qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
  qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
  qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
  qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
  return qr;
}

vec3 rotate(vec3 point, vec3 axis, float angle) {
   float half_angle = angle * 0.5f;
   float sin_HA = sin(half_angle);
   float cos_HA = cos(half_angle);
   vec4 q = normalize(vec4(sin_HA*axis, cos_HA));
   vec4 p = vec4(point, 0.0f);
   vec4 qi = vec4(-q.xyz, q.w);
   return quat_mult(quat_mult(q,p), qi).xyz;
}

vec3 randomVec_rad(vec3 input_vec, float rads) {
   // returns a random vector within `rads` radians of input_vec
   float rotation = rads * (1-2*rng());
   vec3 perp = normalize(cross(input_vec, vec3(rng(),rng(),rng())));

   return rotate(input_vec, perp, rads);
}

Hit intersect_sphere(Ray ray, Sphere sphere) {
   Hit hit;
   hit.hit = false;

   vec3 oc = ray.origin - sphere.center;
   float b = dot(oc, ray.dir);
   float c = dot(oc, oc) - sphere.radius * sphere.radius;
   float discriminant = b*b - c;
   if (discriminant < 0) return hit;
   float sqrt_dscrm = sqrt(discriminant);
   float t1 = -b + sqrt_dscrm;
   float t2 = -b - sqrt_dscrm;

   if (t1 < 0 && t2 < 0) return hit;
   hit.hit = true;
   if (t1 > 0 && t2 > 0) {
      hit.dist = min(t1, t2);
   } else {
      hit.dist = max(t1, t2);
   }
   
   hit.nextRay.origin = ray.origin + hit.dist*ray.dir;
   vec3 norm = (hit.nextRay.origin - sphere.center)/sphere.radius;
   hit.nextRay.dir = reflect(ray.dir, norm);
   hit.material.color = backgroundColor(hit.nextRay.dir);
   return hit;
}

Hit do_intersections (Ray ray) {
   Hit d;
   d.dist = 1.0 / 0.0; // infinity
   d.hit = false;

   for (int i = 0; i < 100; i++) {
      Hit newD = intersect_sphere(ray, Spheres[i]);
      if (!newD.hit) continue;
      if (newD.dist < d.dist) d = newD;
   }

   if (!d.hit) {
      d.material.color = backgroundColor(ray.dir);
      d.stopped = true;
   }

   return d;
}


void main()
{
   randomSeed = UniformRandomSeed;
   Ray ray = { camPos, normalize(rayDir) };
   const int NUM_ITERATIONS = 5;

   Hit d = do_intersections(ray);

   //vec3 randvec = randomVec_rad(d.nextRay.dir, 0.5);
   FragColor = vec4(d.material.color, 1.0f);
}