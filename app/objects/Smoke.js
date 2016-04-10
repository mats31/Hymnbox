import THREE from 'three';

export default class Smoke extends THREE.Object3D {
  constructor() {
    super();
    this.loader = new THREE.TextureLoader();
    this.loader.load( 'assets/textures/smoke.png', ( texture ) => {
      this.geometry = new THREE.PlaneGeometry( 100, 100, 10 );

      this.material = new THREE.MeshLambertMaterial({
        color: new THREE.Color('red'),
        map: texture,
        transparent: true,
        wireframe: false,
      });

      for ( let i = 0; i < 10; i++ ) {
        this.mesh = new THREE.Mesh( this.geometry, this.material );
        this.mesh.position.set(
          Math.random() * 50 - 25,
          Math.random() * 50 - 25,
          Math.random() * 200 - 100
        );
        this.mesh.rotation.z = Math.random() * 360;
        this.add( this.mesh );
      }
    });
  }

  update() {
    // this.rotation.x += 0.01;
    // this.rotation.z += 0.01;
  }
}
