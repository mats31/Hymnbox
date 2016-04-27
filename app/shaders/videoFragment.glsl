varying vec2 vUv;
varying float zPos;

uniform float focus;
uniform float opacity;
uniform sampler2D map;
uniform sampler2D maskMap;

void main() {
  vec4 texture = texture2D(map, vUv);
  vec4 mask = texture2D(maskMap, vUv);

  // vec4 color = vec4(1.0, 1.0, 1.0, 0.0);
  //
  // // If focused
  mask.a = mask.a + focus;
  //
  // if (mask.r != 0.0) {
  //   color = vec4(texture.r, texture.g, texture.b, (1.0 - (zPos / 300.0) ) * opacity );
  // }
  vec4 color = vec4(texture.rgb, (1.0 - (zPos / 300.0) ) * clamp( mask.a, 0.0, 1.0 ) * opacity);

  gl_FragColor = color;

}
