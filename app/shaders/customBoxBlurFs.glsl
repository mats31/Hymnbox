varying vec2 vUv;
uniform sampler2D tInput;
uniform vec2 delta;
uniform vec2 resolution;

void main() {

  vec4 sum = vec4( 0. );
  vec2 inc = delta / resolution;

  vec2 center = resolution * 0.5;
  float vignette = distance( center, gl_FragCoord.xy ) / resolution.x;

  sum += (texture2D( tInput, ( vUv - (inc * 4. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.051);
  sum += (texture2D( tInput, ( vUv - (inc * 3. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.0918);
  sum += (texture2D( tInput, ( vUv - (inc * 2. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.12245);
  sum += (texture2D( tInput, ( vUv - (inc * 1. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.1531);
  sum += (texture2D( tInput, ( vUv + (inc * 0. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.1633);
  sum += (texture2D( tInput, ( vUv + (inc * 1. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.1531);
  sum += (texture2D( tInput, ( vUv + (inc * 2. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.12245);
  sum += (texture2D( tInput, ( vUv + (inc * 3. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.0918);
  sum += (texture2D( tInput, ( vUv + (inc * 4. * ( clamp(vignette, 0.0, 1.0) - 0.1 ) ) ) ) * 0.051);

  gl_FragColor = sum;

}
