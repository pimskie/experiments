define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'text!templates/components/delay.html'

], function($, _, Backbone, Base, template){
  var Delay = Base.extend({

    controls:  {},

    initialize: function() {
      this.events = _.extend(this.events, this.baseEvents);
      var delay   = this.options.soundCtx.createDelay();
      delay.delayTime.value = 0;

      var volume = this.options.soundCtx.createGain();
      volume.gain.value = 1;
      delay.connect( volume );

      this.controls.input   = delay;
      this.controls.output  = volume;
    },

    render: function() {
      var data = {_: _ };
      var compiledTemplate = _.template( template, data );
      this.$el.html(compiledTemplate);
      return this;
    },

    events: {
        "change .delayTime":    "updateDelay",
        "change .delayVolume":  "updateVolume",
    },

    updateDelay: function( e ) {
      var val = e.currentTarget.value / 100;
      this.controls.input.delayTime.value = val;
    },

    updateVolume: function( e ) {
      var val = e.currentTarget.value / 100;
      this.controls.output.gain.value = val;
    }

  });
  return Delay;
});