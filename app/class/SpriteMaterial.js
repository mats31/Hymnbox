/* eslint-disable */
module.exports = function(THREE) {

  THREE.SpriteMaterial = function ( parameters ) {

  	THREE.Material.call( this );

  	this.type = 'SpriteMaterial';

  	this.color = new THREE.Color( 0xffffff );
  	this.map = null;
  	this.map2 = null;
    this.focus = 0.0;

  	this.rotation = 0;

  	this.fog = false;

  	// set parameters

  	this.setValues( parameters );

  };

  THREE.SpriteMaterial.prototype = Object.create( THREE.Material.prototype );
  THREE.SpriteMaterial.prototype.constructor = THREE.SpriteMaterial;
};
