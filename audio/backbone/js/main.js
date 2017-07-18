/**
 * v0.0001: 
 * added input - output controls in components
 * for combining filters in one component (example: input = delay, output = delay volume)
 **/

require.config({
    paths: {
        domReady:       'domReady',
        dragElement:    'dragElement',
        connectionManager:    'connectionManager',
        jquery:         'libs/jquery/jquery',
        underscore:     'libs/underscore/underscore',
        backbone:       'libs/backbone/backbone',
        text:           'libs/require/text',
        json2:          'libs/json/json2',
        templates:      '../templates',
    },
    urlArgs: "bust=" +  (new Date()).getTime(),

});

// require(['app', 'text', 'json2'], function(app) {
require(['app', 'dragElement', 'connectionManager'], function(app, dragElement, connectionManager) {
    app.init();
    app.initAudio();
    setTimeout(function(){
        app.createSource();
        app.run(); 
    }, 10);    

    dragElement.initialize();
    connectionManager.initialize( document.querySelector('#canvas').getContext('2d') );
});