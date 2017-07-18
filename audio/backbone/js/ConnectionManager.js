define([
  'jquery',
  'underscore',
  'backbone',
], function($, _, Backbone) {

	var ConnectionManager = {
		canvasCtx: null,

		firstComponent: null,
		firstDirection: null,

		secondComponent: null,
		secondDirection: null,

		connecting: false,

		connections: new Array(),

		initialize: function( canvasCtx ) {
			console.log( 'ConnectionManager init' );			
			this.canvasCtx = canvasCtx;
			var me = this;
			$(window).on('resize', function(){ 
				me.canvasCtx.canvas.width  = window.innerWidth;
  				me.canvasCtx.canvas.height = window.innerHeight;

  				me.drawLines();
			});
			$(window).resize();
		},

		connect: function( component, direction ) {
			if ( ! this.connecting) {
				this.firstComponent = component;
				this.firstDirection = direction;
				this.connecting = true;
			} else {
				if (this.firstComponent == component) {
					console.log('error: same component');
					this.reset();
				} else if (this.firstDirection == direction) {
					console.log('error: same direction');
					this.reset();
				} else if ( this.checkIsConnected( this.firstComponent, component ) == true ) {
					console.log( 'already connected' );
				} else {
					console.log( 'connected' );
					this.secondComponent = component;
					this.secondDirection = direction;
					this.makeConnection( );
					this.connecting = false;
				}
			}
		},

		disconnect: function( component, direction ) {
			var outputId,
				children;
			/*
			 * Twee kanten op kunnen disconneten
			 * Afhankelijk van welke aan welke verbonden is
			 **/ 
			/*	
			if (direction == 'input') {
				console.log( component.connectedViewIn );
			} else {
				console.log( component.connectedViewOut );
			}
			return;

			
			for (outputId in this.connections) {
				children = this.connections[outputId].children;
				for (var index in children) {
					if (children[index] == component) {
						delete children[index];
					}
				}
			}
			return;

			delete this.connections[component.cid];
			this.drawLines();
			*/
		},

		checkIsConnected: function( output, input ) {
			var connection = this.connections[output.cid];
			if ( connection == null) {
				return false;
			}

			var children = connection.children;
			for (var index in children) {
				if (children[index] == input) {
					return true;
				}
			}

			return false;
		},

		makeConnection: function() {
			$(this.firstComponent.el).find('.' + this.firstDirection).removeClass('active').addClass('connected');
			$(this.secondComponent.el).find('.' + this.secondDirection).removeClass('active').addClass('connected');

			var input,
				output;
			if ( this.firstDirection == 'input') {
				input 	= this.firstComponent;
				output 	= this.secondComponent;
			} else {
				input 	= this.secondComponent;
				output 	= this.firstComponent;
			}

			output.connectedViewOut = input;
			input.connectedViewIn 	= output;

			output.controls.output.connect( input.controls.input );

			if ( ! this.connections[output.cid]) {
				this.connections[output.cid] = {view: output, children: []};
			}
			this.connections[output.cid].children.push(input);

			this.drawLines( ); 
		},

		drawLines: function() {
			// clear canvas
			this.canvasCtx.clearRect(0, 0, this.canvasCtx.canvas.width, this.canvasCtx.canvas.height);

			// loop thorugh connections
			var outputId,
				outputView,
				input,
				children,
				$startElement,
				$endElement,
				lineStartPoint,
				lineEndPoint;

			for (outputId in this.connections) {
				outputView 	= this.connections[outputId].view;
				children	= this.connections[outputId].children;

				$startElement 		= $(outputView.el).find('.output');
				lineStartPoint 		= $startElement.offset();
				lineStartPoint.left += $startElement.width() / 2;
				lineStartPoint.top 	+= $startElement.height() / 2;

				for (var index in children) {
					$endElement 		= $(children[index].el).find('.input');
					lineEndPoint 		= $endElement.offset();
					lineEndPoint.left 	+= $endElement.width() / 2;
					lineEndPoint.top 	+= $endElement.height() / 2;

					this.canvasCtx.beginPath();
					this.canvasCtx.moveTo(lineStartPoint.left, lineStartPoint.top);
					this.canvasCtx.lineTo(lineEndPoint.left, lineEndPoint.top);
					this.canvasCtx.lineWidth = 5;
					this.canvasCtx.strokeStyle ='#cfcfcf';
					this.canvasCtx.stroke();

				}
				// outputStartPoint =  
			}
		},

		reset: function() {
			$('.input, .output').removeClass('active');
			this.firstDirection = 
			this.firstComponent = 
			this.secondDirection = 
			this.secondComponent = null;
			this.connecting = false;
		},
	}

	return ConnectionManager;
});
