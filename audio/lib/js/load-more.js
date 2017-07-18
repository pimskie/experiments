/** 
 * Experiment met Web Audio
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 * 
 * Loader gejat van:
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 **/
(function($) {

    // check if Web Audio is available
    var context;
    if (typeof AudioContext !== "undefined") {
        context = new AudioContext();
    } else if (typeof webkitAudioContext !== "undefined") {
        context = new webkitAudioContext();
    } else {
        throw new Error('AudioContext not supported. :(');
    }

    // sound vars
    var sound1 = null,
        sound2 = null;

    var bufferLoader = new BufferLoader(context, [
            '../lib/sound/nirvana.mp3',
            '../lib/sound/ring_of_fire.mp3',
        ], doneLoading
    );

    bufferLoader.load();

    function doneLoading( bufferList ) {
        sound1 = context.createBufferSource();       
        sound2 = context.createBufferSource();       

        sound1.buffer = bufferList[0];
        sound2.buffer = bufferList[1];

        sound1.connect( context.destination );
        sound2.connect( context.destination );

        sound2.noteOn( 0 );
    }

    function toggleSound(stop) {
        if (stop) {
            source.noteOff(0);
            console.log('pause');
        } else {
            source.noteOn(1000);
            console.log('resume');
        }
    }

    function initControls() {
        var me = this;
    	$('#volume').change(function() {
	    	volumeGain.gain.value = $(this).val();    
	    });
        $('#toggle').click(function(e){
            e.preventDefault();
            if ($(this).hasClass('stop')) {
                $(this).removeClass('stop');
            } else {
                $(this).addClass('stop');
            }

            toggleSound($(this).hasClass('stop'));
        });
    }
})(jQuery);