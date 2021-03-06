/* eslint-disable */
'use strict';

var THREE = require('three');
var glslify = require('glslify');
var Pass = require('@superguigui/wagner/src/Pass');
var vertex = glslify('@superguigui/wagner/src/shaders/vertex/basic.glsl');
var fragment = glslify('../shaders/customBoxBlurFs.glsl');

function BoxBlurPass(deltaX, deltaY) {
  Pass.call(this);

  this.setShader(vertex, fragment);
  this.params.delta = new THREE.Vector2(deltaX || 0, deltaY || 0);
}

module.exports = BoxBlurPass;

BoxBlurPass.prototype = Object.create(Pass.prototype);
BoxBlurPass.prototype.constructor = BoxBlurPass;

BoxBlurPass.prototype.run = function(composer) {
  this.shader.uniforms.delta.value.copy(this.params.delta);
  composer.pass(this.shader);

};
