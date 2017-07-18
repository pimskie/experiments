function THREE_APP() {
    var scene, world, renderer, world;
}
THREE_APP.prototype = {
    
    radian: 0,
    halfW: 0,
    halfH: 0,
    cubePosition: {x: 0, y: 0, z: 1000},
    circleIndex: 0,
    
    // artist vars
    artistSelected: null,
    artistTree: {},
    // artistData: [],
    
    // vars to check mouse collision
    vector: null,
    projector: null,
    raycaster: null,
    intersects: [],
    
    // camera vars
    cameraLocked: false,
    cameraRotX: 0,
    cameraRotY: 0,
    cameraPosition: {x: 0, y: 0, z: 1000},
    
    // line vars
    line: null,
    lineMaterial: null,
    
    // tween vars
    rolloverTween: null, 
    rolloverEnabled: true,
    
    init: function() {
        
        this.cubes = [];
        this.container = document.getElementById( 'container' );
		
		// scene 
		this.scene = new THREE.Scene();
						
		// camera
		this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
        this.camera.position.set( 0, 0, 2000 );
		
		this.scene.fog = new THREE.FogExp2( 0xffffff, 0.0003 );
        
		// renderer
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		// this.renderer = new THREE.CanvasRenderer( { antialias: true } );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.container.appendChild( this.renderer.domElement );
		
		// projector
		this.projector = new THREE.Projector();
		
		// world 
		this.world = new THREE.Object3D();
		this.world.position.z = -500;
		this.world.rotation.y = (180/Math.PI) * 180;
		this.world.scale.x = this.world.scale.y = this.world.scale.z = 100;
		this.scene.add( this.world );
			
		// stats
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		this.container.appendChild( this.stats.domElement );

		// events
		window.addEventListener( 'resize', this.onWindowResize, false );	
		this.onWindowResize();
		
		// line init
		this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x7fe018,
            linewidth: 1,
        });
        this.lineMaterial.needsUpdate = true;
		
		this.animate();		
    },
    
    
    /**
     * handels rollovers / rollout of cubes
     * action is triggered by plane in parent (object3D)
     * 
     **/
	onMouseMove: function(mouseEvent) {        
        // move camera
        if ( ! this.camera_locked) {
            var maxRotate = 0.07;
            this.cameraRotX = -(maxRotate / 100) * ((mouseEvent.clientX - this.halfW) / this.halfW * 100);
            this.cameraRotY = -(maxRotate / 100) * ((mouseEvent.clientY - this.halfH) / this.halfH * 100);
        }
        
        if ( ! this.rolloverEnabled) {
            return false;
        }
        
        // check rollover
        var obj     = this.getIntersectedObj(mouseEvent),
            body    = document.getElementById('body');
        
        if ( obj !== false && obj.isAnimating !== true && obj.parent != this.artistSelected) {
            obj.isAnimating = true;
            
            // heavy performance drop
            //body.setAttribute('class', 'hand');
            
            var scale   = { x: 1, y: 1 };
            var target  = { x : 1.5, y: 1.5 };
                        
            // scale the parent
            this.rollover_tween = new TWEEN.Tween(scale)
                .to(target, 300)
                .easing(TWEEN.Easing.Quartic.Out) 
                .onUpdate(function(){
                    obj.parent.scale.x = scale.x;
                    obj.parent.scale.y = scale.y;
                })
                .start();
        } else if (obj === false) {
            body.setAttribute('class', '');
            
            _.each(this.cubes, function(obj) {
                var scale = {x: obj.parent.scale.x, y: obj.parent.scale.y};
                var target = {x: 1, y: 1};
                
                new TWEEN.Tween(scale)
                    .to(target, 300)
                    .easing(TWEEN.Easing.Quartic.Out) 
                    .onUpdate(function(){
                        obj.parent.scale.x = scale.x;
                        obj.parent.scale.y = scale.y;
                    })
                    .start();
                    
                obj.isAnimating = false;
            });
        }
    },
    
    /**
     * checks if cube is clicked
     * action is triggered by by document.onmousedown
     **/
    onMouseDown: function(mouseEvent) {
        var obj = this.getIntersectedObj(mouseEvent);  
        if ( obj !== false) {
            obj.scale.x = 1;
            obj.scale.y = 1;
            this.rollover_tween.stop();            			
            this.selectArtist( obj.parent );            
        }
    },
    
    /**
     * selects a artist and moves camera to it
     * if clicked artist already is selected before, 
     * camera moves back and selected artist is moved back into the circle
     **/
    selectArtist: function( obj ) {       
        var me          = this,
            cube        = obj,
            from        = cube.position,
            index       = cube.index;
            goingBack   = false;           
        
        // check if artist is previous selected. If yes, go back
        if (index && index != '' && _.has(this.artistTree, index)) {
            this.rolloverEnabled = false;
            goingBack = true;
            
            cube = this.artistTree[index].parent;
            this.cubePosition = cube.position;
            this.circleIndex--;
            
            // remove circle since we're going background
            // looping through all similar artists of currently selected artist
            _.each(this.artistTree[this.circleIndex]['similar'], function(artistContainer) {
                // tween all similar artist to zero and delete them afterwards
                var scaleFrom = {x: 1, y: 1};
                var scaleTo = {x: 0, y: 0};
                new TWEEN.Tween(scaleFrom)
                    .to(scaleTo, 1000)
                    .easing(TWEEN.Easing.Quartic.Out) 
                    .onUpdate(function(){
                        artistContainer.scale.x = scaleFrom.x;
                        artistContainer.scale.y = scaleFrom.y;
                    })
                    .onComplete(function(){
                        me.scene.remove(artistContainer);
                        me.rolloverEnabled = true;
                    })
                    .start(); 
            });
            // remove selected artist from artistTree since it isn't selected anymore
            // delete this.artistTree[me.circleIndex];
            
            // tween previous selected artist back in place of circle
            var positionFrom = _.clone(this.artistSelected.position);
            new TWEEN.Tween(positionFrom)
                .to(_.clone(this.artistSelected.origPosition), 1000)
                .easing(TWEEN.Easing.Quartic.Out) 
                .onUpdate(function(){
                    me.artistSelected.position = positionFrom;
                })
                .onComplete(function(){})
                .start(); 

        
        // going forward
        } else {
            // animate selected artist       
            this.cubePosition  = {
                x: cube.position.x + (Math.cos(cube.angle - this.radian) * 1000),
                y: cube.position.y + (Math.sin(cube.angle - this.radian) * 1000),
                z: from.z - 500
            };
            cube.origPosition = _.clone(cube.position);
            this.circleIndex++;
                                 
            new TWEEN.Tween(from)
                .to(me.cubePosition, 1000)
                .easing(TWEEN.Easing.Quartic.Out) 
                .onUpdate(function(){
                    cube.position = from;
                })
                .onComplete(function(){
                    me.artistSelected   = cube; 
                    me.cubePosition     = cube.position; 
                })
                .start(); 
        }
        
        // animate camera
        this.cameraLocked = true;
        var camFrom = this.camera.position;
        var camTo   = _.clone(this.cubePosition);
        camTo.z     = camTo.z + 1000;   
               
        new TWEEN.Tween(camFrom)
            .to(camTo, 1500)
            .easing(TWEEN.Easing.Quartic.Out) 
            .onUpdate(function(){
                me.camera.position = camFrom;
            })
            .onComplete(function(){
                me.cameraLocked = false;
                me.artistSelected = cube;
                if ( ! goingBack) {
                    me.artistTree[me.circleIndex] = [];
                    me.artistTree[me.circleIndex]['parent'] = cube;
                    disco_app.loadSimilar(cube.data.name);
                }
                me.updateTrail(goingBack);
            })
            .delay(500)
            .start(); 
    },
    
    updateTrail: function( goingBack ) {
        return;
        
        if (goingBack == true) {
            $('#' + this.artistSelected.data.mbid).remove();
            return;
        }
        
        this.artistTree[this.artistSelected.data.mbid]['link'] = jQuery('<a/>', {
            id: this.artistSelected.data.mbid,
            href: '#',
            title: 'Terug naar ' + this.artistSelected.data.name,
            text: this.artistSelected.data.name
        }).appendTo('#trail div').on('click', this.goBack);
    },
    
    goBack: function(e) {
        e.preventDefault();
        var id = $(this).attr('id');
        var cube = three_app.artistTree[id]['parent'];
        three_app.selectArtist(cube); 
    },
       
    
    /**
     * checks for rollovers
     **/
	getIntersectedObj: function(mouseEvent) {
        this.vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
        this.projector.unprojectVector( this.vector, this.camera );
        this.raycaster = new THREE.Raycaster( this.camera.position, this.vector.subSelf( this.camera.position ).normalize() );
        this.intersects = this.raycaster.intersectObjects( this.cubes );
        
        if ( this.intersects.length > 0 ) {
            return this.intersects[ 0 ].object;
        }
        
        return false;
	},
		
	firstArtist: function(artist) {
        this.artistSelected = this.createArtist(artist, this.cubePosition);
		this.scene.add(this.artistSelected);
		this.artistTree[this.circleIndex] = [];
		this.artistTree[this.circleIndex]['parent'] = this.artistSelected;
		this.updateTrail();
	},    
	
	addArtists: function(artists) {	   
	   this.radian     = (360 * (Math.PI / 180)) / artists.length;   
	   var angle       = 0;	  
	   var me          = this;
	   
	   this.artistTree[this.circleIndex]['similar'] = [];
	   _.each(artists, function(artist) {
	       var position = _.clone(me.cubePosition);
            var to = {
                x: me.cubePosition.x + (Math.cos(angle) * 700),
                y: me.cubePosition.y + (Math.sin(angle) * 700),
                z: me.cubePosition.z - 500
            };
			angle += me.radian;
			
			var cube = me.createArtist( artist, position );
			cube.angle = angle;
			me.artistTree[me.circleIndex]['similar'].push(cube);
			
			new TWEEN.Tween(position)
                .to(to, 1000)
                .easing(TWEEN.Easing.Elastic.Out) 
                .onUpdate(function() {
                    cube.position = position;    
                })
                .onComplete(function(){
                   
                })
                .start();
            
			me.scene.add( cube );
	   });
	},
	
	/**
	 * creates group with meshes for artist
	 * Object3D contains plane and text
	 *
	 **/
	createArtist: function( artist, position ) {
        // plane material
        var img, planeMaterial, planeMesh;
        planeMaterial = new THREE.MeshBasicMaterial({
            map:THREE.ImageUtils.loadTexture('img.php?img=' + artist.image[3]['#text'])
        });
        planeMaterial.overdraw = true;
         
        // plane
        plane       = new THREE.PlaneGeometry( 200, 200 );
        planeMesh   = new THREE.Mesh( plane, planeMaterial );
        
        var textW = this.getTextWidth(artist.name);
        // text canvas
        var canvas, context, textWidth, textTexture, textMaterial, textMesh;
        canvas              = document.createElement('canvas');
        canvas.width        = textW + 20;
        canvas.height       = 75;
        context             = canvas.getContext('2d');
        context.textAlign = 'center';
        context.beginPath();
        context.rect(0, 0, canvas.width, 75);
        context.fillStyle = 'rgba(127, 224, 24, 1)';
        context.fill();
        context.font        = "Italic 30px Arial";
        context.fillStyle   = "white";
        context.fillText(artist.name, canvas.width >> 1, 50);
     
        // text texture
        textTexture = new THREE.Texture(canvas); 
        textTexture.needsUpdate = true;
        
        // text material
        textMaterial = new THREE.MeshBasicMaterial( {map: textTexture} );
        textMaterial.overdraw = true;
        
        // text mesh
        textMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(canvas.width, canvas.height),
            textMaterial
        );
        textMesh.position.set(0, -140, 20);
                
        // container
        var container       = new THREE.Object3D();
        container.position  = position;
        container.data      = artist;
        container.index     = this.circleIndex;
        container.add(planeMesh);
        container.add(textMesh);
        
        this.cubes.push(planeMesh);
        return container;		
	},
	
	getTextWidth: function(text) {
        var canvas  = document.createElement('canvas');
        var context     = canvas.getContext('2d');
        context.font    = "Italic 30px Arial";
        textWidth       = context.measureText(text);
        return textWidth.width;
	},
	
	onWindowResize: function() {
        three_app.halfW = window.innerWidth >> 1;
        three_app.halfH = window.innerHeight >> 1;
		three_app.camera.aspect = window.innerWidth / window.innerHeight;
		three_app.camera.updateProjectionMatrix();
		three_app.renderer.setSize( window.innerWidth, window.innerHeight );
	},


	animate: function() {
		requestAnimationFrame( three_app.animate );		
		TWEEN.update();		
		
		if ( ! three_app.cameraLocked) {
    		// camera rotation
    		three_app.camera.rotation.y += (three_app.cameraRotX - three_app.camera.rotation.y) * 0.1;
    		three_app.camera.rotation.x += (three_app.cameraRotY - three_app.camera.rotation.x) * 0.1;
        }
            		
		three_app.renderer.render( three_app.scene, three_app.camera );
		three_app.stats.update();
	},

};		
			