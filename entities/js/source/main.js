requirejs.config({
	urlArgs: 'bust=' +  (new Date()).getTime(),

	//By default load any module IDs from js/lib
	paths: {
		underscore: '../vendor/underscore.min',
		text: 		'../vendor/require/text',
		Stats: 		'../vendor/stats.min',			// https://github.com/mrdoob/stats.js/
		Utils: 		'utils/utils'
	},
	shim: {
		'Stats': {
			exports: 'Stats'
		}
	}
});

require(['game'], function(game) {
	game.init();
});