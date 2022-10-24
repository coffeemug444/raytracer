#version 460 core
uniform vec3 camPos;
uniform float random;
in vec3 rayDir;
out vec4 FragColor;

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
   Ray nextRay;
};



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
   hit.nextRay.dir = normalize(reflect(hit.nextRay.origin, norm));
   return hit;
}

Sphere mySphere = {
   {
      {
         1.f, 0.8f, 0.2f
      },
      1.0f,
      0.0f,
      1.f
   },
   {
      10.0f, 0.f, 5.0f
   },
   2.f
};

void main()
{
   Ray ray = { camPos, rayDir };

   Hit d = intersect(ray, mySphere);

   if (d.hit) {
      FragColor = vec4(d.nextRay.dir.x, d.nextRay.dir.y, 0.2f, 1.0f);
   } else {
      FragColor = vec4(rayDir.x, rayDir.y, 0.2f, 1.0f);
   }

   
}