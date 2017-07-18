define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'text!templates/master.html'

], function($, _, Backbone, Base, template) {
	var Master = Base.extend({
    soundCtx: null,
    soundSource: null,
    audioElement: null,
    volume: null,
    controls: null,

    initialize: function(){
      console.log('Master init');
      this.events = _.extend(this.events, this.baseEvents);
      this.soundSource  = this.options.soundSource;
      this.audioElement = this.options.audioElement;

      this.volume = this.options.soundCtx.createGain();
      this.volume.gain.value = 1;
      this.volume.connect( this.options.soundCtx.destination );

      this.controls = {
        input:  this.volume,
        output: this.volume,
      };
    },

    render: function() {
      var data = {_: _ };
      var compiledTemplate = _.template( template, data );
      this.$el.html(compiledTemplate);
      this.audioElement.play();
      return this;
    },

    events: {
        "change #volume": "setVolume",
    },

    setVolume: function( e ){
      e.preventDefault();
      this.volume.gain.value = e.currentTarget.value / 100;
    }
  });

  return Master;
});