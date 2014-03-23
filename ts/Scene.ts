module Overscroll {

	export class Scene {

		private width;
		private height;

		private canvas;
		private renderer;
		private camera;
		private cameraControls;
		private scene;		
		private element;
		private stats;				

		private mouseDown;
		private eventMouseMove = [];		
		private eventMouseDown = [];		
		private eventMouseUp = [];		

		public static create(options) {
			var instance = new Scene();			

			var width = options.width;
			var height = options.height;			
			var renderer = options.renderer;
			var camera = options.camera;
			var scene = options.scene;
			var element = options.container;			

			scene.add(camera);		

			element.appendChild(renderer.domElement);

			var stats = new Stats();
			stats.setMode(0); // 0: fps, 1: ms
			// Align top-left
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.right = '0px';
			stats.domElement.style.top = '0px';
			element.appendChild( stats.domElement );								

			var cameraControls = new THREE.OrbitControls(camera);
			cameraControls.enabled = false;										

			instance.width = width;
			instance.height = height;
			instance.renderer = renderer;
			instance.camera = camera;
			instance.cameraControls = cameraControls;
			instance.scene = scene;
			instance.element = element;
			instance.stats = stats;

			instance.bindEvents();	

			return instance;
		}

		private bindEvents() {
			var self = this;
			this.renderer.domElement.onmousedown = function(e) {
				Scene.OnMouseDown(e, self);				
			}

			this.renderer.domElement.onmouseup = function(e) {
				Scene.OnMouseUp(e, self);
			}

			this.renderer.domElement.onmousemove = function(e) {				
				Scene.OnMouseMove(e, self);
			}	

			this.renderer.domElement.ontouchstart = function(e) {
				Scene.OnMouseDown(e, self);		
			}			

			this.renderer.domElement.ontouchmove = function(e) {				
				Scene.OnMouseMove(e, self);
			}				

			this.renderer.domElement.ontouchend = function(e) {
				Scene.OnMouseUp(e, self);
			}			

			this.cameraControls.addEventListener('change', function() {
				self.cameraChanged()
			});				
		}

		public setSize(options) {
			this.width = options.width;
			this.height = options.height;

			if(this.renderer) {
				this.renderer.setSize(this.width, this.height);
			}

			if(this.camera) {
				this.camera.aspect	= this.width / this.height;
				this.camera.updateProjectionMatrix();			
			}
		}

		public toggleCameraControls() {
			this.cameraControls.enabled = !this.cameraControls.enabled;
		}

		public cameraChanged() {				
			this.render();
		}		

		public on(eventName, func) {
			if(eventName == 'mousemove') {
				this.eventMouseMove.push(func);
			}
			else if(eventName == 'mousedown') {
				this.eventMouseDown.push(func);
			} else if(eventName == 'mouseup') {
				this.eventMouseUp.push(func)
			}
		}

		public SetMouseDown() {
			this.mouseDown = true;
		}

		public SetMouseUp() {
			this.mouseDown = false;
		}		

		private static GetPosFromEvent(e, self) {			
			var x = e.clientX;
			var y = e.clientY;

			if (e.touches && e.touches.length) {
				x = e.touches[0].clientX;
				y = e.touches[0].clientY;
			}	


			x = 2 * (x / self.width) - 1;
			y = -(2 * (y / self.height) - 1);	

			if(isNaN(x) || isNaN(y))
				return false;

			return {x: x, y: y};
		}

		private static OnMouseMove(e, self) {
			var pos = Scene.GetPosFromEvent(e, self);
			for(var i = 0; i < self.eventMouseMove.length; i++) {
				self.eventMouseMove[i](pos);
			}			
		}

		private static OnMouseDown(e, self) {
			self.SetMouseDown();
			var pos = Scene.GetPosFromEvent(e, self);			
			for(var i = 0; i < self.eventMouseDown.length; i++) {	       
				self.eventMouseDown[i](pos);
			}							
		}

		private static OnMouseUp(e, self) {
			self.SetMouseUp();
			var pos = Scene.GetPosFromEvent(e,self);
			for(var i = 0; i < self.eventMouseUp.length; i++) {
				self.eventMouseUp[i](pos);
			}	
		}			

		public add(sceneItem) {
			this.scene.add(sceneItem);
		}

		public remove(sceneItem) {
			this.scene.remove(sceneItem);
		}

		public render() {
	  		this.stats.update();	
			this.renderer.render(this.scene, this.camera);
		}			
	}	
}

