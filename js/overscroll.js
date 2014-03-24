var Overscroll;
(function (Overscroll) {
    var Display = (function () {
        function Display() {
        }
        Display.create = function (options) {
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
            var segmentHeight = (height / 10);

            instance.segmentHeight = segmentHeight;

            for (var i = 0; i < height; i++) {
                endY += segmentHeight;

                geometry.vertices.push(new THREE.Vector3(x, y, 0));
                geometry.vertices.push(new THREE.Vector3(x + width, y, 0));
                geometry.vertices.push(new THREE.Vector3(x + width, endY, 0));
                geometry.vertices.push(new THREE.Vector3(x, endY, 0));

                var newNormalizedY = normalizedY + (segmentHeight / height);

                var uvs = [];
                uvs.push(new THREE.Vector2(0, normalizedY));
                uvs.push(new THREE.Vector2(1, normalizedY));
                uvs.push(new THREE.Vector2(1, newNormalizedY));
                uvs.push(new THREE.Vector2(0, newNormalizedY));

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

            plane.position.x += options.width / 2;
            plane.position.y += options.height / 2;
            plane.rotation.y = Math.PI;
            plane.rotation.z = Math.PI;

            instance.mesh = plane;

            return instance;
        };

        Display.prototype.setYPos = function (y) {
            if (y > this.scene.height) {
                this.isAtTop = true;
                this.mesh.position.y = this.scene.height;
                this.stretchTopVertices(y);
            } else if (y < 0) {
                this.isAtBottom = true;
                this.mesh.position.y = 0;
                this.stretchBottomVertices(y);
            } else {
                this.isAtTop = false;
                this.isAtBottom = false;
                this.mesh.position.y = y;
            }
        };

        Display.prototype.stretchTopVertices = function (y) {
            var vertices = this.mesh.geometry.vertices;

            var deltaY = y - this.scene.height;

            var startY = this.scene.height - deltaY - this.segmentHeight;

            var percDelta = (this.segmentHeight + deltaY) / this.segmentHeight;

            if (percDelta > 2.25) {
                return;
            }

            for (var i = 37; i > 1; i -= 4) {
                vertices[i].y = startY;
                vertices[i - 1].y = startY;
                vertices[i - 2].y = startY;
                vertices[i - 3].y = startY;

                startY -= this.segmentHeight;
            }

            //vertices[1].y = startY;
            //vertices[0].y = startY;
            this.mesh.geometry.verticesNeedUpdate = true;
        };

        Display.prototype.stretchBottomVertices = function (y) {
            var vertices = this.mesh.geometry.vertices;

            var deltaY = -(this.scene.height + y);

            var startY = 0 + deltaY + this.segmentHeight;

            var percDelta = (this.scene.height + deltaY + this.segmentHeight) / this.segmentHeight;

            if (percDelta > 2.25) {
                return;
            }

            for (var i = 2; i < 38; i += 4) {
                vertices[i].y = startY;
                vertices[i + 1].y = startY;
                vertices[i + 2].y = startY;
                vertices[i + 3].y = startY;

                startY += this.segmentHeight;
            }

            //vertices[38].y = startY;
            //vertices[39].y = startY;
            this.mesh.geometry.verticesNeedUpdate = true;
        };
        return Display;
    })();
    Overscroll.Display = Display;
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

            if (options.enableStats) {
                var stats = new Stats();
                stats.setMode(0);
                stats.domElement.style.position = 'absolute';
                stats.domElement.style.right = '0px';
                stats.domElement.style.top = '0px';
                element.appendChild(stats.domElement);
            }

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
                e.preventDefault();
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
            if (this.stats) {
                this.stats.update();
            }
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

            instance.scene = Overscroll.Scene.create({
                container: container,
                camera: camera,
                renderer: renderer,
                scene: scene,
                enableStats: enableStats
            });

            instance.scene.on('mousedown', function (pos) {
                TWEEN.removeAll();
                instance.clickPos = pos;
                instance.savedPos = { x: instance.content.mesh.position.x, y: instance.content.mesh.position.y };
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
                texture1: { type: "t", value: THREE.ImageUtils.loadTexture(imageSrc) }
            };

            var textureMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });

            var content = Overscroll.Display.create({ scene: instance.scene, material: textureMaterial, width: width, height: height * 2, widthSegments: widthSegments, heightSegments: heightSegments });
            instance.scene.add(content.mesh);
            instance.scene.setSize({
                width: width,
                height: height
            });

            var wireframeMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x1255cc });

            var wireframeContent = Overscroll.Display.create({ scene: instance.scene, material: wireframeMaterial, width: width, height: height * 2, widthSegments: widthSegments, heightSegments: heightSegments });
            instance.scene.setSize({
                width: width,
                height: height
            });

            instance.content = content;
            instance.wireframeContent = wireframeContent;
            wireframeContent.mesh.position = content.mesh.position;

            return instance;
        };

        UI.prototype.getPosDelta = function (startPos, endPos) {
            var xDelta = (endPos.x - startPos.x);
            var yDelta = (endPos.y - startPos.y);

            return { x: xDelta * this.scene.width, y: yDelta * this.scene.height };
        };

        UI.prototype.checkOverScrollDuring = function (pos) {
            var self = this;
            var posDelta = this.getPosDelta(this.clickPos, pos);
            var newY = this.savedPos.y - posDelta.y;

            this.content.setYPos(newY);
            this.wireframeContent.setYPos(newY);
        };

        UI.prototype.checkOverScroll = function (pos) {
            var self = this;
            var posDelta = this.getPosDelta(this.clickPos, pos);

            var newY = this.savedPos.y - posDelta.y;

            if (this.content.isAtTop || this.content.isAtBottom) {
                TWEEN.removeAll();

                var current = { x: this.content.mesh.position.x, y: newY };
                var to = { x: current.x, y: this.content.isAtTop ? this.scene.height : 0 };

                var tween = new TWEEN.Tween(current).to(to, 300).onUpdate(function () {
                    self.content.setYPos(current.y);
                    self.wireframeContent.setYPos(current.y);
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
                this.scene.remove(this.content.mesh);
                this.scene.add(this.wireframeContent.mesh);
            }
            if (c == 'U') {
                this.scene.add(this.content.mesh);
                this.scene.remove(this.wireframeContent.mesh);
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
