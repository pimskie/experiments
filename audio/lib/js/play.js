/**
 * Experiment met Web Audio
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 * http://creativejs.com/resources/web-audio-api-getting-started/
 **/
(function($) {

    var context;
    var source;

    // check if Web Audio is available
    try {
    	context  = new AudioContext();
    } catch (e) {
    	alert('Web Audio niet supported in deze browser');
    }

    // sound vars
    var soudBuffer 	= null;
    var source 		= context.createBufferSource();
    var url			= '../lib/sound/nirvana.mp3';
    var volumeGain  = context.createGain();

	// create request and load sound
    var request 	= new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
    	console.log('undecoded:');
    	console.log(request.response);

    	// asynchronously decoding
    	context.decodeAudioData(request.response, function(buffer){
    		soundBuffer = buffer;
    		console.log('encoded');
    		console.log(soundBuffer);

    		// loaded a audioBuffer? Ready to play!
    		initControls();
    		playSound( soundBuffer );

    	}, function(error) {
    		console.log('error: ');
    		console.log(error);
    	});
    }
    request.send();

    // play sound from buffer
    function playSound( soundBuffer ) {
    	// wiring
    	source.buffer = soundBuffer;
    	source.connect( volumeGain );
        volumeGain.connect( context.destination );

    	// play the fucker
    	source.start(0);

    }

    function toggleSound(stop) {
        if (stop) {
            source.stop(0);
            console.log('pause');
        } else {
            source.start(1000);
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