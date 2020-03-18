export const isfFragment = `
/*
{
    "CATEGORIES": [
        "gradient",
        "heat"
    ],
    "DESCRIPTION": "Simulating Predator Thermal Vision",
    "INPUTS": [
    	{
            "NAME": "inputImage",
            "TYPE": "image"
        }
    ],
    "ISFVSN": "2",
    "PASSES": [
        {
            "PERSISTENT": true,
            "TARGET": "buffer",
            "WIDTH": "$WIDTH/1.0",
	        "HEIGHT": "$HEIGHT/1.0"
        },
        {
        }
    ]
}

*/

// useful defines for concise code
#define R RENDERSIZE
#define DELTA TIMEDELTA

vec3 heat(float v) {
    float value = 1.0 - v;
    vec3 rgb = vec3(
      smoothstep(0.5, 0.25, value),
      value < 0.25 ? smoothstep(0.0, 0.25, value) : smoothstep(1.0, 0.5, value),
    	smoothstep(0.25, 0.5, value)
	);
	float factor = 0.5 + 0.5 * smoothstep(0.0, 0.1, value);
    return factor * rgb;
}


void main() {
	// normalize uv coords
	vec2 uv = gl_FragCoord.xy / R.xy;
  // original color rgba
  vec4 imageColor = IMG_NORM_PIXEL(inputImage, uv);
    
  if (PASSINDEX == 0)	{
    	float sum = DELTA + smoothstep( imageColor.g, 0.0, distance(imageColor.rg, uv) );
    	vec4 heatColor = vec4( heat(sum), 1.0 );
      
    	gl_FragColor =  mix(heatColor, imageColor, DELTA);
      
  }
  else if (PASSINDEX == 1)	{
    gl_FragColor = IMG_NORM_PIXEL(buffer, uv);
  }  
}
`;

export const isfVertex = `
  void main(){
    isf_vertShaderInit();
  }
`;
