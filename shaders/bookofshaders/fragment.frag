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

// dunno what this does
// https://thebookofshaders.com/05/
// https://thebookofshaders.com/glossary/?search=smoothstep
float plot(vec2 st, float pct) {
  return  smoothstep(pct - 0.02, pct, st.y) -
		  smoothstep(pct, pct + 0.02, st.y);
}


void main() {
	vec2 st = gl_FragCoord.xy / u_resolution.xy;

	// Smooth interpolation between 0.1 and 0.9
	float y = smoothstep(0.3, 0.6, st.x);

	// https://thebookofshaders.com/05/kynd.png
	y = 1.0 - (pow(abs(st.x), 0.5) );


	vec3 color = vec3(y);

	float pct = plot(st,y);
	color = (1.0-pct)*color+pct*vec3(0.0, 1.0, 0.0);

	gl_FragColor = vec4(color, 1);

	/*
	// gradient on mouse
	vec2 st = gl_FragCoord.xy / u_resolution.xy;
	vec2 mouse = u_mouse.xy / u_resolution.xy;

	float y = st.x;
	float imp = impulse(0.2, st.x);

	vec3 color = vec3(y, y, imp * abs(sin(u_time)));

	gl_FragColor = vec4(color, 1.0);
	*/
}
