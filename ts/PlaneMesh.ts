module Overscroll {
	export class PlaneMesh {
		public static create(options) {

      var width = options.width;
      var height = options.height;

      var widthSegments = options.widthSegments;
      var heightSegments =options.heigtSegments;
      
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

      return plane;      
		}
	}
}