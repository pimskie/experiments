// https://medium.com/@crazypixel/geometry-manipulation-in-three-js-twisting-c53782c38bb
// https://github.com/mrdoob/three.js/issues/1003
// https://stackoverflow.com/questions/50426159/color-based-on-mesh-height-three-js
// https://threejs.org/examples/#webgl_geometry_terrain

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

class World {
	constructor(el,mapSize = 100) {
		this.el = el;

		this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
		this.camera.position.set(3, 4, 25);
		this.camera.rotation.set(-Math.PI / 2, 0, 0);

		this.cameraDirection = new THREE.Vector3();

		this.scene = new THREE.Scene();

		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(500, 500);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
		const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

		this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this.cube.position.set(0, 1, 0);
		this.cube.castShadow = true;
		this.cube.receiveShadow = true;

		this.scene.add(this.cube);

		const planeMaterial = new THREE.MeshPhongMaterial({
			vertexColors: THREE.VertexColors,
			wireframe: false,
			side: THREE.DoubleSide
		});

		this.bufferGeom = new THREE.PlaneBufferGeometry(50, 50, mapSize - 1, mapSize - 1);
		const numLoops = this.bufferGeom.attributes.position.count;
		const colors = new Array(numLoops * 3).fill(0);

		this.bufferGeom.rotateX(-Math.PI * 0.5);

		for (let i = 0; i < numLoops; i++) {
			colors.push(0, 0, 0);
		}

		this.bufferGeom.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
		this.bufferGeom.computeVertexNormals();
		this.bufferGeom.computeBoundingSphere();

		this.bufferGeom.dynamic = true;

		this.plane = new THREE.Mesh(this.bufferGeom, planeMaterial);

		this.scene.add(this.plane);

		const light = new THREE.DirectionalLight(0xffffff, 2, 10);
		light.castShadow = true;

		this.scene.add(light);

		this.el.appendChild(this.renderer.domElement);

		window.world = this;
	}

	generate(noiseValues) {
		const position = this.bufferGeom.getAttribute('position');
		const { array: positionArray, count, itemSize } = position;

		const color = this.bufferGeom.getAttribute('color');
		const { array: colorArray } = color;

		for (let i = 0; i < count; i++) {
			const attributeIndex = i * itemSize;
			const noiseValue = noiseValues[i];

			positionArray[attributeIndex + 1] = noiseValue * 2;
			colorArray[attributeIndex] = noiseValue * -1;
			colorArray[attributeIndex + 1] = noiseValue * -1;
			colorArray[attributeIndex + 2] = noiseValue * -1;
		}

		this.bufferGeom.attributes.position.needsUpdate = true;
	}

	render() {
		this.bufferGeom.attributes.position.needsUpdate = true;
		this.bufferGeom.attributes.color.needsUpdate = true;

		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;

		this.camera.getWorldDirection(this.cameraDirection);

		this.renderer.render(this.scene, this.camera);
	}
}

export default World;
