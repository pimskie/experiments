* power down lets the disc slowly comes to stop

* Changes in how the progress is measured in deck

* Adding power button

* Set total rotations based on FPS and duration
* Motor and disc rotating on same speed

* added arm

* added track selection

* removed throttling on scratching

 * - rotation of deck determines the progress of the track
 * instead of playback speed determines rotation of deck
 *
 * - added mute button (CTRL)
 *
 * - code linting (partialy)
 *
 * - converted al MS properties to S
 *
 * - creating and glueing samples in reverse playback
 *
 * - creating short samples from track on progress in forward playback
 *
 * - implemented sample creating: slicing complete track in parts - 118 (4b263e50f8be) - SC stuff - sounds ok
 * - minor styling
 *
 * - added falsePositive check on scratching: when moving the mouse forwards, a slight decrease
 * ment it turned around again wich now is a falsePositive.
 * When playback speed is > 1, and the next 5 are < 1, the track is reversed
 *
 * - connect draggable disc to track playback speed - 111 (03481fac7f64) sounds ok
 * - first scratching effect
 *
 * - draggable disc revised
 *
 * - startup / stop ramping speed
 *
 * - implemented seekable wave form
 *
 * - added wave form
 *
 * - rotate deck on progress of track instead of playback speed
 *
 * - adding spinning deck with pause / play functionality
 *
 * - creating draggable disc
 *
 * - implement high precision timer (raf)
 *
 * - adding touch pad for variable playback speed
 * - mimicing the scratch effect
 *
 * - playing in reverse with variable playback speed
 *
 * - playing track in reverse
 *
 * - variable playback speed
 * - pause / play controls