var Overscroll;
(function (Overscroll) {
    var TextSprite = (function () {
        function TextSprite() {
        }
        TextSprite.create = function (options) {
            var text = options.text;
            var textHeight = 50;

            var canvas = document.createElement('canvas');

            var texture = new THREE.Texture(canvas);

            var context = canvas.getContext('2d');

            context.font = "bold " + textHeight + "px sans-serif";

            var measurement = context.measureText(text);

            canvas.height = textHeight;
            canvas.width = measurement.width;

            context.fillStyle = "#EE1133";
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = "bold " + textHeight + "px sans-serif";
            context.fillStyle = "#BBEE33";
            context.textBaseline = "top";

            //context.textAlign = "center";
            context.fillText(text, 0, 0);

            texture.needsUpdate = true;

            var material = new THREE.SpriteMaterial({ map: texture });

            var sprite = new THREE.Sprite(material);

            sprite.scale.set(canvas.width, canvas.height, 1);

            return sprite;
        };
        return TextSprite;
    })();
    Overscroll.TextSprite = TextSprite;
})(Overscroll || (Overscroll = {}));
var Overscroll;
(function (Overscroll) {
    var PlaneMesh = (function () {
        function PlaneMesh() {
        }
        PlaneMesh.create = function (options) {
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

            var widthSegments = 1;
            var heightSegments = 100;

            var geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

            /*
            for(var i=0; i<geometry.vertices.length/2; i++) {
            geometry.vertices[2*i].y -= i;
            geometry.vertices[2*i+1].y -= i;
            }
            */
            var plane = new THREE.Mesh(geometry, options.material);
            plane.dynamic = true;

            plane.position.x += options.width / 2;
            plane.position.y += options.height / 2;
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
        };
        return PlaneMesh;
    })();
    Overscroll.PlaneMesh = PlaneMesh;
})(Overscroll || (Overscroll = {}));
var Overscroll;
(function (Overscroll) {
    var Scene = (function () {
        function Scene() {
            this.eventMouseMove = [];
            this.eventMouseDown = [];
            this.eventMouseUp = [];
        }
        Scene.create = function (options) {
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
            stats.setMode(0);

            // Align top-left
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.right = '0px';
            stats.domElement.style.top = '0px';
            element.appendChild(stats.domElement);

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
        };

        Scene.prototype.bindEvents = function () {
            var self = this;
            this.renderer.domElement.onmousedown = function (e) {
                Scene.OnMouseDown(e, self);
            };

            this.renderer.domElement.onmouseup = function (e) {
                Scene.OnMouseUp(e, self);
            };

            this.renderer.domElement.onmousemove = function (e) {
                Scene.OnMouseMove(e, self);
            };

            this.renderer.domElement.ontouchstart = function (e) {
                Scene.OnMouseDown(e, self);
            };

            this.renderer.domElement.ontouchmove = function (e) {
                Scene.OnMouseMove(e, self);
            };

            this.renderer.domElement.ontouchend = function (e) {
                Scene.OnMouseUp(e, self);
            };

            this.cameraControls.addEventListener('change', function () {
                self.cameraChanged();
            });
        };

        Scene.prototype.setSize = function (options) {
            this.width = options.width;
            this.height = options.height;

            console.log('setting size to: ' + this.width + "x" + this.height + " window size is " + window.innerWidth + "x" + window.innerHeight);

            if (this.renderer) {
                this.renderer.setSize(this.width, this.height);
            }

            if (this.camera) {
                this.camera.aspect = this.width / this.height;
                this.camera.updateProjectionMatrix();
            }
        };

        Scene.prototype.toggleCameraControls = function () {
            this.cameraControls.enabled = !this.cameraControls.enabled;
        };

        Scene.prototype.cameraChanged = function () {
            this.render();
        };

        Scene.prototype.on = function (eventName, func) {
            if (eventName == 'mousemove') {
                this.eventMouseMove.push(func);
            } else if (eventName == 'mousedown') {
                this.eventMouseDown.push(func);
            } else if (eventName == 'mouseup') {
                this.eventMouseUp.push(func);
            }
        };

        Scene.prototype.SetMouseDown = function () {
            this.mouseDown = true;
        };

        Scene.prototype.SetMouseUp = function () {
            this.mouseDown = false;
        };

        Scene.GetPosFromEvent = function (e, self) {
            var x = e.clientX;
            var y = e.clientY;

            if (e.touches && e.touches.length) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            }

            x = 2 * (x / self.width) - 1;
            y = -(2 * (y / self.height) - 1);

            if (isNaN(x) || isNaN(y))
                return false;

            return { x: x, y: y };
        };

        Scene.OnMouseMove = function (e, self) {
            var pos = Scene.GetPosFromEvent(e, self);
            for (var i = 0; i < self.eventMouseMove.length; i++) {
                self.eventMouseMove[i](pos);
            }
        };

        Scene.OnMouseDown = function (e, self) {
            self.SetMouseDown();
            var pos = Scene.GetPosFromEvent(e, self);
            for (var i = 0; i < self.eventMouseDown.length; i++) {
                self.eventMouseDown[i](pos);
            }
        };

        Scene.OnMouseUp = function (e, self) {
            self.SetMouseUp();
            var pos = Scene.GetPosFromEvent(e, self);
            for (var i = 0; i < self.eventMouseUp.length; i++) {
                self.eventMouseUp[i](pos);
            }
        };

        Scene.prototype.add = function (sceneItem) {
            this.scene.add(sceneItem);
        };

        Scene.prototype.remove = function (sceneItem) {
            this.scene.remove(sceneItem);
        };

        Scene.prototype.render = function () {
            this.stats.update();
            this.renderer.render(this.scene, this.camera);
        };
        return Scene;
    })();
    Overscroll.Scene = Scene;
})(Overscroll || (Overscroll = {}));
var Overscroll;
(function (Overscroll) {
    var UI = (function () {
        function UI() {
        }
        UI.create = function (options) {
            var instance = new UI();

            var container = options.container;

            var width = options.width;
            var height = options.height;

            var camera = new THREE.OrthographicCamera(0, width, 0, height, 1, -1000);
            camera.position.z = 1;

            instance.camera = camera;

            var renderer = new THREE.WebGLRenderer();
            renderer.autoClear = false;

            var scene = new THREE.Scene();

            instance.scene = Overscroll.Scene.create({
                container: container,
                camera: camera,
                renderer: renderer,
                scene: scene
            });

            instance.scene.on('mousedown', function (pos) {
                TWEEN.removeAll();
                instance.clickPos = pos;
                instance.savedPos = { x: instance.content.position.x, y: instance.content.position.y };
            });

            instance.scene.on('mouseup', function (pos) {
                if (!pos) {
                    instance.checkOverScroll(instance.lastPos);
                } else {
                    instance.checkOverScroll(pos);
                }
                instance.clickPos = null;
            });

            instance.scene.on('mousemove', function (pos) {
                instance.lastPos = pos;
                if (instance.clickPos) {
                    var posDelta = instance.getPosDelta(instance.clickPos, pos);
                    var newY = instance.savedPos.y - posDelta.y;
                    instance.content.position.y = newY;
                }
            });

            /*
            var pointLight = new THREE.PointLight(0xF8D898);
            
            pointLight.position.x = -1000;
            pointLight.position.y = 0;
            pointLight.position.z = -10000;
            pointLight.intensity = 2.9;
            pointLight.distance = 25000;
            */
            var light = new THREE.AmbientLight(0x404040);

            light.position.z = -1000;
            light.position.x = -1000;
            light.position.y = -1000;

            instance.scene.add(light);

            var texture = THREE.ImageUtils.loadTexture('images/example1.png');

            var textureMaterial = new THREE.MeshBasicMaterial({
                //wireframe: true,
                //color: "red",
                map: texture
            });

            var content = Overscroll.PlaneMesh.create({ material: textureMaterial, width: width, height: height * 2, widthSegments: 50, heightSegments: 50 * (width / height) });
            instance.scene.add(content);
            instance.scene.setSize({
                width: width,
                height: height
            });

            var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x1255cc });

            var wireframeContent = Overscroll.PlaneMesh.create({ material: wireframeMaterial, width: width, height: height * 2, widthSegments: 50, heightSegments: 50 * (width / height) });
            instance.scene.setSize({
                width: width,
                height: height
            });

            instance.content = content;
            instance.wireframeContent = wireframeContent;

            wireframeContent.position = content.position;

            return instance;
        };

        UI.prototype.getPosDelta = function (startPos, endPos) {
            var xDelta = (endPos.x - startPos.x);
            var yDelta = (endPos.y - startPos.y);

            return { x: xDelta * this.scene.width, y: yDelta * this.scene.height };
        };

        UI.prototype.checkOverScroll = function (pos) {
            var self = this;
            var posDelta = this.getPosDelta(this.clickPos, pos);

            var top = this.scene.height;

            var current;
            var to;
            var tween;

            var newY = this.savedPos.y - posDelta.y;

            if (newY > top) {
                TWEEN.removeAll();

                current = { x: this.content.position.x, y: newY };
                to = { x: current.x, y: top };

                tween = new TWEEN.Tween(current).to(to, 1000).easing(TWEEN.Easing.Elastic.InOut).onUpdate(function () {
                    self.content.position.y = current.y;
                }).start();
            }
            if (newY < 0) {
                TWEEN.removeAll();

                current = { x: this.content.position.x, y: newY };
                to = { x: current.x, y: 0 };

                tween = new TWEEN.Tween(current).to(to, 1000).easing(TWEEN.Easing.Elastic.InOut).onUpdate(function () {
                    self.content.position.y = current.y;
                }).start();
            }
        };

        UI.prototype.mouseMove = function (e) {
        };

        UI.prototype.start = function () {
            this.loop();
        };

        UI.prototype.keyUp = function (e) {
            var amount = 1;
            var c = String.fromCharCode(e.keyCode);
            if (c == 'T') {
                this.scene.toggleCameraControls();
            }
            if (c == 'W') {
                this.camera.position.y += amount;
            }
            if (c == 'S') {
                this.camera.position.y -= amount;
            }
            if (c == 'A') {
                this.camera.position.x -= amount;
            }
            if (c == 'D') {
                this.camera.position.x += amount;
            }
            if (c == 'E') {
                this.camera.position.z += amount;
            }
            if (c == 'F') {
                this.camera.position.z -= amount;
            }
            if (c == 'Y') {
                this.scene.remove(this.content);
                this.scene.add(this.wireframeContent);
            }
            if (c == 'U') {
                this.scene.add(this.content);
                this.scene.remove(this.wireframeContent);
            }
            this.camera.updateProjectionMatrix();
        };

        UI.prototype.loop = function () {
            var self = this;

            TWEEN.update();

            this.scene.render();

            requestAnimFrame(function () {
                self.loop();
            });
        };
        return UI;
    })();
    Overscroll.UI = UI;
})(Overscroll || (Overscroll = {}));
//# sourceMappingURL=overscroll.js.map
