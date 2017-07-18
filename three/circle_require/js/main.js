/**
 * v0.0001: 
 * added input - output controls in components
 * for combining filters in one component (example: input = delay, output = delay volume)
 **/

require.config({
    paths: {
        // components
        circle_namelabel:       'circle/namelabel',

        // libs
        tween:                  'libs/tween/tween',
        iscroll:      			'libs/iscroll/iscroll',
        jquery:         		'libs/jquery/jquery',
        underscore:     		'libs/underscore/underscore',
        backbone:       		'libs/backbone/backbone',
        text:           		'libs/require/text',
        json2:                  'libs/json/json2',
        lastfm_api:             'libs/lastfm/lastfm.api',
        lastfm_md5:             'libs/lastfm/lastfm.api.md5',
    },
    urlArgs: "bust=" +  (new Date()).getTime(),

});

require(
    [
        'app', 
        'ui', 
        'circle',
        'circle_namelabel',
        'libs/three/three', 
        'libs/three/stats', 
        'libs/quantize/quantize', 
        'libs/colorthief/color-thief', 
    ], 

    function(App, Ui, Circle, three, stats) {
        Ui.init();
        Circle.init();
        App.init();
    }
);