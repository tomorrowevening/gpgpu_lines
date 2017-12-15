#pragma glslify: rand = require('./rand')

vec3 randomWrapRect(vec3 pos, vec3 bounds) {
  vec3 fPos = pos;
  
  // X
  if(fPos.x > bounds.x) {
    fPos.x -= bounds.x * 2.0;
    fPos.y = ((rand(fPos.xy) * 2.0) - 1.0) * bounds.x;
    fPos.z = ((rand(fPos.yz) * 2.0) - 1.0) * bounds.z;
  } else if(fPos.x < -bounds.x) {
    fPos.x += bounds.x * 2.0;
    fPos.y = ((rand(fPos.xy) * 2.0) - 1.0) * bounds.x;
    fPos.z = ((rand(fPos.yz) * 2.0) - 1.0) * bounds.z;
  }
  
  // Y
  if(fPos.y > bounds.y) {
    fPos.y -= bounds.y * 2.0;
    fPos.x = ((rand(fPos.xy) * 2.0) - 1.0) * bounds.x;
    fPos.z = ((rand(fPos.yz) * 2.0) - 1.0) * bounds.z;
  } else if(fPos.y < -bounds.y) {
    fPos.y += bounds.y * 2.0 - (rand(fPos.xz) * 0.01);
    fPos.x = ((rand(fPos.xy) * 2.0) - 1.0) * bounds.x;
    fPos.z = ((rand(fPos.yz) * 2.0) - 1.0) * bounds.z;
  }
  
  // Z
  if(fPos.z > bounds.z) {
    fPos.z -= bounds.z * 2.0;
    fPos.x = ((rand(fPos.xy) * 2.0) - 1.0) * bounds.x;
    fPos.y = ((rand(fPos.yz) * 2.0) - 1.0) * bounds.x;
  } else if(fPos.z < -bounds.z) {
    fPos.z += bounds.z * 2.0;
    fPos.x = ((rand(fPos.xy) * 2.0) - 1.0) * bounds.x;
    fPos.y = ((rand(fPos.yz) * 2.0) - 1.0) * bounds.x;
  }
  
  return fPos;
}

#pragma glslify: export(randomWrapRect)