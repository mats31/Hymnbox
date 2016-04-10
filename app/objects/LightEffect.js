import THREE from 'three';
const glslify = require('glslify');

export default class LightEffect extends THREE.Object3D {
  constructor(width, height ) {
    super();

    this.clock = new THREE.Clock();
    this.geometry = new THREE.BufferGeometry().fromGeometry( new THREE.PlaneGeometry( width, height ) );

    this.uniforms = {
      easing: { type: 'f', value: 0.001 },
      time: { type: 'f', value: 0 },
      hue: { type: 'f', value: 0.1 },
      brightness: { type: 'f', value: 1 },
      // base: { type: 'c', value: new THREE.Color( 331029 ) },
      base: { type: 'c', value: new THREE.Color( 'white' ) },
    }
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify('../shaders/lightVertex.glsl'),
      fragmentShader: glslify('../shaders/lightFragment.glsl'),
      transparent: true,
    });

    this.mesh = new THREE.Mesh( this.geometry, this.material );
    this.mesh.position.z = -100;
    this.add( this.mesh );

  }

  update() {
    this.uniforms.time.value = this.clock.getElapsedTime() * 0.1;
    // this.position.x += 0.1;
    // this.rotation.x += 0.01;
    // this.rotation.z += 0.01;
  }
}
