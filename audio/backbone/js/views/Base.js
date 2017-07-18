define([
  'jquery',
  'underscore',
  'backbone',
  'connectionManager',
  // Pull in the Collection module from above,
  //'models/project/ProjectModel',
  //'collections/projects/ProjectsCollection'

], function($, _, Backbone, connectionManager){
	var Base = Backbone.View.extend({
    
    connectedViewIn:  null,
    connectedViewOut: null,

    setControl: function( c ) {
      this.control = c;
    },
    
    render: function() {},

    baseEvents: {
      "click .input":   "toggleConnect", 
      "click .output":  "toggleConnect", 
      "click .close":   "removeView", 
    },

    toggleConnect: function( e ) {
        var direction = $(e.currentTarget).hasClass('input') ? 'input' : 'output';

        if ( $(e.currentTarget).hasClass('connected')) {
          // disconnect
          connectionManager.disconnect( this, direction );
        } else {
          // connect
          $(e.currentTarget).toggleClass('active');
          connectionManager.connect( this, direction );
        }
    },

    removeView: function() {
      connectionManager.disconnect( this );
      this.remove();
      this.unbind();
    },

  });
  return Base;
});