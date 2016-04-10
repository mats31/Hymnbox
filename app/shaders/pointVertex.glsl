/** Vertex Shader **/
attribute float size;
attribute float velocity;
attribute vec3 customColor;

varying vec3 vColor;

void main() {
  vColor = customColor;

  vec4 mvPosition = modelViewMatrix * vec4( position.x, position.y, position.z, 1.0 );

  gl_PointSize = size * ( 50.0 / length( mvPosition.xyz ) );

  gl_Position = projectionMatrix * mvPosition;
}
