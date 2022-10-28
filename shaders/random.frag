float rng() {
   randomSeed = abs(fract(sin(dot(rayDir, vec3(12.9898,78.233,58.5453)))*(randomSeed*100000)));
   return randomSeed;
}

// computes a sort-of normal distribution, clamped between -1 and 1
float normal_rng() {
   float rand1 = rng();
   float rand2 = rng();
   float normal_rand = sqrt(-2*log(rand1))*cos(PI_2*rand2);
   normal_rand /= 2.5f;
   normal_rand = min(max(-1.f, normal_rand), 1.f);
   return normal_rand;
}

// randomly returns true with probability provided
bool prob_b(float probability) {
   return rng() < probability;
}

float prob_f(float probability) {
   return prob_b(probability) ? 1.0f : 0.0f;
}

vec3 randomVec_rad(vec3 input_vec, float rads) {
   // returns a normally distributed random vector within `rads` radians of input_vec
   float rotation = rads * normal_rng();
   vec3 perp = normalize(cross(input_vec, vec3(rng(),rng(),rng())));

   return rotate(input_vec, perp, rads);
}