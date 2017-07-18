define([
  'jquery',
  'underscore',
  'backbone',
  'views/base',
  'text!templates/components/sound.html'

], function($, _, Backbone, Base, template){
  var Sound = Base.extend({
    className: 'component sound',
    controls: {},

    initialize: function() {
      this.controls = {
        input: this.options.soundSource,
        output: this.options.soundSource,
      };
      this.events = _.extend(this.baseEvents, this.events);
    },

    events: { },
    
    render: function() {
      var data = {_: _ };
      var compiledTemplate = _.template( template, data );
      this.$el.html(compiledTemplate);
      return this;
    },

  });

  return Sound;
});