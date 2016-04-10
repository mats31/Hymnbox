import THREE from 'three';
require( '../class/SpritePlugin' )( THREE );
require( '../class/SpriteMaterial' )( THREE );

export default class Photo extends THREE.Object3D {
  constructor() {
    super();

    this.canvas = document.createElement( 'canvas' );
    this.canvas.className = 'second';
    this.context = this.canvas.getContext( '2d' );
    //document.body.appendChild( this.canvas );
    this.sprites = [];
    const imgs = [
      'cousins.png',
      'filles.png',
      'julie.png',
      'mariage-1.jpg',
      'mariage-2.jpg',
      'mariage-3.jpg',
      'mariage-4.jpg',
      'mariage-5.jpg',
      'mariage-6.jpg',
      'mariage-7.jpg',
      'mariage-8.jpg',
      'mariage-9.jpg',
      'mariage.png',
      'parents.png',
      'photoclasse.png',
    ];

    this.loader = new THREE.TextureLoader();

    for ( let i = 0; i < imgs.length; i++ ) {
      const img = new Image();
      const that = this;
      img.src = 'assets/img/' + imgs[i];
      // img.onload = () => {
      //   this.setPictureWithMask( img );
      // };
      img.onload = (function (currentImg) {
        return function() {
          that.setPictureWithMask( currentImg );
        }
      }(img));
    }
  }

  setPictureWithMask( img ) {
    const mask = new Image(); // width = 1000 / height = 888
    const that = this;
    let maskWidth = 0;
    let maskHeight = 0;
    mask.src = 'assets/img/mask.png';

    mask.onload = (function (currentImg) {
      return function() {
        // console.log(currentImg.width);
        // console.log(currentImg.height);
        // console.log(currentImg.width / mask.width);
        // console.log(currentImg.height / mask.height);

        if ( currentImg.width / mask.width < currentImg.height / mask.height ) { // If currentImg's width is bigger
          // console.log(1);
          maskWidth = mask.width * ( currentImg.width / mask.width );
          maskHeight = maskWidth * 0.888;
          // maskHeight = mask.height * ( currentImg.height / mask.height );
        } else if ( currentImg.width / mask.width > currentImg.height / mask.height ) {// If currentImg's height is bigger
          // console.log(2);
          // maskWidth = mask.width * ( currentImg.width / mask.width );
          // maskHeight = mask.height * ( currentImg.height / mask.height );
          maskHeight = mask.height * ( currentImg.height / mask.height );
          maskWidth = maskHeight * 1.12612;
        } else { // If currentImg's width and height are equals
          // console.log(3);
          maskWidth = mask.width * ( currentImg.width / mask.width );
          maskHeight = mask.height * ( currentImg.height / mask.height );
        }

        that.canvas.height = maskHeight;
        that.canvas.width = maskWidth;
        that.context.save();
        that.context.drawImage( mask, 0, 0, maskWidth, maskHeight );
        that.context.globalCompositeOperation = 'source-in'; // Only overwrite existing pixels
        that.context.drawImage( currentImg, 0, 0, currentImg.width, currentImg.height );
        that.context.restore();

        const customImg = new Image();
        customImg.src = that.canvas.toDataURL( 'image/png' ).replace( 'image/png', 'image/octet-stream' );
        customImg.onload = () => {
          that.createSprite( customImg.src, img.src );
        };
      }
    }(img));

    // mask.onload = () => {
    //   this.canvas.height = img.width;
    //   this.canvas.width = img.height;
    //   console.log(this.canvas);
    //
    //   if ( img.width / mask.width < img.height / mask.height ) { // If img's width is bigger
    //     console.log( 1 );
    //     maskWidth = mask.width * ( img.width / mask.width );
    //     maskHeight = mask.height * ( img.width / mask.width );
    //   } else if ( img.width / mask.width > img.height / mask.height ) {// If height's width is bigger
    //     console.log( 2 );
    //     maskWidth = mask.width * ( img.height / mask.height );
    //     maskHeight = mask.height * ( img.height / mask.height );
    //   } else { // If img's width and height are equals
    //     console.log( 3 );
    //     maskWidth = mask.width * ( img.width / mask.width );
    //     maskHeight = mask.height * ( img.width / mask.width );
    //   }
    //
    //   this.context.save();
    //   this.context.drawImage( mask, img.width / 2 - maskWidth / 2, img.height / 2 - maskHeight / 2, maskWidth, maskHeight );
    //   this.context.globalCompositeOperation = 'source-in'; // Only overwrite existing pixels
    //   this.context.drawImage( img, 0, 0, img.width, img.height );
    //   this.context.restore();
    //
    //   const customImg = new Image();
    //   customImg.src = this.canvas.toDataURL( 'image/png' ).replace("image/png", "image/octet-stream");
    //   customImg.onload = () => {
    //     this.createSprite( customImg.src );
    //   };
    // };
  }

