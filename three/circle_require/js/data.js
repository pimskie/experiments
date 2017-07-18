define([
	'jquery',
	'app',
	'lastfm_api',
	'lastfm_md5',
], function($, App, Lastfm_fake) {
	
	return {
		LastFM: null,

		init: function() {
			this.LastFM = new LastFM({
				apiKey    : '458e36e9d20fd8eaa0b5dcaf64d961b5',
				apiSecret : '496c6fb37fe040fc9b4f87cc977918e5'
			});
		},

		search: function( artistName, callback ) {
			var me 		= this;
			callback 	= callback || this.emptyFunc;
	        this.LastFM.artist.getInfo({artist: artistName}, {
	        	success: function(data) { 
	    			callback( data );
	            	// me.loadVideos( artistName );  		
		    	}, 
		    	error: function(code, message){
	    			console.log('lastFM error: ' + code);
	    			console.log(message);
	    		}
	    	});
		},

		similar: function( artistName, callback ) {
	        var me = this;
	        callback 	= callback || this.emptyFunc;

	        this.LastFM.artist.getSimilar({artist: artistName}, {
	        	success: function(data) {
		            if  ( ! _.isArray(data.similarartists.artist)) {
		                console.log('no similar');
		                return false;
		            }
		    		callback( data.similarartists.artist.slice(0, 10) );
		    	},
		    	error: function(code, message){
		    		console.log('error: ' + code);
		    		console.log(message);
	    		}
	    	});
	    },

	    emptyFunc: function() {}
	}
});

