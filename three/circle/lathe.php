<!DOCTYPE HTML>
<html lang="nl-NL">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<title>Lathe | ThreeJS</title>
	
	<link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
	
	<style type="text/css">
	body {
		margin: 0;
		background: #fff;
	}
	</style>
</head>
<body>
	
	

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script>window.jQuery || document.write('<script src="lib/js/jquery-1.7.2.min.js"><\/script>')</script>
	
    <script src="../build/three.js"></script>
    <script src="../js/Detector.js"></script>
    <script src="../js/libs/stats.min.js"></script>
    <script src="js/tween.min.js"></script>
    
	
	<script type="text/javascript">
	var camera, scene, renderer, geometry, line;
	var mouseX = 0;
	var mouseY = 0;
		
	var screenW = window.innerWidth;
	var screenH = window.innerHeight;
	
	var stats;
    
    var material,
        mesh,
        object,
        points,
        seg;
        
	init();
	
	// start the show
	function init() {
		camera = new THREE.PerspectiveCamera( 90, screenW / screenH, 1, 4000 );
		camera.position.z = 1000;
		
		// setup the scene, containing all 3d stuff
		scene = new THREE.Scene();
		scene.add( camera );
		
		renderer = new THREE.WebGLRenderer(  { antialias: false }  );
		renderer.setSize( screenW, screenH );
		renderer.autoClear = false;
		
		document.body.appendChild( renderer.domElement );
		
		document.addEventListener( 'mousemove', onMouseMove, false );
		
		// stats
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		document.body.appendChild( stats.domElement );
		
		// build
        seg = 20;
        step = 20;        
        var pts = [
            new THREE.Vector3(150,0,50),//top left
            new THREE.Vector3(200,0,50),//top right
            new THREE.Vector3(200,0,-50),//bottom right
            new THREE.Vector3(150,0,-50),//bottom left
            new THREE.Vector3(150,0,50)//back to top left - close square path
        ];
        mesh = new THREE.Mesh( new THREE.LatheGeometry( pts, 20 ), new THREE.MeshLambertMaterial( { color: 0x2D303D, wireframe: true, shading: THREE.FlatShading } ));
        mesh.position.y = 150;
        mesh.overdraw = true;
        mesh.doubleSided = true;
        
        scene.add( mesh );        
        requestAnimationFrame( loop );
	}
	
	function createLine() {
    
   
   	}
	
	function onMouseMove( e ) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		camera.updateProjectionMatrix();
	}
	
	function loop() {
        mesh.rotation.x += 0.01;                    
        requestAnimationFrame(loop);
        
        renderer.clear();
        renderer.render( scene, camera );
        
        stats.update();
	}
	</script>
	
	
</body>
</html>