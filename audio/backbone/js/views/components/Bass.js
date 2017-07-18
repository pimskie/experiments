define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'text!templates/components/bass.html'

], function($, _, Backbone, Base, template){
  var Bass = Base.extend({

    controls:     {},
    volume:       null,

    initialize: function() {
      this.events = _.extend(this.events, this.baseEvents);

      var highpassFilter = this.options.soundCtx.createBiquadFilter( );
      highpassFilter.type = highpassFilter.HIGHPASS;
      highpassFilter.frequency.value = 90;

      var lowpassFilter = this.options.soundCtx.createBiquadFilter( );
      lowpassFilter.type = lowpassFilter.LOWPASS;
      lowpassFilter.frequency.value = 40000;

      highpassFilter.connect( lowpassFilter );

      this.controls.input   = highpassFilter;
      this.controls.output  = lowpassFilter;
    },
    
    render: function() {
      var data = {_: _ };
      var compiledTemplate = _.template( template, data );
      this.$el.html(compiledTemplate);
      return this;
    },

    events: { 
        "change .highPass": "updateHighpass", 
        "change .lowPass":  "updateLowpass", 
    },

    updateHighpass: function( e ) {
      var val = e.currentTarget.value;
      this.controls.input.frequency.value = val;
    },

    updateLowpass: function( e ) {
      var val = e.currentTarget.value;
      this.controls.output.frequency.value = val;
    }

  });
  return Bass;
});