import THREE from 'three';
const glslify = require( 'glslify' );

export default class Point extends THREE.Object3D {
  constructor() {
    super();
    this.numPoints = 40;

    this.createPoints();
  }

  createPoints() {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array( this.numPoints * 3 );
    const colors = new Float32Array( this.numPoints * 3 );
    const sizes = new Float32Array( this.numPoints );
    const color = new THREE.Color();
    const radius = 80;

    for ( let i = 0, i3 = 0; i < this.numPoints; i ++, i3 += 3 ) {
      positions[i3 + 0] = ( Math.random() * 2 - 1 ) * radius;
      positions[i3 + 1] = ( Math.random() * 2 - 1 ) * radius;
      positions[i3 + 2] = ( Math.random() * 2 - 1 ) * 100;

      color.setHSL( Math.random(), Math.random(), Math.random() );
      colors[i3 + 0] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = 30;
    }

    this.geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    this.geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
    this.geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

    this.uniforms = {
      color: { type: 'c', value: new THREE.Color( 0xffffff ) },
      map: { type: 't', value: THREE.ImageUtils.loadTexture( 'assets/textures/particle.png' ) },
    };
    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify( '../shaders/pointVertex.glsl' ),
      fragmentShader: glslify( '../shaders/pointFragment.glsl' ),
      blending: THREE.AdditiveBlending,
      depthTest: false,
      transparent: true,
    });

    this.particleSystem = new THREE.Points( this.geometry, this.material );
    this.add( this.particleSystem );
    console.log( this.particleSystem );
  }

  update() {
    this.rotation.x += 0.0001;
    this.rotation.z += 0.0001;
  }
}
