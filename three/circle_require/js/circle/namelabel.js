// needs THREE
define([
	'jquery',
	'app',
], function($, App) {
	
	return {
		create: function( name ) {
			var textW = this.getTextWidth( name ),
	        	canvas, 
	        	context, 
	        	textWidth, 
	        	textTexture, 
	        	textMaterial, 
	        	textMesh;

	        canvas              = document.createElement('canvas');
			canvas.width        = textW + 20;
			canvas.height       = 75;
			context             = canvas.getContext('2d');
			context.textAlign 	= 'center';
			context.beginPath();
			context.rect(0, 0, canvas.width, 75);
			context.fillStyle = 'rgba(127, 224, 24, 1)';
			context.fill();
			context.font        = "Italic 30px Arial";
			context.fillStyle   = "white";
			context.fillText( name, canvas.width >> 1, 50 );

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

			return textMesh;

		},

		getTextWidth: function(text) {
	        var canvas  = document.createElement('canvas');
	        var context     = canvas.getContext('2d');
	        context.font    = "Italic 30px Arial";
	        textWidth       = context.measureText(text);
	        return textWidth.width;
		},
	}
});

