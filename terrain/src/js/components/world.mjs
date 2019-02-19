// https://medium.com/@crazypixel/geometry-manipulation-in-three-js-twisting-c53782c38bb
// https://github.com/mrdoob/three.js/issues/1003
// https://stackoverflow.com/questions/50426159/color-based-on-mesh-height-three-js
// https://threejs.org/examples/#webgl_geometry_terrain

import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';

const angleBetween = (vec1, vec2) => Math.atan2(vec2.y - vec1.y, vec2.x - vec1.x);

class World {
	constructor(el, mapSize = 100) {
		this.el = el;
		this.segments = mapSize - 1;

		const width = this.el.offsetWidth;
		const height = width / 1.777;

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
		this.camera.position.set(3, 4, 25);
		this.camera.rotation.set(-Math.PI / 2, 0, 0);
		this.cameraDirection = new THREE.Vector3();

		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(width, height);

		const fog = new THREE.Fog(0xffffff, 0.1, 100);
		this.scene.fog = fog;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);

		const cubeGeometry = new THREE.BoxGeometry(1, 0.5, 2);
		const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

		this.cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
		this.cube.position.set(0, 1, 0);
		// this.cube.castShadow = true;
		// this.cube.receiveShadow = true;

		this.scene.add(this.cube);

		const planeMaterial = new THREE.MeshPhongMaterial({
			vertexColors: THREE.VertexColors,
			wireframe: false,
			side: THREE.DoubleSide
		});

		this.bufferGeom = new THREE.PlaneBufferGeometry(200, 200, this.segments, this.segments);
		const numLoops = this.bufferGeom.attributes.position.count;
		const colors = new Array(numLoops * 3).fill(0);

		this.bufferGeom.rotateX(-Math.PI * 0.5);

		for (let i = 0; i < numLoops; i++) {
			colors.push(0, 0, 0);
		}

		this.bufferGeom.addAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));

		this.bufferGeom.dynamic = true;

		this.plane = new THREE.Mesh(this.bufferGeom, planeMaterial);

		this.scene.add(this.plane);

		const light = new THREE.DirectionalLight(0xffffff, 1, 10);

		this.scene.add(light);

		this.el.appendChild(this.renderer.domElement);

		window.world = this;

		window.addEventListener('resize', (e) => this.onWindowResize(e));
	}

	generate(noiseValues) {
		const position = this.bufferGeom.getAttribute('position');
		const { array: positionArray, count, itemSize } = position;

		const color = this.bufferGeom.getAttribute('color');
		const { array: colorArray } = color;

		for (let i = 0; i < count; i++) {
			const attributeIndex = i * itemSize;
			const noiseValue = noiseValues[i];

			positionArray[attributeIndex + 1] =  Math.pow(noiseValue * 2, 3);

			colorArray[attributeIndex] = noiseValue;
			colorArray[attributeIndex + 1] = noiseValue;
			colorArray[attributeIndex + 2] = noiseValue;
		}

		// WTF..?!
		// TODO
		let midIndex = Math.round(positionArray.length / 2);
		midIndex += (250 * 3) + 1;

		const midY = positionArray[midIndex] + 1;

		const nextIndex = midIndex - (((this.segments + 1) * 2) * 3);
		const nextY = positionArray[nextIndex];

		colorArray[midIndex] = 0;
		colorArray[midIndex + 1] = 1;
		colorArray[midIndex + 2] = 0;

		colorArray[nextIndex] = 1;
		colorArray[nextIndex + 1] = 0;
		colorArray[nextIndex + 2] = 0;

		this.cube.position.setY(midY);

		this.bufferGeom.attributes.position.needsUpdate = true;
	}

	render() {
		this.camera.getWorldDirection(this.cameraDirection);

		this.bufferGeom.attributes.color.needsUpdate = true;
		this.bufferGeom.attributes.position.needsUpdate = true;

		const theta = Math.atan2(this.cameraDirection.x, this.cameraDirection.z);

		console.log(this.cameraDirection);
		this.cube.rotation.y = theta;

		this.renderer.render(this.scene, this.camera);
	}

	onWindowResize() {
		const width = this.el.offsetWidth;
		const height = width / 1.777;

		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(width, height);
	}
}

export default World;
