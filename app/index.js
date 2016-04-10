import Webgl from './Webgl';
import raf from 'raf';
import dat from 'dat-gui';
import 'gsap';

let webgl;
let gui;

// webgl settings
webgl = new Webgl(window.innerWidth, window.innerHeight);
document.body.appendChild(webgl.renderer.domElement);

// GUI settings
gui = new dat.GUI();
gui.add(webgl.params, 'usePostprocessing');
gui.add(webgl.vignette.params, 'boost' ).min(0).max(10);
gui.add(webgl.vignette.params, 'reduction' ).min(0).max(10);
gui.add(webgl.bloomPass.params, 'blendMode' ).min(0).max(10);
gui.add(webgl.bloomPass.params, 'blurAmount' ).min(0).max(10);
gui.add(webgl.boxBlurPass.params.delta, 'x' ).min(0).max(50);
gui.add(webgl.boxBlurPass.params.delta, 'y' ).min(0).max(50);
gui.add(webgl.lightEffect.uniforms.easing, 'value' ).min(0.000).max(0.01);

function onDocumentClick( e ) {
  webgl.mouseClick( e );
}

function animate() {
  raf( animate );

  webgl.render();
}

function resizeHandler() {
  webgl.resize( window.innerWidth, window.innerHeight );
}

// handle resize
window.addEventListener( 'resize', resizeHandler );

// Mouse move
window.addEventListener( 'click', onDocumentClick );

// let's play !
animate();
