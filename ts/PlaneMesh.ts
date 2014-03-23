module Overscroll {
	export class PlaneMesh {
		public static create(options) {

      //var texture = THREE.ImageUtils.loadTexture( "images/stack_overflow.png" );

      // assuming you want the texture to repeat in both directions:
      //texture.wrapS = THREE.RepeatWrapping; 
      //texture.wrapT = THREE.RepeatWrapping;

      // how many times to repeat in each direction; the default is (1,1),
      //   which is probably why your example wasn't working
      //texture.repeat.set( 4, 4 );       

      //var material = new THREE.MeshLambertMaterial({map: texture});

      //var material = new THREE.MeshBasicMaterial({map: options.texture});
      //var material = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x1255cc} );

      //var material = new THREE.LineBasicMaterial();

      //var material = new THREE.MeshBasicMaterial();

      //var material = new THREE.MeshNormalMaterial()

      //var geometry = new THREE.PlaneGeometry(options.width, options.height, options.widthSegments, options.heightSegments);


      var width = options.width;
      var height = options.height;

      var widthSegments = 1; //options.widthSegments;
      var heightSegments = 100; //options.heigtSegments;
      
      var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

      /*
      for(var i=0; i<geometry.vertices.length/2; i++) {
          geometry.vertices[2*i].y -= i;
          geometry.vertices[2*i+1].y -= i;
      }
      */

      var plane = new THREE.Mesh(geometry, options.material);
      plane.dynamic = true;

      plane.position.x += options.width/2;
      plane.position.y += options.height/2;
      plane.rotation.y = Math.PI;
      plane.rotation.z = Math.PI;

      //plane.side = THREE.DoubleSide;ww
      //plane.position.x = 100;

      // rotation.z is rotation around the z-axis, measured in radians (rather than degrees)
      // Math.PI = 180 degrees, Math.PI / 2 = 90 degrees, etc.
      //plane.rotation.z = Math.PI / 2;
      return plane;      

      //var cube = new THREE.Mesh( new THREE.CubeGeometry( 200, 200, 200 ), material );      
      //return cube;
		}
	}
}