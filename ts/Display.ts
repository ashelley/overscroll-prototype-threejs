module Overscroll {
	export class Display {

    public mesh;
    public isAtTop;
    public isAtBottom;

    private height;
    private width;
    private segmentHeight;

    private scene;

		public static create(options) {

      var width = options.width;
      var height = options.height;
      var scene = options.scene;

      var instance = new Display();
      instance.height = height;
      instance.width = width;
      instance.scene = scene;


      var geometry = new THREE.Geometry();

      var x = -width / 2;
      var y = -height / 2;
      var endY = y;
      var verticleSegments = 0;
      var faceIndex = 0;
      var normalizedY = 0;
      var segmentHeight = (height/10); 

      instance.segmentHeight = segmentHeight;

      for(var i = 0; i < height; i++) {
      
        endY += segmentHeight;

        geometry.vertices.push(new THREE.Vector3(x, y, 0));
        geometry.vertices.push(new THREE.Vector3(x + width, y, 0));
        geometry.vertices.push(new THREE.Vector3(x + width, endY, 0));
        geometry.vertices.push(new THREE.Vector3(x, endY, 0));

        var newNormalizedY = normalizedY + (segmentHeight / height);

        var uvs = [];
        uvs.push(new THREE.Vector2(0,normalizedY));
        uvs.push(new THREE.Vector2(1,normalizedY));
        uvs.push(new THREE.Vector2(1,newNormalizedY));
        uvs.push(new THREE.Vector2(0,newNormalizedY));

        geometry.faces.push(new THREE.Face3(verticleSegments, verticleSegments + 1, verticleSegments + 2));
        geometry.faces.push(new THREE.Face3(verticleSegments, verticleSegments + 2, verticleSegments + 3));

        geometry.faceVertexUvs[0][faceIndex] = [uvs[0], uvs[1], uvs[2]];
        geometry.faceVertexUvs[0][faceIndex + 1] = [uvs[0], uvs[2], uvs[3]];

        faceIndex += 2;
        verticleSegments += 4;
        i += segmentHeight;
        y = endY;
        normalizedY = newNormalizedY;
      }     
      
      var plane = new THREE.Mesh(geometry, options.material);
      plane.dynamic = true;

      plane.position.x += options.width/2;
      plane.position.y += options.height/2;
      plane.rotation.y = Math.PI;
      plane.rotation.z = Math.PI;

      instance.mesh = plane;

      return instance;      
		}

    public setYPos(y) {
      if(y > this.scene.height) {                 
        this.isAtTop = true;
        this.mesh.position.y = this.scene.height;        
        this.stretchTopVertices(y);
      }
      else if(y < 0){
        this.isAtBottom = true;
        this.mesh.position.y = 0; 
        this.stretchBottomVertices(y);
      }             
      else {
        this.isAtTop = false;
        this.isAtBottom = false;
        this.mesh.position.y = y;
      }      
    }

    public stretchTopVertices(y) {
      var vertices = this.mesh.geometry.vertices;

      var deltaY = y - this.scene.height;

      var startY = this.scene.height - deltaY - this.segmentHeight;

      var percDelta = (this.segmentHeight + deltaY) / this.segmentHeight;

      if(percDelta > 2.25) {
        return;
      }

      //vertices[38].y = this.height;
      //vertices[39].y = this.height;

      for(var i = vertices.length-3; i > 1; i-=4) {
        vertices[i].y = startY;
        vertices[i-1].y = startY;
        vertices[i-2].y = startY; 
        vertices[i-3].y = startY;

        startY-= this.segmentHeight;
      }
      //vertices[1].y = startY;
      //vertices[0].y = startY;

      this.mesh.geometry.verticesNeedUpdate = true;  
    }

    public stretchBottomVertices(y) {
      var vertices = this.mesh.geometry.vertices;

      var deltaY = -(this.scene.height + y);

      var startY = 0 + deltaY + this.segmentHeight;

      var percDelta = (this.scene.height + deltaY + this.segmentHeight) / this.segmentHeight;

      if(percDelta > 2.25) {
        return;
      }

      //vertices[0].y = 0;
      //vertices[1].y = 0;

      for(var i = 2; i < vertices.length-2; i+=4) {
        vertices[i].y = startY;
        vertices[i+1].y = startY;
        vertices[i+2].y = startY; 
        vertices[i+3].y = startY;

        startY+= this.segmentHeight;
      }
      //vertices[38].y = startY;
      //vertices[39].y = startY;

      this.mesh.geometry.verticesNeedUpdate = true;   
    }     
	}
}