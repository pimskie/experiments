define([
	'jquery',
	'circle',
	'ui',
	'data'

], function($, Circle, Ui, Data) {
	
	return {
		firstRun: 		true,
		artistSearched: null,
		artist: 		null,
		artistTree: 	[],

		init: function() {
			this.initEvents();

			Data.init();
			if ( ! this.artistSearched) {
				this.artistSearched = 'daft punk';
			}
			
			// first run
			Data.search( this.artistSearched, function(d) {
				Circle.addArtist( d.artist );
			});
			this.firstRun = false;
		},

		initEvents: function() {
			var me = this;
			document.addEventListener("artistSelected", function(e) { 
				if ( e.loadData) {
					me.loadInfo(e.artist.name ); 
					me.loadSimilar(e.artist.name ); 
				}

				Ui.setBackground( e.artist.image );
			}, true);
		},

		loadInfo: function(name) {
			var me = this;
			Data.search( name, function(d) { 
				//console.log(d);
			});
		},


		artistInfoLoaded: function( data ) {
			Circle.addArtist( data.artist );
		},

		loadSimilar: function( name ) {
			Data.similar( name, this.artistSimilarLoaded );
		},

		artistSimilarLoaded: function( data ) {
			Circle.addSimilar( data );
		},

		getID: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
		},
	}
});

