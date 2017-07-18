<!DOCTYPE HTML>
<html lang="nl-NL">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<title>Particles | ThreeJS</title>
	
	<link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
	
	<style type="text/css">
	body {
		margin: 0;
		background: #000;
	}
	</style>
</head>
<body>
	
	

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
	<script>window.jQuery || document.write('<script src="lib/js/jquery-1.7.2.min.js"><\/script>')</script>
	
    <script src="../build/three.js"></script>
    <script src="../js/Detector.js"></script>
    <script src="../js/libs/sparks.js"></script>
    <script src="../js/libs/stats.min.js"></script>
    <script src="js/tween.min.js"></script>
    
	
	<script type="text/javascript">
	var camera, scene, renderer, geometry, line;
	var mouseX = 0;
	var mouseY = 0;
		
	var screenW = window.innerWidth;
	var screenH = window.innerHeight;
	
	var stats;
	
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
		
		createLine();
		
		// kick off
		requestAnimationFrame( loop );
	}
	
	function createLine() {
        var counter = new SPARKS.SteadyCounter( 500 );
        var emitter = new SPARKS.Emitter( counter );
        emitter.start();
        
        emitterpos = new THREE.Vector3( 0, 0, 0 );
        emitter.addInitializer( new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
        emitter.addInitializer( new SPARKS.Lifetime( 1, 15 ));
        var vector = new THREE.Vector3( 0, -5, 1 );
        emitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( vector ) ) );

        emitter.addAction( new SPARKS.Age() );
        emitter.addAction( new SPARKS.Accelerate( 0, 0, -50 ) );
        emitter.addAction( new SPARKS.Move() );
        emitter.addAction( new SPARKS.RandomDrift( 90, 100, 2000 ) );

	}
	
	function onMouseMove( e ) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		camera.updateProjectionMatrix();
	}
	
	function loop() {
                                 
        requestAnimationFrame(loop);
        
        renderer.clear();
        renderer.render( scene, camera );
        
        stats.update();
	}
	</script>
	
	
</body>
</html>