uniform sampler2D tPos;
uniform sampler2D tVel;
uniform vec3 bounds;
uniform float time;
uniform float constrain;
uniform float wrap;
varying vec2 vUv;

#pragma glslify: constrainRect = require(./utils/constrain_rect.glsl)
#pragma glslify: randomWrapRect = require(./utils/wrap_randomRect.glsl)
#pragma glslify: wrapRect = require(./utils/wrap_rect.glsl)

void main() {
  vec3 pos = texture2D(tPos, vUv).xyz;
  vec3 vel = texture2D(tVel, vUv).xyz;
  vec3 fPos = pos + (vel * time);
  
  if(constrain > 0.0) {
    fPos = constrainRect(fPos, bounds);
  } else if(wrap > 1.0) {
    fPos = randomWrapRect(fPos, bounds);
  } else if(wrap > 0.0) {
    fPos = wrapRect(fPos, bounds);
  }
  
  gl_FragColor = vec4(fPos, 1.0);
}