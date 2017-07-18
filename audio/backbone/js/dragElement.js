define([
  'jquery',
  'underscore',
  'backbone',
  'connectionManager',
], function($, _, Backbone, connectionManager) {

	var DragElement = {
		
		draggingElement: null,
		isDragging: false,
		zIndex: 1,

		initialize: function() {
			console.log( 'dragElement init' );
			var me = this;

			$(document).on('mousedown', '.component .drag', function( e ){
				me.draggingElement = $(e.target).parent();
				me.zIndex += 1;

				$(document).on('mousemove', function(e) { me.drag(e); });
				$(document).on('mouseup', 	function(e) { me.stopDrag(e); } );
			}).on('mouseup', '.component .drag', function( e ){
				me.stopDrag();
			});
		},

		drag: function( mouseEvent ) {
			connectionManager.drawLines();
			
			this.draggingElement.css({
				left: mouseEvent.pageX - (this.draggingElement.width() / 2) - 70 + 'px',
				top: mouseEvent.pageY - 10 + 'px',
				zIndex: this.zIndex,
			});
		},

		stopDrag: function() {
			$(document).off('mousemove');
		},
	}

	return DragElement;

});
