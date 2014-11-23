var RosettaMission,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

RosettaMission = (function() {
  RosettaMission.prototype.ROSETTA_DISTANCE = 20;

  RosettaMission.prototype.ORBIT_RADIUS = 100;

  function RosettaMission() {
    this.createRosetta = __bind(this.createRosetta, this);
    this.createComet = __bind(this.createComet, this);
    this.renderSceneOrbit = __bind(this.renderSceneOrbit, this);
    this.animationLoop = __bind(this.animationLoop, this);
    this.loadObjects = __bind(this.loadObjects, this);
    this.loadTextures = __bind(this.loadTextures, this);
    this.initThreeJsSceneLights = __bind(this.initThreeJsSceneLights, this);
    this.initThreeJsLoadingManager = __bind(this.initThreeJsLoadingManager, this);
    this.initThreeJsCamera = __bind(this.initThreeJsCamera, this);
    this.initThreeJsRenderer = __bind(this.initThreeJsRenderer, this);
    this.initThreeJsScene = __bind(this.initThreeJsScene, this);
    this.installResizeHandler = __bind(this.installResizeHandler, this);
    this.toggleOrbits = __bind(this.toggleOrbits, this);
    this.shownOrbits = __bind(this.shownOrbits, this);
    this.show_orbits = false;
    this.shownOrbits();
    this.initThreeJs();
    this.initModels();
    this.animationLoop();
    this.printInstructions();
  }

  RosettaMission.prototype.printInstructions = function() {
    var instructions;
    instructions = "%cYou can toggle a few debugging options to see just how crappy the orbiting model is :), namely:\n  rosetta_mission.toggleGrid()    - Shows an overlayed grid\n  rosetta_mission.toggleAxis()    - Shows the world axis to get your bearings\n  rosetta_mission.toggleOrbits()  - Draw the lines representing the object's movements\n  rosetta_mission.shownOrbits(x = true, y = true, z = true)\n                                    Controls what planes you would like the movement\n                                    of the objects to be shown, for instance you can remove the\n                                    up and down movement by disabling the Y axis";
    return console.log(instructions, "color: blue;");
  };

  RosettaMission.prototype.toggleGrid = function() {
    if (this.grid_helper.visible) {
      this.scene.remove(this.grid_helper.object);
      return this.grid_helper.visible = false;
    } else {
      this.scene.add(this.grid_helper.object);
      return this.grid_helper.visible = true;
    }
  };

  RosettaMission.prototype.toggleAxis = function() {
    if (this.axis_helper.visible) {
      this.scene.remove(this.axis_helper.object);
      return this.axis_helper.visible = false;
    } else {
      this.scene.add(this.axis_helper.object);
      return this.axis_helper.visible = true;
    }
  };

  RosettaMission.prototype.shownOrbits = function(x, y, z) {
    if (x == null) {
      x = true;
    }
    if (y == null) {
      y = true;
    }
    if (z == null) {
      z = true;
    }
    return this.shown_orbits = {
      x: x,
      y: y,
      z: z
    };
  };

  RosettaMission.prototype.toggleOrbits = function() {
    var obj, objects, _i, _len, _results;
    this.show_orbits = !this.show_orbits;
    if (!this.show_orbits) {
      objects = [];
      this.scene.traverse((function(_this) {
        return function(obj) {
          if (obj instanceof THREE.Line) {
            return objects.push(obj);
          }
        };
      })(this));
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        obj = objects[_i];
        _results.push(this.scene.remove(obj));
      }
      return _results;
    }
  };

  RosettaMission.prototype.initThreeJs = function() {
    this.initThreeJsScene();
    this.initThreeJsCamera();
    this.initThreeJsRenderer();
    this.initThreeJsLoadingManager();
    this.initThreeJsSceneLights();
    this.installResizeHandler();
    this.axis_helper = {
      object: new THREE.AxisHelper(100),
      visible: false
    };
    this.grid_helper = {
      object: new THREE.GridHelper(100, 10),
      visible: false
    };
    return this.clock = new THREE.Clock(true);
  };

  RosettaMission.prototype.installResizeHandler = function() {
    return window.addEventListener('resize', (function(_this) {
      return function() {
        _this.renderer.setSize(_this.targetElementWidth(), _this.targetElementHeight());
        return _this.camera.updateProjectionMatrix();
      };
    })(this));
  };

  RosettaMission.prototype.initModels = function() {
    this.objects = {};
    this.textures = {};
    this.loadTextures();
    return this.loadObjects();
  };

  RosettaMission.prototype.targetElement = function() {
    return document.getElementById('rosetta');
  };

  RosettaMission.prototype.targetElementWidth = function() {
    return this.targetElement().offsetWidth;
  };

  RosettaMission.prototype.targetElementHeight = function() {
    return this.targetElement().offsetHeight;
  };

  RosettaMission.prototype.initThreeJsScene = function() {
    return this.scene = new THREE.Scene();
  };

  RosettaMission.prototype.initThreeJsRenderer = function() {
    var el;
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    this.renderer.setSize(this.targetElementWidth(), this.targetElementHeight());
    el = this.renderer.domElement;
    el.className = el.className + " header-element";
    return this.targetElement().appendChild(this.renderer.domElement);
  };

  RosettaMission.prototype.initThreeJsCamera = function() {
    this.camera = new THREE.PerspectiveCamera(50, this.targetElementWidth() / this.targetElementHeight(), 0.1, 1000);
    this.camera.position.x = -150;
    return this.camera.position.y = 25;
  };

  RosettaMission.prototype.initThreeJsLoadingManager = function() {
    this.manager = new THREE.LoadingManager();
    return this.manager.onProgress = function(item, loaded, total) {
      return console.log(item, loaded, total);
    };
  };

  RosettaMission.prototype.initThreeJsSceneLights = function() {
    var directionalLight;
    this.scene.add(new THREE.AmbientLight(0xffffff));
    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, 1);
    return this.scene.add(directionalLight);
  };

  RosettaMission.prototype.loadTextures = function() {
    this.textures = {
      rosetta: new THREE.MeshBasicMaterial({
        color: 0x111111
      }),
      comet: new THREE.Texture(),
      orbits: new THREE.LineBasicMaterial({
        color: 0xff00
      })
    };
    return new THREE.ImageLoader(this.manager).load('assets/comet-texture.jpg', (function(_this) {
      return function(image) {
        _this.textures.comet.image = image;
        return _this.textures.comet.needsUpdate = true;
      };
    })(this));
  };

  RosettaMission.prototype.loadObjects = function() {
    var loader;
    loader = new THREE.OBJLoader(this.manager);
    loader.load("assets/comet_67P.obj", this.createComet);
    return loader.load("assets/rosetta_low_poly.obj", this.createRosetta);
  };

  RosettaMission.prototype.animationLoop = function() {
    requestAnimationFrame(this.animationLoop);
    if (this.objects.comet && this.objects.rosetta) {
      return this.renderSceneOrbit();
    }
  };

  RosettaMission.prototype.renderSceneOrbit = function() {
    var time;
    time = this.clock.getElapsedTime() / 8;
    this.calculateCometPosition(time);
    this.calculateRosettaPosition(time);
    this.objects.rosetta.rotation.z = this.objects.comet.rotation.z += 0.01;
    this.objects.rosetta.rotation.x = this.objects.comet.rotation.x -= 0.01;
    this.camera.lookAt(this.scene.position);
    return this.renderer.render(this.scene, this.camera);
  };

  RosettaMission.prototype.calculateCometPosition = function(time) {
    var geometry;
    if (this.show_orbits) {
      geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(this.shown_orbits.x ? this.objects.comet.position.x : 0, this.shown_orbits.y ? this.objects.comet.position.y : 0, this.shown_orbits.z ? this.objects.comet.position.z : 0), new THREE.Vector3(this.shown_orbits.x ? Math.sin(time) * this.ORBIT_RADIUS : 0, 0, this.shown_orbits.z ? Math.cos(time) * this.ORBIT_RADIUS : 0));
      this.scene.add(new THREE.Line(geometry, this.textures.orbits));
    }
    this.objects.comet.position.x = Math.sin(time) * this.ORBIT_RADIUS;
    return this.objects.comet.position.z = Math.cos(time) * this.ORBIT_RADIUS;
  };

  RosettaMission.prototype.calculateRosettaPosition = function(time) {
    var geometry, position;
    position = new THREE.Vector3(Math.cos(time * 5) * this.ROSETTA_DISTANCE, Math.sin(time * 5) * this.ROSETTA_DISTANCE, 0);
    position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(this.objects.comet.position.z, this.objects.comet.position.x));
    position.add(this.objects.comet.position);
    if (this.show_orbits) {
      geometry = new THREE.Geometry();
      geometry.vertices.push(new THREE.Vector3(this.shown_orbits.x ? this.objects.rosetta.position.x : 0, this.shown_orbits.x ? this.objects.rosetta.position.y : 0, this.shown_orbits.x ? this.objects.rosetta.position.z : 0), new THREE.Vector3(this.shown_orbits.x ? position.x : 0, this.shown_orbits.x ? position.y : 0, this.shown_orbits.x ? position.z : 0));
      this.scene.add(new THREE.Line(geometry, this.textures.orbits));
    }
    this.objects.rosetta.position.x = position.x;
    this.objects.rosetta.position.y = position.y;
    return this.objects.rosetta.position.z = position.z;
  };

  RosettaMission.prototype.createComet = function(object) {
    object.traverse((function(_this) {
      return function(child) {
        if (child instanceof THREE.Mesh) {
          return child.material.map = _this.textures.comet;
        }
      };
    })(this));
    this.objects.comet = object;
    this.objects.comet.scale.set(2, 2, 2);
    return this.scene.add(this.objects.comet);
  };

  RosettaMission.prototype.createRosetta = function(object) {
    object.traverse((function(_this) {
      return function(child) {
        if (child instanceof THREE.Mesh) {
          return child.material = _this.textures.rosetta;
        }
      };
    })(this));
    this.objects.rosetta = object;
    this.objects.rosetta.scale.set(0.25, 0.25, 0.25);
    this.objects.rosetta.position.x = this.ROSETTA_DISTANCE;
    this.objects.rosetta.matrixAutoUpdate = true;
    this.objects.rosetta.rotationAutoUpdate = true;
    return this.scene.add(this.objects.rosetta);
  };

  return RosettaMission;

})();
