<!DOCTYPE HTML>
<html lang="nl-NL">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<title>Line | ThreeJS</title>
	
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
    <script src="../js/libs/stats.min.js"></script>
    <script src="js/tween.min.js"></script>
    
	
	<script type="text/javascript">
	var camera, scene, renderer, geometry, line;
	var mouseX = 0;
	var mouseY = 0;
		
	var screenW = window.innerWidth;
	var screenH = window.innerHeight;
	
	var stats;
	
	var r = 500;
	var tha = 0;
	var step = (10 * (Math.PI / 180));
	var thick = 20;
	var x = 0;
	var y = 0;
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
        var material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 1,
        });
        material.needsUpdate = true;
        geometry = new THREE.Geometry();          
        geometry.vertices.push( new THREE.Vector3(100, 500, 0) );        
        line = new THREE.Line(geometry, material);
        line.geometry.dynamic = true;
        
        // changes to the vertices
        line.geometry.__dirtyVertices = true;
        
        // changes to the normals
        line.geometry.__dirtyNormals = true;


        scene.add(line);  
	}
	
	function onMouseMove( e ) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		camera.updateProjectionMatrix();
	}
	
	function loop() {
       
        
        if ( r > 200) {
            r -= 2;
            x -= 1; // 10;
            y -= 1; //= Math.sin(tha) * r;
            tha += step;
        
            geometry.vertices.push( new THREE.Vector3(x, y, 0) );
        }
                
        if ( line.material.linewidth > 0) {
            // line.material.linewidth -= 0.05;  
        }
                             
        requestAnimationFrame(loop);
        
        renderer.clear();
        renderer.render( scene, camera );
        
        stats.update();
	}
	</script>
	
	
</body>
</html>