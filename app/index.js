import Webgl from './Webgl';
import raf from 'raf';
import dat from 'dat-gui';
import 'gsap';

let mouseType = null;
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

// function onDocumentClick( e ) {
//   webgl.mouseClick( e );
// }

function onDocumentMouseDown( e ) {
  mouseType = 0;
}

function onDocumentMouseUp( e ) {
  if ( mouseType === 0 ) {
    webgl.mouseClick( e );
  }
}


function onDocumentMouseMove( e ) {
  mouseType = 1;
}


function resizeHandler() {
  webgl.resize( window.innerWidth, window.innerHeight );
}

function animate() {
  raf( animate );

  webgl.render();
}

// handle resize
window.addEventListener( 'resize', resizeHandler );

// Mouse click
// window.addEventListener( 'click', onDocumentClick );

// Mouse down
window.addEventListener( 'mousedown', onDocumentMouseDown );

// Mouse up
window.addEventListener( 'mouseup', onDocumentMouseUp );

// Mouse move
window.addEventListener( 'mousemove', onDocumentMouseMove );


// let's play !
animate();
