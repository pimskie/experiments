<!DOCTYPE HTML>
<html lang="nl-NL">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
	<title>Extrude | ThreeJS</title>
	
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
        geometry,
        mesh,
        object,
        points,
        lineSpline,
        extrudeSettings,
        circleShape;
            
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
        		
		// stats
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		document.body.appendChild( stats.domElement );
		
		// shape
        var circleRadius = 10;
        circleShape = new THREE.Shape();
        circleShape.moveTo( 0, circleRadius );
        circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
        circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
        circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
        circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius );    
    
        material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
        material.doubleSided = true;
            
        points = [
            new THREE.Vector3(0, 0, 0),
        ];
        
        while (r > 0) {
            x += 2;
            y = (Math.sin(tha) * r);
            points.push(new THREE.Vector3(x, y, 0));  
            tha += step;
            r -= 2;
        }
        
        lineSpline =  new THREE.SplineCurve3(points);
        extrudeSettings = { amount:1,  bevelEnabled: false, steps: 150, extrudePath: lineSpline };

        circle3d = circleShape.extrude( extrudeSettings ); 
        mesh = new THREE.Mesh( circle3d, new THREE.MeshBasicMaterial({color: 0xff0000}));
        mesh.position.set( 0, 0, 0 );
        mesh.material.side = THREE.DoubleSide;
        scene.add(mesh);
        
        requestAnimationFrame( loop );
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