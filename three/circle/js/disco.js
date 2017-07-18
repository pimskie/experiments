var lastfm = new LastFM({
	apiKey    : '458e36e9d20fd8eaa0b5dcaf64d961b5',
	apiSecret : '496c6fb37fe040fc9b4f87cc977918e5'
});

/* Base: */
function DISCO_APP() {}
  DISCO_APP.prototype = {
    
    isLoading: false,
    firstRun: true,
    
    init: function () {
        
        artist = 'Passenger';
        if(window.location.hash) {
            //set the value as a variable, and remove the #
            artist = window.location.hash.replace('#', '');
        } 
        
        this.addListeners();
        this.searchArtist(artist);    	
    },
    
    
    
    addListeners: function() {
         document.addEventListener( 'mousemove', this.onMouseMove, false );
         document.addEventListener( 'mousedown', this.onMouseDown, false );
    },
    
    onMouseMove: function(e) {
        e.preventDefault();
        three_app.onMouseMove(e);
    },
    onMouseDown: function(e) {
        e.preventDefault();
        three_app.onMouseDown(e);
    },
    
    searchArtist: function(artistName) {
        this.loading();
        var me = this;
        lastfm.artist.getInfo({artist: artistName}, {success: function(data) {      				
    		if ( me.firstRun) {
    		  me.firstRun = false;
    		  three_app.firstArtist( data.artist );
    		}
    		    		
    	}, error: function(code, message){
    		console.log('error: ' + code);
    		console.log(message);
    		this.doneLoading();
    	}});
    },
    
    loadSimilar: function(artistName) {
        var me = this;
        lastfm.artist.getSimilar({artist: artistName}, {success: function(data) {
            if  ( ! _.isArray(data.similarartists.artist)) {
                console.log('no similar');
                return false;
            }
    		three_app.addArtists( data.similarartists.artist.slice(0, 10));
    		me.doneLoading();
    	}, error: function(code, message){
    		console.log('error: ' + code);
    		console.log(message);
    		this.doneLoading();
    	}});

    },
    
    loading: function() {
        // console.log('loading...');
    },

    doneLoading: function() {
        // console.log('done loading');
    },
};
