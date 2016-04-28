import THREE from 'three';
const glslify = require( 'glslify' );

export default class Video extends THREE.Object3D {
  constructor() {
    super();

    this.videoDatas = [
      {
        name: 'Le Lapin Blanc',
        src: 'assets/videos/video_01.mp4',
      },
      {
        name: 'Le Lapin Blanc',
        src: 'assets/videos/video_01.mp4',
      },
      {
        name: 'Le Lapin Blanc',
        src: 'assets/videos/video_01.mp4',
      },
      {
        name: 'Le Lapin Blanc',
        src: 'assets/videos/video_01.mp4',
      },
    ];

    this.videos = [];

    this.loader = new THREE.TextureLoader();

    this.geometry = new THREE.PlaneGeometry( 20, 20 );

    this.createVideo();
  }

  createVideo() {
    this.loader.load( 'assets/img/mask.png', ( maskTexture ) => {
      for ( let i = 0; i < this.videoDatas.length; i++ ) {
        const video = document.createElement( 'video' );
        video.src = this.videoDatas[i].src;
        video.loop = true;
        video.muted = true;
        video.play();

        const texture = new THREE.VideoTexture( video );
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBFormat;

        const uniforms = {
          focus: { type: 'f', value: 0 },
          map: { type: 't', value: texture },
          maskMap: { type: 't', value: maskTexture },
          opacity: { type: 'f', value: 1 },
        };


        const material = new THREE.ShaderMaterial({
          fragmentShader: glslify( '../shaders/videoFragment.glsl' ),
          transparent: true,
          uniforms,
          vertexShader: glslify( '../shaders/videoVertex.glsl' ),
        });

        const mesh = new THREE.Mesh( this.geometry, material );
        mesh.customType = 'video';
        mesh.focused = false;
        mesh.nId = i;
        mesh.position.set(
          Math.random() * 150 - 75,
          Math.random() * 150 - 75,
          Math.random() * 200 - 100
        );
        mesh.rotation.set(
          Math.random() * 0.5 - 0.25,
          Math.random() * 0.5 - 0.25,
          Math.random() * 0.5 - 0.25
        );
        this.videos.push( mesh );
        this.add( mesh );
      }
    });
  }

  update() {
    for ( let i = 0; i < this.videos.length; i++ ) {
      const video = this.videos[i].material.uniforms.map.value.image;
      if ( !this.videos[i].focused && video.currentTime >= video.duration * 0.1 ) {
        video.currentTime = 0;
      }
    }
  }
}