  createSprite( maskImg, nativeImg ) {
    this.loader.load( maskImg, ( maskTexture ) => {
      this.loader.load( nativeImg, ( nativeTexture ) => {
        maskTexture.minFilter = THREE.LinearFilter;
        nativeTexture.minFilter = THREE.LinearFilter;

        // const indices = new Uint16Array( [ 0, 1, 2,  0, 2, 3 ] );
        // const vertices = new Float32Array( [ - 0.5, - 0.5, 0,   0.5, - 0.5, 0,   0.5, 0.5, 0,   - 0.5, 0.5, 0 ] );
        // const uvs = new Float32Array( [ 0, 0,   1, 0,   1, 1,   0, 1 ] );
        //
        // this.geometry = new THREE.BufferGeometry();
        // this.geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
        // this.geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        // this.geometry.addAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );
        //
        // this.material =

        const material = new THREE.SpriteMaterial({
          map: maskTexture,
          map2: nativeTexture, // custom uniform
          opacity: 1,
          focus: 0, // custom uniform
          fog: false,
          transparent: false,
          //rotation: Math.random() * 0.5 - 0.25,
        });

        const sprite = new THREE.Sprite( material );
        sprite.scale.set( 20, 20, 1.0 );
        sprite.position.set(
          Math.random() * 150 - 75,
          Math.random() * 150 - 75,
          Math.random() * 200 - 100
        );
        // const geometry = new THREE.PlaneGeometry( 20, 20, 1 );
        // const planeMaterial = new THREE.MeshBasicMaterial({
        //   color: 0xffffff,
        //   opacity: 0,
        //   transparent: true,
        //   wireframe: false,
        // });
        // const mesh = new THREE.Mesh( geometry, planeMaterial );
        // mesh.position.set(
        //   sprite.position.x,
        //   sprite.position.y,
        //   sprite.position.z
        // );
        //
        // const object = new THREE.Object3D();
        // object.add( mesh );
        // object.add( sprite );
        //
        // this.add( object );
        // this.sprites.push( object );
        this.add(sprite);
        this.sprites.push(sprite);

        // const geometry = new THREE.CylinderGeometry( 5, 5, 1, 200 );
        // const material = new THREE.MeshBasicMaterial({
        //   //color: 0xffffff,
        //   map: texture,
        //   //side: THREE.DoubleSide,
        //   //wireframe: true,
        // });
        //
        // const mesh = new THREE.Mesh( geometry, material );
        // mesh.rotation.x = 1.4;
        // mesh.position.set(
        //   Math.random() * 200 - 100,
        //   Math.random() * 200 - 100,
        //   Math.random() * 100 - 50
        // );
        // this.add( mesh );

        // const geometry = new THREE.PlaneGeometry( 10, 10, 1 );
        // const material = new THREE.MeshBasicMaterial({
        //   //color: 0xffffff,
        //   map: texture,
        //   side: THREE.DoubleSide,
        //   //wireframe: true,
        // });
        //
        // const mesh = new THREE.Mesh( geometry, material );
        // mesh.position.set(
        //   Math.random() * 200 - 100,
        //   Math.random() * 200 - 100,
        //   Math.random() * 100 - 50
        // );
        // this.add( mesh );
      });
    });
  }

  update() {
    // this.rotation.x += 0.01;
    // this.rotation.z += 0.01;
  }
}
