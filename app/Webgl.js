import THREE from 'three';
window.THREE = THREE;
import Photo from './objects/Photo';
import Smoke from './objects/Smoke';
import Point from './objects/Point';
import LightEffect from './objects/LightEffect';
import OrbitControls from './class/OrbitControls';

import TweenMax from 'gsap';

import WAGNER from '@superguigui/wagner';
import VignettePass from '@superguigui/wagner/src/passes/vignette/VignettePass';
import MultiPassBloomPass from '@superguigui/wagner/src/passes/bloom/MultiPassBloomPass';
import FXAAPass from '@superguigui/wagner/src/passes/fxaa/FXAAPass';
import BlendPass from '@superguigui/wagner/src/passes/blend/BlendPass';
import BoxBlurPass from './class/CustomBoxBlurPass';

export default class Webgl {
  constructor( width, height ) {
    this.params = {
      usePostprocessing: true,
    };

    this.prepareRaycaster();

    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025, 100000 );

    this.camera = new THREE.PerspectiveCamera( 50, width / height, 1, 1000 );
    this.camera2 = new THREE.OrthographicCamera(
      window.innerWidth / - 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / - 2,
      -10000,
      10000
    );
    this.camera.position.z = 100;
    this.camera2.position.z = 100;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize( width, height );
    //this.renderer.setClearColor( 0x0b1c1f );
    this.renderer.setClearColor( 0x150E24 );

