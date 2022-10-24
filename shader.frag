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
   Ray nextRay;
};

uniform Sphere Spheres[10];
uniform vec3 camPos;
uniform float UniformRandomSeed;
in vec3 rayDir;
out vec4 FragColor;
float randomSeed;



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

Hit intersect(Ray ray, Sphere sphere) {
   Hit hit;
   hit.hit = false;
	vec3 oc = ray.origin - sphere.center;
	float a = dot(ray.dir, ray.dir);
	float b = dot(oc, ray.dir);
	float c = dot(oc, oc) - sphere.radius*sphere.radius;
	float discriminant = b*b - a*c;
	if (discriminant < 0) return hit;
   float sqrtdiscriminant = sqrt(discriminant);
   float t1 = (-b + sqrtdiscriminant) / a;
   float t2 = (-b - sqrtdiscriminant) / a;
   if (t1 < 0 && t2 < 0) return hit;
   hit.hit = true;
   if (t1 > 0 && t2 > 0) {
      hit.dist = min(t1, t2);
   } else {
      hit.dist = max(t1, t2);
   }
   
   hit.nextRay.origin = hit.dist*ray.dir;
   vec3 norm = normalize(hit.nextRay.origin - sphere.center);
   hit.nextRay.dir = normalize(reflect(ray.dir, norm));
   return hit;
}


void main()
{
   randomSeed = UniformRandomSeed;
   Ray ray = { camPos, rayDir };

   Hit d;
   d.dist = 100000000000000.f;
   d.hit = false;
   
   for (int i = 0; i < 10; i++) {
      Hit newD = intersect(ray, Spheres[i]);
      if (!newD.hit) continue;
      if (newD.dist < d.dist) d = newD;
   }

   if (d.hit) {
      vec3 randvec = randomVec_rad(d.nextRay.dir, 0.5);
      FragColor = vec4(d.nextRay.dir.xy,0.2f, 1.0f);
   } else {
      FragColor = vec4(rayDir.xy, 0.2f, 1.0f);
   }
}