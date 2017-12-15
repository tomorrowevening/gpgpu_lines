uniform vec4 color;
varying float depth;

void main() {
  gl_FragColor = vec4(color.xyz, mix(0.1, 1.0, depth) * color.a);
}