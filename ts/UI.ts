module Overscroll {
	export class UI {

		public scene;
		public camera;

		public content;
		public wireframeContent;

		private clickPos;
		private savedPos;
		private lastPos;

		public static create(options) {

			var instance = new UI();			

			var container = options.container;

			var width = options.width;
			var height = options.height;

			var widthSegments = options.widthSegments;
			var heightSegments = options.heightSegments;

			var imageSrc = options.image;

			var camera = new THREE.OrthographicCamera(0, width, 0, height, 1, -1000);			
			camera.position.z = 1;		

			instance.camera = camera;						
		
			var renderer = new THREE.WebGLRenderer();
			renderer.autoClear = false;					

			var scene = new THREE.Scene();

			instance.scene = Scene.create({
				container: container,
				camera: camera,
				renderer: renderer,
				scene: scene
			});

			instance.scene.on('mousedown', function(pos) {
				TWEEN.removeAll();
				instance.clickPos = pos;
				instance.savedPos = {x: instance.content.position.x, y: instance.content.position.y};
			});	

			instance.scene.on('mouseup', function(pos) {				
				if(!pos) {
					instance.checkOverScroll(instance.lastPos);
				} else {
					instance.checkOverScroll(pos);
				}
				instance.clickPos = null;
			});

			instance.scene.on('mousemove', function(pos) {
				instance.lastPos = pos;
				if(instance.clickPos) {
					var posDelta = instance.getPosDelta(instance.clickPos, pos);
					var newY = instance.savedPos.y - posDelta.y;
					instance.content.position.y = newY;					
				}
			});

			var texture = THREE.ImageUtils.loadTexture( imageSrc );

			var textureMaterial = new THREE.MeshBasicMaterial( {
				map: texture
			});

			var content = PlaneMesh.create({material: textureMaterial, width: width, height: height*2, widthSegments: widthSegments, heightSegments: heightSegments});
			instance.scene.add(content);
			instance.scene.setSize({
				width: width,
				height: height
			});

			var wireframeMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x1255cc} );			

			var wireframeContent = PlaneMesh.create({material: wireframeMaterial, width: width, height: height*2, widthSegments: widthSegments, heightSegments: heightSegments});
			instance.scene.setSize({
				width: width,
				height: height
			});			

			instance.content = content;	
			instance.wireframeContent = wireframeContent;		

			wireframeContent.position = content.position;

			return instance;

		}

		public getPosDelta(startPos, endPos) {
			var xDelta = (endPos.x - startPos.x);
			var yDelta = (endPos.y - startPos.y);			

			return {x: xDelta * this.scene.width, y: yDelta * this.scene.height};
		}

		public checkOverScroll(pos) {
			var self = this;
			var posDelta = this.getPosDelta(this.clickPos, pos);

			var top = this.scene.height;

			var current;
			var to;			
			var tween;

			var newY = this.savedPos.y - posDelta.y;					

			if(newY > top) {
				TWEEN.removeAll();

				current = {x: this.content.position.x, y: newY};
				to = {x: current.x, y: top };

		        tween = new TWEEN.Tween(current)
		            .to( to, 1000 )
		            .easing( TWEEN.Easing.Elastic.InOut )
		            .onUpdate( function () {
		                self.content.position.y = current.y;
		            })
		            .start();						
			}
			if(newY < 0) {
				TWEEN.removeAll();

				current = {x: this.content.position.x, y: newY};
				to = {x: current.x, y: 0 };

		        tween = new TWEEN.Tween(current)
		            .to( to, 1000 )
		            .easing( TWEEN.Easing.Elastic.InOut )
		            .onUpdate( function () {
		                self.content.position.y = current.y;
		            })
		            .start();												
			}

		}		

		public mouseMove(e) {

		}		

		public start() {
			this.loop();		
		}

		public keyUp(e) {
		   var amount = 1;
		   var c = String.fromCharCode(e.keyCode);			
		   if(c == 'T') {
		   	this.scene.toggleCameraControls();
		   }
		   if(c == 'W') {
		   	this.camera.position.y += amount;
		   }
		   if(c == 'S') {
		   	this.camera.position.y -= amount;
		   }		   
		   if(c == 'A') {
		   	this.camera.position.x -= amount;
		   }		   		   
		   if(c == 'D') {
		   	this.camera.position.x += amount;
		   }		   		   		   
		   if(c == 'E') {
		   	this.camera.position.z += amount;
		   }		   		   
		   if(c == 'F') {
		   	this.camera.position.z -= amount;
		   }	
		   if(c == 'Y') {
		   		this.scene.remove(this.content);
		   		this.scene.add(this.wireframeContent);		   		
		   }
		   if(c == 'U') {
		   		this.scene.add(this.content);
		   		this.scene.remove(this.wireframeContent);		   				   	
		   }
		   this.camera.updateProjectionMatrix();			   	   		   		   
		}


		public loop() {
		  var self = this;

		  TWEEN.update();
		  this.scene.render();		  

		  requestAnimFrame(function() {
		  	self.loop();
		  });
		}			
	}
}

