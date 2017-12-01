/* globals THREE: false, */

let container;
let camera, scene, renderer;
let uniforms;

const init = async () => {
	const fragment = await fetch('fragment.frag').then(r => r.text());
	const vertex = await fetch('vertex.frag').then(r => r.text());

	container = document.getElementById('container');

	camera = new THREE.Camera();
	camera.position.z = 1;

	scene = new THREE.Scene();

	const geometry = new THREE.PlaneBufferGeometry(2, 2);

	uniforms = {
		u_time: { type: 'f', value: 1.0 },
		u_resolution: { type: 'v2', value: new THREE.Vector2() },
		u_mouse: { type: 'v2', value: new THREE.Vector2() },
	};

	const material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		fragmentShader: fragment,
		vertexShader: vertex,
	});

	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);

	container.appendChild(renderer.domElement);

	onWindowResize();
	window.addEventListener('resize', onWindowResize, false);

	document.onmousemove = function(e) {
		uniforms.u_mouse.value.x = e.pageX;
		uniforms.u_mouse.value.y = e.pageY;
	};
};

const onWindowResize = () => {
	renderer.setSize(window.innerWidth, window.innerHeight);

	uniforms.u_resolution.value.x = renderer.domElement.width;
	uniforms.u_resolution.value.y = renderer.domElement.height;
};

const animate = () => {
	requestAnimationFrame(animate);
	render();
};

function render() {
	uniforms.u_time.value += 0.05;

	renderer.render(scene, camera);
}

(async function boot() {
	await init();
	animate();
})();
