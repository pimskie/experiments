// https://medium.com/@crazypixel/geometry-manipulation-in-three-js-twisting-c53782c38bb
// https://github.com/mrdoob/three.js/issues/1003
// https://stackoverflow.com/questions/50426159/color-based-on-mesh-height-three-js

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

class World {
	constructor(el) {
		this.el = el;

		this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
		const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

		this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this.cube.position.set(0, 1, 0);
		this.cube.castShadow = true;
		this.cube.receiveShadow = true;

		this.scene.add(this.cube);

		const planeGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
		const planeMaterial = new THREE.MeshPhongMaterial({
			color: 0x5bb115,
			side: THREE.DoubleSide,
			wireframe: true,
		});

		this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
		this.plane.rotation.x = -Math.PI / 2;
		this.plane.castShadow = true;
		this.plane.receiveShadow = true;

		this.camera.position.set(0, 4, 5);
		this.camera.rotation.set(-0.5, 0, 0);

		window.world = this;

		this.scene.add(this.plane);

		const light = new THREE.DirectionalLight(0xffffff, 2, 10);
		light.castShadow = true;

		this.scene.add(light);

		this.el.appendChild(this.renderer.domElement);
	}

	generate(noiseValues) {
		const vertices = this.plane.geometry.vertices;

		for (let i = 0; i < noiseValues.length; i++) {
			const value = noiseValues[i];
			const vertex = vertices[i];

			vertex.setZ(value);
		}

		this.plane.geometry.verticesNeedUpdate = true;
	}

	render() {
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;

		this.renderer.render(this.scene, this.camera);
	}
}

export default World;
