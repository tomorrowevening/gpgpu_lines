uniform sampler2D tDiffuse;
varying vec2 vUv;

void main() {
  vec4 img = texture2D(tDiffuse, vUv);
  gl_FragColor = img;
}
