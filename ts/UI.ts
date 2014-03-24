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
			var enableStats = options.enableStats;

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
				scene: scene,
				enableStats: enableStats
			});

			instance.scene.on('mousedown', function(pos) {
				TWEEN.removeAll();
				instance.clickPos = pos;
				instance.savedPos = {x: instance.content.mesh.position.x, y: instance.content.mesh.position.y};
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
					instance.checkOverScrollDuring(pos);
				}
			});

			/*
			var texture = THREE.ImageUtils.loadTexture( imageSrc );

			var textureMaterial = new THREE.MeshBasicMaterial( {
				map: texture,
				side: THREE.DoubleSide
			});
			*/

		    var vertShader = document.getElementById('vertexShader').innerHTML;
		    var fragShader = document.getElementById('fragmentShader').innerHTML;

		    var uniforms = {
		        texture1: { type: "t", value: THREE.ImageUtils.loadTexture( imageSrc ) }
		    };

		    var textureMaterial = new THREE.ShaderMaterial({
		        uniforms: uniforms,
		        vertexShader: vertShader,
		        fragmentShader: fragShader
		    });

			var content = Display.create({scene: instance.scene, material: textureMaterial, width: width, height: height*2, widthSegments: widthSegments, heightSegments: heightSegments});
			instance.scene.add(content.mesh);
			instance.scene.setSize({
				width: width,
				height: height
			});

			var wireframeMaterial = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x1255cc} );			

			var wireframeContent = Display.create({scene: instance.scene, material: wireframeMaterial, width: width, height: height*2, widthSegments: widthSegments, heightSegments: heightSegments});
			instance.scene.setSize({
				width: width,
				height: height
			});

			instance.content = content;	
			instance.wireframeContent = wireframeContent;		
			wireframeContent.mesh.position = content.mesh.position;

			return instance;

		}

		public getPosDelta(startPos, endPos) {
			var xDelta = (endPos.x - startPos.x);
			var yDelta = (endPos.y - startPos.y);			

			return {x: xDelta * this.scene.width, y: yDelta * this.scene.height};
		}

		public checkOverScrollDuring(pos) {
			var self = this;
			var posDelta = this.getPosDelta(this.clickPos, pos);
			var newY = this.savedPos.y - posDelta.y;	

			this.content.setYPos(newY);
			this.wireframeContent.setYPos(newY);
		}	

		public checkOverScroll(pos) {
			var self = this;
			var posDelta = this.getPosDelta(this.clickPos, pos);

			var newY = this.savedPos.y - posDelta.y;	

			if(this.content.isAtTop || this.content.isAtBottom) {
				TWEEN.removeAll();

				var current = {x: this.content.mesh.position.x, y: newY};
				var to = {x: current.x, y: this.content.isAtTop ? this.scene.height : 0 };

		        var tween = new TWEEN.Tween(current)
		            .to( to, 300 )
		            .onUpdate( function () {
		            	self.content.setYPos(current.y);
		            	self.wireframeContent.setYPos(current.y);
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
		   		this.scene.remove(this.content.mesh);
		   		this.scene.add(this.wireframeContent.mesh);		   		
		   }
		   if(c == 'U') {
		   		this.scene.add(this.content.mesh);
		   		this.scene.remove(this.wireframeContent.mesh);		   				   	
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

