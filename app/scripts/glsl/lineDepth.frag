#include <packing>
uniform sampler2D tPos;
varying vec2 vUv;

void main() {
  vec4 pixel = texture2D( tPos, vUv );
  if ( pixel.a < 0.15 ) discard;
  gl_FragData[ 0 ] = packDepthToRGBA( gl_FragCoord.z );
}