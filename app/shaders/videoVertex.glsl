varying vec2 vUv;
varying float zPos;

void main() {
  vUv = uv;
  vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  zPos = pos.z;

  gl_Position = pos;
}
