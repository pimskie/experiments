/*global THREE: true*/

// http://blog.thematicmapping.org/2013/09/creating-webgl-earth-with-threejs.html
// http://www.smartjava.org/content/render-open-data-3d-world-globe-threejs
// http://stackoverflow.com/questions/10747510/how-to-rotate-a-three-js-vector3-around-an-axis
// http://nl.wikipedia.org/wiki/Bolco%C3%B6rdinaten
// http://vis.jaik.sk/js/libs/geo.js
// https://github.com/dataarts/webgl-globe


var Globe = (function () {
	'use strict';

	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
	})();


	var globe = function(options) {

		options = options || {};
		this.defaults = {
			radius: 100,
			markers: [
				{
					lat: 51.923426,
					lon: 4.469059
				},
				{
					lat: 46.648258,
					lon: 105.122681
				}
			],
		};
		this.options = _.extend(this.defaults, options);

		this.lightPos = {
			radiusY: 150,
			radiusX: 100,
			radiusZ: 150,
			radian: 0,
			x: 100,
			y: 120,
			z: 120
		};
		this.winW = window.innerWidth;
		this.winH = window.innerHeight;

		this.scene = null;
		this.camera = null;
		this.renderer = null;

		this.markers = [];

		this._setupStage();
		this._setupLight();
		this._setupControls();

		// create the globe
		this.meshGlobe = this._createGlobe({
			radius: this.options.radius,
			transparent: false,
			texture: 'img/2_no_clouds_8k.jpg'
		});

		// create clouds
		this.meshClouds = this._createGlobe({
			radius: this.options.radius + 3,
			transparent: true,
			texture: 'img/n_amer_clouds_8k.png'
		});

		// create group and add globe and clouds
		this.planet = new THREE.Object3D();
		this.planet.add(this.meshGlobe);
		this.planet.add(this.meshClouds);

		// create and add markers
		var markerDepth = 50,
			markerPosition,
			markerMesh;

		_.each(this.options.markers, _.bind(function(marker) {
			markerPosition = this._convertLatLonToVec3(
				marker.lat,
				marker.lon,
				this.options.radius,
				markerDepth
			);

			marker.vec3 = markerPosition;
			markerMesh = this._createMarker(markerPosition, markerDepth);
			this.markers.push(markerMesh);
			this.planet.add(markerMesh);
		}, this));

		this.scene.add(this.planet);

		this._testLine();
		// start render loop
		this._render();
		return this;
	};


	globe.prototype._setupStage = function() {
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, this.winW / this.winH, 0.01, 1000);
		this.camera.position.z = 500;
		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(this.winW, this.winH);

		this.renderer.domElement.classList.add('stage');
		document.body.appendChild(this.renderer.domElement);
		return this;
	};


	globe.prototype._setupLight = function() {
		this.light = new THREE.DirectionalLight(0xffffff, 1);
		this.light.position.set(this.lightPos.x, this.lightPos.y, this.lightPos.z);
		this.scene.add(this.light);
		// this.scene.add( new THREE.DirectionalLightHelper(this.light, 5) );
	};

	globe.prototype._setupControls = function() {
		this.controls = new THREE.OrbitControls(this.camera);
		this.controls.damping = 0.001;
	};


	globe.prototype._createGlobe = function(opts) {
		var mesh = new THREE.Mesh(
			new THREE.SphereGeometry(opts.radius, 100, 100),
			new THREE.MeshPhongMaterial({
				map: THREE.ImageUtils.loadTexture(opts.texture),
				shading: THREE.SmoothShading,
				transparent: opts.transparent
			})
		);
		mesh.overdraw = true;
		return mesh;
	};

	globe.prototype._createMarker = function(position, height) {
		var mesh = new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, height),
			new THREE.MeshBasicMaterial( {color: 0xff0000})
		);

		mesh.position.x = position.x;
		mesh.position.y = position.y;
		mesh.position.z = position.z;
		mesh.lookAt( new THREE.Vector3(0, 0, 0));
		return mesh;
	};

	globe.prototype._testLine = function() {
		/*
		// straight line
		var geometry = new THREE.Geometry(),
			material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

		geometry.vertices.push(this.markers[0].position);
		geometry.vertices.push(this.markers[1].position);
		
		var line = new THREE.Line(geometry, material);
		this.planet.add(line);
		*/
	
		var from = this.options.markers[0],
			to = this.options.markers[1],
			midLat = Math.min(from.lat, to.lat) + (Math.max(from.lat, to.lat) - Math.min(from.lat, to.lat)) / 2,
			midLon = Math.min(from.lon, to.lon) + (Math.max(from.lon, to.lon) - Math.min(from.lon, to.lon)) / 2;

		var controlPointVec3 = this._convertLatLonToVec3(midLat, midLon, 200, 40);

		var SUBDIVISIONS = 100,
			geometry = new THREE.Geometry(),
			curve = new THREE.QuadraticBezierCurve3(),
			material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );

		var x1 = this.markers[0].position.x, // + (this.markers[0].position.x - this.markers[1].position.x),
			y1 = this.markers[1].position.y, // + (this.markers[0].position.y - this.markers[1].position.y),
			z1 = this.markers[1].position.z;

		curve.v0 = this.markers[0].position;
		curve.v1 = controlPointVec3; // new THREE.Vector3(x1, y1, z1);
		curve.v2 = this.markers[1].position;
		
		for (var j = 0; j < SUBDIVISIONS; j++) {
			geometry.vertices.push(curve.getPoint(j / SUBDIVISIONS));
		}

		var line = new THREE.Line(geometry, material);
		this.planet.add(line);
	};

	globe.prototype._render = function() {
		var me = this;
		
		function _loop() {
			window.requestAnimationFrame(_loop);

			// rotate clouds only
			me.meshClouds.rotation.x += 0.0001;
			me.meshClouds.rotation.y += 0.002;

			// rotate everything
			// me.planet.rotation.x += 0.003;
			// me.planet.rotation.x = 0.6;
			// me.planet.rotation.y = -2.5;

			// rotate light
			/*me.lightPos.y = Math.cos(me.lightPos.radian) * me.lightPos.radiusY;
			me.lightPos.z = Math.sin(me.lightPos.radian) * me.lightPos.radiusZ;
			me.light.position.y = me.lightPos.y;
			me.light.position.z = me.lightPos.z;
			me.light.lookAt(me.planet);
			me.lightPos.radian += 0.01;*/

			// render updated scene
			me.renderer.render(me.scene, me.camera);
		}

		_loop();
	};

	globe.prototype._latLongToVector3 = function(lat, lon, radius, height) {
		var phi = (lat) * Math.PI / 180,
			theta = (lon - 180) * Math.PI/180,
			x = -(radius + height) * Math.cos(phi) * Math.cos(theta),
			y = (radius + height) * Math.sin(phi),
			z = (radius + height) * Math.cos(phi) * Math.sin(theta);

		return new THREE.Vector3(x, y, z);

		/*
		var vector = new THREE.Vector3( 1, 0, 0 );

		var axis = new THREE.Vector3( 0, 1, 0 );
		var angle = Math.PI / 2;
		var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );

		vector.applyMatrix4( matrix );
		*/
	};

	globe.prototype._convertLatLonToVec3 = function(lat, lon, radius, height) {
		
		var toRadian = Math.PI / 180;
		lat =  lat * toRadian;
		lon = -lon * toRadian;

		var pos = new THREE.Vector3(
			Math.cos(lat) * Math.cos(lon),
			Math.sin(lat),
			Math.cos(lat) * Math.sin(lon));

		pos = pos.multiplyScalar((height * 0.5) + radius);

		return pos;
	};

	return globe;

}(Globe || {}));





(function(Globe) {
	'use strict';

	var globe;

	function init() {
		var globe = new Globe();
	}

	init();

})(Globe);
