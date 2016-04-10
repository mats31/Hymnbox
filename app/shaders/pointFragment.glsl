/** Fragment Shader **/
uniform vec3 color;
uniform sampler2D map;

varying vec3 vColor;

void main() {

  //gl_FragColor = vec4( vColor, 1.0 );
  gl_FragColor = vec4( vec3(1,1,1), 1.0 );
  gl_FragColor = gl_FragColor * texture2D( map, gl_PointCoord );
}
