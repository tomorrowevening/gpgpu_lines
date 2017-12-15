uniform sampler2D tVel;
uniform float friction;
uniform vec3 force;
uniform float time;
varying vec2 vUv;

void main() {
  vec3 vel = texture2D(tVel, vUv).xyz;
  vel += force * time;
  gl_FragColor = vec4(-vel * friction, 1.0);
}