    // Scene for pictures
    this.scene2 = new THREE.Scene();
    this.composer2 = new WAGNER.Composer( this.renderer, { useRGBA: false });
    this.composer2.setSize( width, height );
    this.renderTarget = new THREE.WebGLRenderTarget( width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true,
    });

    // Scene for light effects
    this.scene3 = new THREE.Scene();
    this.composer3 = new WAGNER.Composer( this.renderer, { useRGBA: false });
    this.composer3.setSize( width, height );
    this.renderTarget2 = new THREE.WebGLRenderTarget( width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true,
    });

    this.composer = null;
    this.initPostprocessing();

    this.point = new Point();
    this.scene.add( this.point );

    this.photo = new Photo();
    this.photo.position.set( 0, 0, 0 );
    this.scene2.add( this.photo );

    // this.smoke = new Smoke();
    // this.scene2.add( this.smoke );

    this.lightEffect = new LightEffect( width, height );
    this.scene3.add( this.lightEffect );

    // this.ground = new Ground();
    // this.ground.position.set( 0, 0, 0 );
    // this.scene3.add( this.ground );

    // this.spotLight = new THREE.SpotLight( 0xffffff, 0.8 );
    // this.spotLight.position.set( 0, 450, 0 );
    // this.spotLight.castShadow = true;
    // this.spotLight.shadow.camera.fov = 50;
    // this.spotLight.shadow.mapSize.width = 2048;
    // this.spotLight.shadow.mapSize.height = 2048;
    // this.spotLight.shadow.bias = 0;
    // this.scene.add( this.spotLight );
    this.initControls();
  }

  initControls() {
    this.controls = window.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    this.controls.enableRotate = false;
    this.controls.minDistance = -500;
    this.controls.maxDistance = 500;
    //this.controls.maxAzimuthAngle = 10;
    //this.controls.maxPolarAngle = 0;
    //this.controls.maxAzimuthAngle = 0;
    //this.controls.minAzimuthAngle = 0;
    //this.controls.minPolarAngle = 0;
    console.log(this.controls);
  }

  initPostprocessing() {
    this.composer = new WAGNER.Composer( this.renderer );

    this.vignette = new VignettePass();
    this.vignette.params.boost = 1.4;
    this.vignette.params.reduction = 0;

    this.bloomPass = new MultiPassBloomPass();
    this.bloomPass.params.blendMode = 5;
    this.bloomPass.params.blurAmount = 0;

    this.fxaa = new FXAAPass();

    // First blendpass for pictures
    this.boxBlurPass = new BoxBlurPass();
    this.boxBlurPass.params.delta.x = 3.5;
    this.boxBlurPass.params.delta.y = 3.5;
    //console.log(this.boxBlurPass);
    this.blendPass = new BlendPass();
    this.blendPass.params.mode = WAGNER.BlendMode.Screen; // Lighten, LinearDodge, ColorDodge,
    this.blendPass.params.resolution2.x = this.width;
    this.blendPass.params.resolution2.y = this.height;
    this.blendPass.params.aspectRatio = this.width / this.height;
    this.blendPass.params.aspectRatio2 = this.width / this.height;
    this.blendPass.params.tInput2 = this.renderTarget;

    // Second blendpass for light effects
    this.blendPass2 = new BlendPass();
    this.blendPass2.params.mode = WAGNER.BlendMode.LinearDodge; // Lighten, LinearDodge, ColorDodge,
    this.blendPass2.params.resolution2.x = this.width;
    this.blendPass2.params.resolution2.y = this.height;
    this.blendPass2.params.aspectRatio = this.width / this.height;
    this.blendPass2.params.aspectRatio2 = this.width / this.height;
    this.blendPass2.params.tInput2 = this.renderTarget2;
  }

  prepareRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
  }

  mouseClick( e ) {
    e.preventDefault();
    this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

    this.raycaster.setFromCamera( this.mouse, this.camera );
    const children = this.scene2.children[0].children;
    const intersects = this.raycaster.intersectObjects( children );
    for ( let i = 0; i < intersects.length; i++ ) {
      const intersect = intersects[i];
      console.log(intersect);
      TweenMax.to(
        this.controls.target,
        0.5,
        {
          x: intersect.object.position.x,
          y: intersect.object.position.y,
          z: intersect.object.position.z,
        }
      );
      // TweenMax.to(
      //   this.controls.object.zoom,
      //   0.5,
      //   {
      //     x: intersect.object.position.x,
      //     y: intersect.object.position.y,
      //     z: intersect.object.position.z,
      //     onComplete: () => {
      //     }
      //   }
      // );
      // TweenMax.to(
      //   this.controls.object.position,
      //   0.5,
      //   {
      //     z: intersect.object.position.z + 30,
      //     // onComplete: () => {
      //     //   this.controls.object.zoom = 3;
      //     //   this.controls.object.updateProjectionMatrix();
      //     // },
      //   }
      // );
      TweenMax.to(
        this.camera.position,
        0.5,
        {
          x: intersect.object.position.x,
          y: intersect.object.position.y,
          z: intersect.object.position.z + 30,
          // onComplete: () => {
          //   TweenMax.to( intersect.object.material, 0.5, { focus: 1});
          // }
        }
      );
      TweenMax.to(
        intersect.object.material,
        0.5,
        {
          focus: 1,
          onComplete: () => {
            console.log(intersect.object);
            this.displayFocus(true);
          },
        }
      );
      TweenMax.to(
        this.boxBlurPass.params.delta,
        0.5,
        {
          x: 40,
          y: 40,
        }
      );
      break;
    }
  }

  displayFocus(focus) {
    if ( focus ) {
      const layer = document.getElementById('layer');
      layer.className = 'active';
    }
  }

  resize( width, height ) {
    if ( this.composer ) {
      this.composer.setSize(width, height);
    }

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.camera2.aspect = width / height;
    this.camera2.updateProjectionMatrix();

    // First blendpass
    this.blendPass.params.resolution2.x = this.width;
    this.blendPass.params.resolution2.y = this.height;
    this.blendPass.params.aspectRatio = this.width / this.height;
    this.blendPass.params.aspectRatio2 = this.width / this.height;

    // Second blendpass
    this.blendPass2.params.resolution2.x = this.width;
    this.blendPass2.params.resolution2.y = this.height;
    this.blendPass2.params.aspectRatio = this.width / this.height;
    this.blendPass2.params.aspectRatio2 = this.width / this.height;

    this.renderer.setSize( width, height );
  }

  render() {
    this.controls.update();
    if ( this.params.usePostprocessing ) {
      this.composer2.reset();
      this.composer3.reset();
      this.composer2.renderer.clear();
      this.composer3.renderer.clear();
      this.composer2.render( this.scene2, this.camera );
      this.composer2.pass( this.boxBlurPass );
      this.composer3.render( this.scene3, this.camera2 );
      this.composer2.toTexture( this.renderTarget );
      this.composer3.toTexture( this.renderTarget2 );

      // this.composer3.reset();
      // this.composer3.renderer.clear();
      // this.composer3.render( this.scene3, this.camera );
      // this.composer3.toTexture( this.renderTarget2 );
      // this.composer.render();

      //this.renderer.autoClearColor = true;
      this.composer.reset();
      this.composer.render( this.scene, this.camera );
      this.composer.pass( this.vignette );
      this.composer.pass( this.bloomPass );
      this.composer.pass( this.fxaa );
      this.composer.pass( this.blendPass2 );
      this.composer.pass( this.blendPass );
      this.composer.toScreen();
    } else {
      this.renderer.render( this.scene, this.camera );
    }

    // if ( this.camera.position.x > 30 ) {
    //   this.camera.position.set( 30, this.camera.position.y, this.camera.position.z );
    // }
    // Update the picking ray with the camera and mouse position

    //console.log(this.photo.children[0].position);
    this.point.update();
    this.lightEffect.update();
    this.photo.update();
  }
}
