#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// https://thebookofshaders.com/05/kynd.png
// http://www.iquilezles.org/www/articles/functions/functions.htm
float impulse(float k, float x) {
	float h =  k * x;

	return h * exp(1.0 - h);
}

void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 mouse = u_mouse.xy / u_resolution.xy;

	 // Step will return 0.0 unless the value is over 0.5,
	// in that case it will return 1.0
	// float x = step(0.5, st.x);
	float y = st.x;
	float imp = impulse(0.2, st.x);

	vec3 color = vec3(y, y, imp * abs(sin(u_time)));

	gl_FragColor = vec4(color, 1.0);

	// gl_FragColor = vec4(
	// 	st.x * (abs(sin(u_time * 0.1))),
	// 	st.y * (abs(cos(u_time * 0.1))),
	// 	mouse.x,
	// 	1.0
	// );
}
