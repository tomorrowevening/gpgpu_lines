uniform sampler2D tAcc;
uniform sampler2D tVel;
uniform sampler2D tPos;

uniform vec3 mouse;
uniform float mouseRadius;
uniform float mouseStrength;
uniform float time;

varying vec2 vUv;

void main() {
  vec3 acc = texture2D(tAcc, vUv).xyz;
  vec3 vel = texture2D(tVel, vUv).xyz;
  vel += acc * time;
  
  float strength = 0.1;
  vec3 pos = texture2D(tPos, vUv).xyz;
  vec3 dir = mouse - pos;
  float dist = length(dir);
  if(dist < mouseRadius * 1.0) {
    dir = normalize(dir);
    vel -= dir * mouseStrength;
    strength = (3.0 * mouseStrength);
  }
  
  gl_FragColor = vec4(vel, strength);
}
