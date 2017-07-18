define([
	'jquery',
	'underscore', 
	'app',
	'circle_namelabel',
	'tween',
], function($, _, App, Circle_NameLabel) {
	
	return {
			
		radian: 0,
	    controls: null,
	    clock: null,
	    
	    // artist vars
	    artistSelected: null,
	    artistTree: {},
    	circleIndex: 0,
	    
	    // vars to check mouse collision
	    vector: null,
	    projector: null,
	    raycaster: null,
	    intersects: [],
	    object3Ds: [],
	    
	    // camera vars
	    cameraLocked: false,
	    cameraRotX: 0,
	    cameraRotY: 0,
	    cameraPosition: {x: 0, y: 0, z: 0},
	    cameraDistance: -750,

	    ANIMTIME: 1000,

		// modules
		init: function() {
        	this.container = document.getElementById( 'container' );
			this.setupTHREE();

			var me = this;
			window.addEventListener( 'resize', function(){
				me.onWindowResize();
			}, false );
			document.addEventListener( 'mousedown', function(e) {
				me.onMouseDown( e );
			}, false );

			this.onWindowResize();
		},


		/** 
		 * create 3d space with scene, camera, renderer etc
		 **/
		setupTHREE: function() {
			// scene 
			this.scene = new THREE.Scene();
							
			// camera
			this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 5000 );
	        this.camera.position.set( 0, 0, 2000 );
			
			this.scene.fog = new THREE.FogExp2( 0xffffff, 0.0003 );
	        
			// renderer
	        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
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
			this.stats.domElement.style.top = '100px';
			this.container.appendChild( this.stats.domElement );

			this.animate();	
		},

	     
		/**
	     * checks if cube is clicked
	     * action is triggered by by document.onmousedown
	     **/
	    onMouseDown: function( mouseEvent ) {
	        var obj = this.getIntersectedObj( mouseEvent );  
	        if ( obj !== false) {           			
	            this.selectArtist( obj.parent );            
	        }
	    },

	    /**
	     * checks for rollovers
	     **/
		getIntersectedObj: function( event ) {
	        this.vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
	        this.projector.unprojectVector( this.vector, this.camera );
	        this.raycaster = new THREE.Raycaster( this.camera.position, this.vector.subSelf( this.camera.position ).normalize() );        
	        this.intersects = this.raycaster.intersectObjects( this.object3Ds );

	        if ( this.intersects.length > 0 ) {
	            return this.intersects[ 0 ].object;
	        }
	        return false;
		},

		/**
		 * animate artist and camera
		 * if needed, load data
		 **/
		selectArtist: function ( artist ) {	
			var goingBack = false;

			if ( this.artistTree[artist.name] == undefined) {
				// new artist
            	this.artistTree[artist.name] = {artist: artist, similar: []};
            	this.artistSelected = artist;

            } else {
            	// previous loaded artist, going back
            	goingBack = true;
            	this.artistSelected = this.artistTree[artist.name].artist;

            	/*
            	// animate similar back in position
            	var similarArtists = this.artistTree[artist.name].similar;
            	_.each(similarArtists, function(similarArtist) {
            		var posTo = similarArtist.origPosition;
            		var pos = _.clone(similarArtist.position);

            		new TWEEN.Tween(pos)
                        .to(posTo, 2000)
                        .easing(TWEEN.Easing.Cubic.Out) 
                        .onUpdate(function(){
                            similarArtist.position.z = pos.z;
                            console.log( pos );
                        })
        		});
				*/
            }

			// animate artist position to destination
			new TWEEN.Tween(this.artistSelected.position)
                .to(this.artistSelected.destination, this.ANIMTIME)
                .easing(TWEEN.Easing.Quartic.Out) 
                .start();   

            this.camera.destination = _.clone(this.artistSelected.destination);
            this.camera.destination.z -= this.cameraDistance;
            new TWEEN.Tween(this.camera.position)
                .to(this.camera.destination, this.ANIMTIME)
                .easing(TWEEN.Easing.Quartic.Out) 
                .start();

            // load data
        	var evt 		= document.createEvent("Events");
            evt.initEvent('artistSelected', true, true); //true for can bubble, true for cancelable
            evt.artist 		= this.artistSelected; 
            evt.loadData 	= ! goingBack; 
	        document.dispatchEvent(evt);
		},

		addArtist: function( artist ) {
			var artist = this.createArtist( artist, {x:0, y:0, z:0}, 0 );
			this.scene.add( artist );
			this.selectArtist( artist );
		},

		addSimilar: function( artists ) {
			this.radian     = (360 * (Math.PI / 180)) / artists.length;   
			var angle       = 0	  
				delay       = 0,
				me          = this;
			
			this.artistSelected.similar = artists;

			_.each(artists, function(artist) {
				var position = _.clone(me.artistSelected.position);
				position.z -= 1000;
				var to = {
					x: Math.round(position.x + (Math.cos(angle) * 700)),
					y: Math.round(position.y + (Math.sin(angle) * 700)),
					z: Math.round(me.artistSelected.position.z - 800)
				};
				angle -= me.radian;
				var object3D = me.createArtist( artist, position, angle + me.radian );
				delay += 100;		

				me.artistTree[me.artistSelected.name]['similar'].push( object3D );	
				me.scene.add( object3D );
				
	            new TWEEN.Tween(object3D.position)
	                .to(to, this.ANIMTIME)
	                .easing(TWEEN.Easing.Quartic.Out) 
	                .start();			
			});
		},

		/**
		 * creates group with meshes for artist
		 * Object3D contains plane and text
		 **/
		createArtist: function( artist, position, radian ) {
	        // plane material
	        var imgURL = artist.image[3]['#text'],
	        	img, 
	        	planeMaterial, 
	        	planeMesh;
	        
	        planeMaterial = new THREE.MeshBasicMaterial({
	            map:THREE.ImageUtils.loadTexture('img.php?img=' + imgURL)
	        });
	        planeMaterial.overdraw = true;

	        // plane
	        plane       = new THREE.PlaneGeometry( 200, 200 );
	        planeMesh   = new THREE.Mesh( plane, planeMaterial );
	        
	        // create name label as mesh with canvas material
	        var nameLabelMesh = Circle_NameLabel.create( artist.name );

	        // destination when clicked
			var destination = {
                x: Math.round(position.x + Math.cos(radian) * 2000),
                y: Math.round(position.y +  Math.sin(radian) * 2000),
                z: position.z - 3000
            };

			// container
	        var container       	= new THREE.Object3D();
	        container.position 		= position;
	        container.origPosition	= _.clone(position);
	        container.destination 	= destination;
	        container.name 		 	= artist.name;
	        container.index 		= this.circleIndex + 1;
	        container.image 		= imgURL;
	        //container.radian    	= radian;
	        container.similar 		= {};
	        container.add(planeMesh);
	        container.add(nameLabelMesh);

	        this.object3Ds.push( planeMesh );
	        return container;	        
		},
		/**
		 * execute animation / update functions 
		 **/
		animate: function() {
			var me = this;
			TWEEN.update();
			requestAnimationFrame( function() {
				me.animate();
			});

			this.renderer.render( this.scene, this.camera );
			this.stats.update();
		},


		/**
		 * window resize handler
		 * updates camera and scene
		 **/
		onWindowResize: function() {
	        this.halfW = window.innerWidth >> 1;
	        this.halfH = window.innerHeight >> 1;
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
			this.renderer.setSize( window.innerWidth, window.innerHeight );
		},
	}
});

