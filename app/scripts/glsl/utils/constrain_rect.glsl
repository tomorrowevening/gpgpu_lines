vec3 constrainRect(vec3 pos, vec3 bounds) {
  vec3 fPos = clamp(pos, -bounds, bounds);
  return fPos;
}

#pragma glslify: export(constrainRect)