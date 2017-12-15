uniform vec4 colorA;
uniform vec4 colorB;
varying float depth;

void main() {
  vec4 color = mix(colorB, colorA, depth);
  gl_FragColor = color;
}