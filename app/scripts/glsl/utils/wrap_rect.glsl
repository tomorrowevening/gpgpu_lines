vec3 wrapRect(vec3 pos, vec3 bounds) {
  vec3 fPos = pos;
  
  // X
  if(fPos.x > bounds.x) {
    fPos.x -= bounds.x * 2.0;
  } else if(fPos.x < -bounds.x) {
    fPos.x += bounds.x * 2.0;
  }
  
  // Y
  if(fPos.y > bounds.y) {
    fPos.y -= bounds.y * 2.0;
  } else if(fPos.y < -bounds.y) {
    fPos.y += bounds.y * 2.0;
  }
  
  // Z
  if(fPos.z > bounds.z) {
    fPos.z -= bounds.z * 2.0;
  } else if(fPos.z < -bounds.z) {
    fPos.z += bounds.z * 2.0;
  }
  
  return fPos;
}

#pragma glslify: export(wrapRect)