export const isfFragment = `
/*
{
  "CREDIT":"by vivacchio",
  "DESCRIPTION":"",
  "INPUTS":[
    {
      "NAME":"inputImage",
      "TYPE":"image"
    },
    {
      "LABEL":"uSpacing",
      "NAME":"uSpacing",
      "TYPE":"float",
      "DEFAULT":0.01,
      "MIN":0,
      "MAX":0.02
    },
    {
      "LABEL":"uFrequency",
      "NAME":"uFrequency",
      "TYPE":"float",
      "DEFAULT":30,
      "MIN":0,
      "MAX":100
    },
    {
      "LABEL":"uHeight",
      "NAME":"uHeight",
      "TYPE":"float",
      "DEFAULT":0.003,
      "MIN":0,
      "MAX":0.015
    },
    {
      "LABEL":"uWidth",
      "NAME":"uWidth",
      "TYPE":"float",
      "DEFAULT":0.015,
      "MIN":0.01,
      "MAX":0.02
    },
    {
      "LABEL":"uAlias",
      "NAME":"uAlias",
      "TYPE":"float",
      "DEFAULT":0.003,
      "MIN":0.001,
      "MAX":0.010
    },
    {
      "LABEL":"uBright",
      "NAME":"uBright",
      "TYPE":"float",
      "DEFAULT":1.8,
      "MIN":1,
      "MAX":2.5
    },
    {
      "LABEL":"uDist",
      "NAME":"uDist",
      "TYPE":"float",
      "DEFAULT":0.2,
      "MIN":0.1,
      "MAX":0.25
    }
  ],
  "ISFVSN": "2",
  "PASSES": [
    {
      "PERSISTENT": true,
      "TARGET": "bufferA",
      "WIDTH": "$WIDTH/1.25",
	  	"HEIGHT": "$HEIGHT/1.25"
    },
    {
        	
    }
  ]
}
*/

#define R RENDERSIZE
#define t TIME

#define PI 3.14159265359
#define uLevels 6.0

const float levels = 6.0;
const float angle = PI/levels;
const float spacing = 0.01;
const float frequency = 30.0;
const float height = 0.003;
const float width = 0.02;
const float alias = 0.002;
const float bright = 1.8;
const float dist = 0.2;

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float luma(vec4 color) {
  return dot(color.rgb, vec3(0.299, 0.587, 0.114));
}

void main() {
  float result = 0.0;
  vec2 uv = gl_FragCoord.xy/R.xy;
  float tex = luma( IMG_NORM_PIXEL(inputImage, uv) );

  if (PASSINDEX == 0)	{
    // diagonal waves
    for (float i = 0.0; i<levels; i+=1.0) {
      // new uv coordinate
      vec2 nuv = rotate2d(angle + angle*i) * uv;
      // calculate wave
      float fq = (frequency/ 2.0) * (1.0 + sin(t *0.7) );
      float wave = sin(nuv.x * fq) * height;
      float x = (spacing/2.0) + wave;
      float y = mod(nuv.y, spacing);
      // wave lines
      float line = width * (1.0 - (tex*bright) - (i*dist) );
      float waves = smoothstep(line, line+alias, abs(x-y) );
      // save the result for the next wave
      result += waves;
    }
    result /= levels;
    result = smoothstep(1.0, 0.0, result);
    gl_FragColor= vec4(vec3(result), 1.0);
  }
}
`;

export const isfVertex = `
  void main(){
    isf_vertShaderInit();
  }
`;
