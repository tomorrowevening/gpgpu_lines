uniform sampler2D tPos;
uniform sampler2D tPrev;
uniform vec3 bounds;
varying vec2 vUv;

const float MIN_SIZE = 1.0;

void main() {
  vUv = position.xy;
  
  vec3 pos  = position;
  vec3 cur  = texture2D(tPos, vUv).xyz;
  vec3 prev = texture2D(tPrev, vUv).xyz;
  if(position.z > 0.0) {
    pos = prev;
    
    float distX = distance(cur.x, prev.x);
    float distY = distance(cur.y, prev.y);
    float distZ = distance(cur.z, prev.z);
    if(distX > bounds.x) pos = cur;
    if(distY > bounds.y) pos = cur;
    if(distZ > bounds.z) pos = cur;
    
    if(distance(pos, cur) < MIN_SIZE) {
      pos += vec3(0.0, MIN_SIZE, 0.0);
    }
  } else {
    pos = cur;
  }
  
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  gl_Position = projectionMatrix * mvPosition;
}
