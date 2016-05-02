import THREE from 'three';
window.THREE = THREE;
import Photo from './objects/Photo';
import Video from './objects/Video';
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

    this.previousCameraPosition = new THREE.Vector3();
    this.previousControlsTarget = new THREE.Vector3();

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

    // Scene for videos
    this.scene4 = new THREE.Scene();
    this.composer4 = new WAGNER.Composer( this.renderer, { useRGBA: false });
    this.composer4.setSize( width, height );
    this.renderTarget3 = new THREE.WebGLRenderTarget( width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      stencilBuffer: true,
    });

    this.composer = null;
    this.initPostprocessing();

    this.point = new Point();
    this.scene.add( this.point );

    this.video = new Video();
    this.video.position.set( 0, 0, 0 );
    this.scene4.add( this.video );

    this.photo = new Photo();
    this.photo.position.set( 0, 0, 0 );
    this.scene2.add( this.photo );

    // this.smoke = new Smoke();
    // this.scene2.add( this.smoke );

    this.lightEffect = new LightEffect( width, height );
    this.scene3.add( this.lightEffect );

    this.focus = false; // Focus

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

    // Third blendpass for videos
    this.blendPass3 = new BlendPass();
    this.blendPass3.params.mode = WAGNER.BlendMode.LinearDodge; // Lighten, LinearDodge, ColorDodge,
    this.blendPass3.params.resolution2.x = this.width;
    this.blendPass3.params.resolution2.y = this.height;
    this.blendPass3.params.aspectRatio = this.width / this.height;
    this.blendPass3.params.aspectRatio2 = this.width / this.height;
    this.blendPass3.params.tInput2 = this.renderTarget3;
  }

  prepareRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
  }

  mouseClick( e ) {
    e.preventDefault();
    if ( !this.focus ) {
      console.log('petit test');
      this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
      this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

      this.raycaster.setFromCamera( this.mouse, this.camera );
      const children = this.scene2.children.concat( this.scene4.children );
      const intersects = this.raycaster.intersectObjects( children, true );
      let object = {};
      for ( let i = 0; i < intersects.length; i++ ) {
        const intersect = intersects[i];

        if ( i === 0 ) {
          object = intersect.object;
        }

        if ( intersect.object.position.z >= object.position.z && intersect.object.position.z < this.camera.position.z ) {
          object = intersects[i].object;
        }
      }

      // Save previous camera position
      this.previousControlsTarget = Object.assign({}, this.controls.target );
      this.previousCameraPosition = Object.assign({}, this.camera.position );

      this.focusTween( false, object );
    }
  }

  focusTween( isReversed, object, layer ) {
    TweenMax.to(
      this.controls.target,
      0.5,
      {
        x: isReversed ? this.previousControlsTarget.x : object.position.x,
        y: isReversed ? this.previousControlsTarget.y : object.position.y,
        z: isReversed ? this.previousControlsTarget.z : object.position.z,
      }
    );

    TweenMax.to(
      this.camera.position,
      0.5,
      {
        x: isReversed ? this.previousCameraPosition.x : object.position.x,
        y: isReversed ? this.previousCameraPosition.y : object.position.y,
        z: isReversed ? this.previousCameraPosition.z : object.position.z + 30,
      }
    );

    if ( object.customType === 'image' ) {
      TweenMax.to(
        object.material,
        0.5,
        {
          focus: isReversed ? 0 : 1,
          onComplete: () => {
            if ( !isReversed ) {
              this.displayFocus( true, object );
            } else {
              this.focus = false;
              while ( layer.firstChild ) {
                layer.removeChild( layer.firstChild );
              }
            }
          },
        }
      );
    }

    if ( object.customType === 'video' ) {
      TweenMax.to( // Hide mask when focus
        object.material.uniforms.focus,
        0.5,
        {
          value: isReversed ? 0 : 1,
          onComplete: () => {
            if ( !isReversed ) {
              this.displayFocus( true, object );
            } else {
              this.focus = false;
              while ( layer.firstChild ) {
                layer.removeChild( layer.firstChild );
              }
            }
          },
        }
      );
    }
    if ( object.customType !== 'video' ) {
      TweenMax.to(
        this.boxBlurPass.params.delta,
        0.5,
        {
          x: isReversed ? 3.5 : 20,
          y: isReversed ? 3.5 : 20,
        }
      );
    }
  }

  displayFocus( focus, object ) {
    if ( focus ) {
      console.log(object);
      this.focus = true;
      const layer = document.getElementById( 'layer' );
      const name = document.createElement( 'p' );
      let media = {};

      if ( object.customType === 'image' ) {
        name.innerText = this.photo.imgs[object.nId];
        media = new Image();
        media.className = 'media';
        this.resizeMediaFocus(media);
        media.src = object.material.map2.image.currentSrc;

        media.onload = () => {
          layer.appendChild( media );
          layer.appendChild( name );
          layer.className = 'active';
          TweenMax.fromTo(
            name,
            0.5,
            {
              opacity: 0,
              y: -50,
            },
            {
              opacity: 1,
              y: 0,
            }
          );
          TweenMax.to(
            object.material,
            0.5,
            {
              opacity: 0,
            }
          );
        };
      }

      if ( object.customType === 'video' ) {
        name.innerText = this.video.videoDatas[object.nId].name;
        object.focused = true;
        media = object.material.uniforms.map.value.image;
        media.className = 'media';
        this.resizeMediaFocus( media );
        layer.appendChild( media );
        layer.appendChild( name );
        layer.className = 'active';
        object.material.uniforms.map.value.image.currentTime = 0;
        object.material.uniforms.map.value.image.muted = false;
        object.material.uniforms.map.value.image.play();
        TweenMax.fromTo( // Display name video
          name,
          0.5,
          {
            opacity: 0,
            y: -50,
          },
          {
            opacity: 1,
            y: 0,
          }
        );
        TweenMax.to( // Hide Mesh video
          object.material.uniforms.opacity,
          0.5,
          {
            value: 0,
          }
        );
        // TweenMax.to( // Hide mask when focus
        //   object.material.uniforms.focus,
        //   0.5,
        //   {
        //     value: 0,
        //     onComplete: () => {
        //       layer.appendChild( media );
        //       layer.appendChild( name );
        //       layer.className = 'active';
        //       TweenMax.to( // Hide Mesh video
        //         object.material.uniforms.opacity,
        //         0.5,
        //         {
        //           value: 0,
        //         }
        //       );
        //     }
        //   }
        // );
      }

      // Add events
      const that = this;
      media.addEventListener( 'click', function mediaHandler( event ) {
        event.stopPropagation(); // Stop propagation for media on click
        media.removeEventListener('click', mediaHandler);
      });

      layer.addEventListener( 'click', function layerHandler() {
        layer.removeEventListener('click', layerHandler);
        layer.className = ''; // Hide layer

        if ( object.customType === 'image' ) {
          TweenMax.to( // Re-display Sprite
            object.material,
            0.5,
            {
              opacity: 1,
            }
          );
        } else {
          console.log(object);
          // setTimeout( () => {

          // }, 200);
          TweenMax.to( // Re-display Video
            object.material.uniforms.opacity,
            0.5,
            {
              value: 1,
              onComplete: () => {
                setTimeout( () => {
                  object.material.uniforms.map.value.image.currentTime = 0;
                  object.material.uniforms.map.value.image.muted = true;
                  object.material.uniforms.map.value.image.play();
                  object.focused = false;
                })
              }
            }
          );
        }

        that.focusTween( true, object, layer );
      });
    }
  }

  resizeMediaFocus( currentMedia ) {
    const layer = document.getElementById( 'layer' );
    const media = typeof currentMedia === 'undefined' ? document.querySelector( '.media' ) : currentMedia;

    if ( typeof layer !== 'undefined' && typeof media !== 'undefined' ) {
      if ( window.innerHeight > window.innerWidth ) {
        // media.style.maxWidth = window.innerWidth * 0.5 + 'px';
        media.style.maxWidth = window.innerWidth * 0.76 + 'px';
        media.style.maxHeight = 'initial';
      } else {
        media.style.maxHeight = window.innerHeight * 0.82 + 'px';
        media.style.maxWidth = 'initial';
      }
    }
  }

  resize( width, height ) {
    if ( this.composer ) {
      this.composer.setSize( width, height );
    }

    this.resizeMediaFocus();

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

    // Third blendpass
    this.blendPass3.params.resolution2.x = this.width;
    this.blendPass3.params.resolution2.y = this.height;
    this.blendPass3.params.aspectRatio = this.width / this.height;
    this.blendPass3.params.aspectRatio2 = this.width / this.height;

    this.renderer.setSize( width, height );
  }

  render() {
    this.controls.update();
    if ( this.params.usePostprocessing ) {
      this.composer2.reset();
      this.composer3.reset();
      this.composer4.reset();
      this.composer2.renderer.clear();
      this.composer3.renderer.clear();
      this.composer4.renderer.clear();
      this.composer2.render( this.scene2, this.camera );
      this.composer2.pass( this.boxBlurPass );
      this.composer4.render( this.scene4, this.camera );
      this.composer3.render( this.scene3, this.camera2 );
      this.composer2.toTexture( this.renderTarget );
      this.composer3.toTexture( this.renderTarget2 );
      this.composer4.toTexture( this.renderTarget3 );

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
      this.composer.pass( this.blendPass3 );
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
    this.video.update();
  }
}
