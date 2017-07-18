define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'views/components/delay',
  'views/components/bass',
  'text!templates/components/controls.html'

], function($, _, Backbone, Base, Delay, Bass, template){
  var Controls = Backbone.View.extend({

  	el: $('#container'),
    numComponents: 0,

    initialize: function() {
    },

    render: function() {
      var data = {_: _ };
      var compiledTemplate = _.template( template, data );
      this.$el.append( compiledTemplate ); 
    },

    events: { 
        "click #add_delay": "addDelay", 
        "click #add_bass": "addBass", 
    },

    addDelay: function( e ){
        var options = _.clone( this.options );
        options.className = 'component delay';
        var delay = new Delay( options );
        this.addComponent( delay );
    },

    addBass: function( e ){
        var options = _.clone( this.options );
        options.className = 'component bass';
        var bass = new Bass( options );
        this.addComponent( bass );
    },

    addComponent: function( component ) {
      var el = component.render().el;
      $('#container').append(el);
      $(el).css({
        left: Math.floor(Math.random()*( ($(window).width() - $(el).width()) - 100 + 1) + 100),
        top:  Math.floor(Math.random()*( ($(window).height() - $(el).height()) - 100 + 1) + 100),
      });
      this.numComponents += 1;
    },

  });
  return Controls;
});