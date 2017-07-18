function THREE_APP() {
    var scene, world, renderer, world;
}
THREE_APP.prototype = {
    
    radian: 0,
    halfW: 0,
    halfH: 0,
    cubePosition: {x: 0, y: 0, z: 0},
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
            var maxRotate = 0.09;
            this.cameraRotX = -(maxRotate / 100) * ((mouseEvent.clientX - this.halfW) / this.halfW * 100);
            this.cameraRotY = -(maxRotate / 100) * ((mouseEvent.clientY - this.halfH) / this.halfH * 100);
        }
	
	},
    
    /**
     * checks if cube is clicked
     * action is triggered by by document.onmousedown
     **/
    onMouseDown: function(mouseEvent) {
        var obj = this.getIntersectedObj(mouseEvent);  
        if ( obj !== false) {           			
            this.selectArtist( obj.parent );            
        }
    },
    
    /**
     * selects a artist and moves camera to it
     * if clicked artist already is selected before, 
     * camera moves back and selected artist is moved back into the circle
     **/
    selectArtist: function( artist ) {       
        var cameraPos,
            me = this,
            goingBack = false;
             
        // new selected artist
        if (  this.artistTree[artist.id] == undefined) {                      
            this.artistTree[artist.id] = {parent: artist, similar: []};
            this.artistSelected = artist;
            
            // animate selected artist
            var artistPos  = {
                x: artist.position.x + (Math.cos(artist.angle - this.radian) * 1000),
                y: artist.position.y + (Math.sin(artist.angle - this.radian) * 1000),
                z: artist.position.z - 500
            };
                        
            new TWEEN.Tween(artist.position)
                .to(artist.destPos, 1000)
                .easing(TWEEN.Easing.Quartic.Out) 
                .start();   
                            
            cameraPos = _.clone(artist.destPos);
            disco_app.loadSimilar(artist.data.name);            
        
        // previous selected, going back
        } else {
            goingBack = true;
            var previousArtist = this.artistTree[artist.id].parent;         
            cameraPos = _.clone(previousArtist.destPos);
            this.artistSelected = previousArtist;
        }
        
        
        // update camera position
        cameraPos.z += 1000;
        new TWEEN.Tween(this.camera.position)
            .to(cameraPos, 2500)
            .easing(TWEEN.Easing.Quartic.Out) 
            .start(); 
        
        this.updateTree( goingBack );
    },
    
    updateTree: function( goingBack ) {
        
        var me = this;
        if ( ! goingBack) {
            this.circleIndex++;
            this.artistTree[this.artistSelected.id]['link'] = jQuery('<a/>', {
                id: this.artistSelected.id,
                href: '#',
                title: 'Terug naar ' + this.artistSelected.data.name,
                text: this.artistSelected.data.name
            }).appendTo('#trail #buttons').on('click', this.goBack);
            
            
        } else {
            
            _.each(this.artistTree, function(artist) {
                if (artist.parent.index > me.artistSelected.index) {
                    $(artist.link).remove();
                    _.each(artist.similar, function(similar) {
                        
                        var propsFrom = {
                            x: similar.position.x,
                            y: similar.position.y,
                            z: similar.position.z,
                            scale: 1,
                        };
                        
                        var propsTo = {
                            x: artist.parent.position.x,
                            y: artist.parent.position.y,
                            z: artist.parent.position.z,
                            scale: 0,
                        };
                        
                        new TWEEN.Tween(propsFrom)
                            .to(propsTo, 2000)
                            .easing(TWEEN.Easing.Cubic.Out) 
                            .onUpdate(function(){
                                similar.position.x = propsFrom.x;
                                similar.position.y = propsFrom.y;
                                similar.position.z = propsFrom.z;
                                similar.scale.x  = propsFrom.scale;
                                similar.scale.y  = propsFrom.scale;
                            })
                            .onComplete(function() {
                                 me.scene.remove(similar);
                            })
                            .start();
                    });
                    delete me.artistTree[artist.parent.id];
                }
            });
            
            // move similar back in position
            _.each(this.artistTree[this.artistSelected.id].similar, function(similar) {
                
                new TWEEN.Tween(similar.position)
                    .to(similar.origPos, 1000)
                    .easing(TWEEN.Easing.Cubic.Out) 
                    .start();
            });
            this.circleIndex = this.artistSelected.index; 
        }

        if ( $('#trail a').length > 1) {
            $('#trail a').first().addClass('append');
        }

        $('#trail').css({width: 8000});
        $('#trail').css({width: $('#buttons').width() + 10});
        trailScroll.refresh();
        trailScroll.scrollTo(-$('#trail a').last().position().left, 0, 500);
    },
    
    goBack: function(e) {
        e.preventDefault();
        var id = $(this).attr('id');
        var cube = three_app.artistTree[id].parent;
        three_app.selectArtist(cube); 
    },
        
    /**
     * checks for rollovers
     **/
	getIntersectedObj: function(event) {
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
        var artist = this.createArtist(artist, {x:0, y:0, z:0});
        artist.destPos = {x: 0, y: 0, z: 0};
        this.scene.add(artist);
        this.selectArtist(artist);
	},    
	
	addArtists: function(artists) {	 
	   this.radian     = (360 * (Math.PI / 180)) / artists.length;   
	   var angle       = 0;	  
	   var delay       = 0;
	   var me          = this;
	   
	   _.each(artists, function(artist) {
	       var position = _.clone(me.artistSelected.position);
	       position.z -= 10;
	       
            var to = {
                x: Math.round(position.x + (Math.cos(angle) * 800)),
                y: Math.round(position.y + (Math.sin(angle) * 800)),
                z: Math.round(position.z - 800)
            };
            var dest = {
                x: Math.round(position.x + (Math.cos(angle) * 2000)),
                y: Math.round(position.y + (Math.sin(angle) * 2000)),
                z: Math.round(position.z - 3000)
            };
            
			angle -= me.radian;
			
			var cube = me.createArtist( artist, position, dest );
			cube.angle = angle;
			me.artistTree[me.artistSelected.id]['similar'].push(cube);
			
			new TWEEN.Tween(position)
                .to(to, 1000)
                .easing(TWEEN.Easing.Quartic.Out) 
                .onUpdate(function() {
                    cube.position = position;    
                })
                .delay(delay)
                .start();
            
            delay += 100;			
			me.scene.add( cube );			
	   });
	},
	
	/**
	 * creates group with meshes for artist
	 * Object3D contains plane and text
	 *
	 **/
	createArtist: function( artist, position, destPosition ) {
        // plane material
        var img, planeMaterial, planeMesh;
        var file = artist.image[3];
        planeMaterial = new THREE.MeshBasicMaterial({
            map:THREE.ImageUtils.loadTexture('img.php?img=' + file['#text'])
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
        container.origPos   = _.clone(position);
        container.destPos   = destPosition;
        container.data      = artist;
        container.id        = artist.name;
        container.index     = this.circleIndex + 1;
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
		
		/*var delta = three_app.clock.getDelta();
		// three_app.controls.update( 1 );
		*/
		if ( ! three_app.cameraLocked) {
    		// camera rotation
    		three_app.camera.rotation.y += (three_app.cameraRotX - three_app.camera.rotation.y) * 0.1;
    		three_app.camera.rotation.x += (three_app.cameraRotY - three_app.camera.rotation.x) * 0.1;
        }
        
           		
		three_app.renderer.render( three_app.scene, three_app.camera );
		three_app.stats.update();
	},

};		
			