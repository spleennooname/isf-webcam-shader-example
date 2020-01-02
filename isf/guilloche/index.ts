export const isfFragment = `
/*
{
  "CREDIT":"by vivacchio",
  "DESCRIPTION":"",
  "CATEGORIES":[
    "styles"
  ],
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
      "DEFAULT":0.75,
      "MIN":0.5,
      "MAX":1.25
    },
    {
      "LABEL":"uDist",
      "NAME":"uDist",
      "TYPE":"float",
      "DEFAULT":0.2,
      "MIN":0.1,
      "MAX":0.25
    }
  ]
}
*/

#define R RENDERSIZE

#define PI 3.14159265359
#define uLevels 6.0

#define luma(color) dot(color, vec3(0.299, 0.587, 0.114))

const float levels = 10.0;
const float angle = PI/levels;
const float spacing = 0.01;
const float frequency = 30.0;
const float height = 0.003;
const float width = 0.015;
const float alias = 0.002;
const float bright = 1.2;
const float dist = 0.2;

mat2 rotate2d(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

void main() {
  float result = 0.0;
  // normalized pixel coordinates (from 0 to 1)
  vec2 uv = gl_FragCoord.xy/R.xy;
  // input texture from channel 0
  vec4 tex = IMG_NORM_PIXEL(inputImage,uv);
  float t = float(tex);
  // diagonal waves
  for (float i = 0.0; i<levels; i+=1.0) {
    // new uv coordinate
    vec2 nuv = rotate2d(angle + angle*i) * uv;
    // calculate wave
    float wave = sin(nuv.x * uFrequency) * uHeight;
    float x = (uSpacing/2.0) + wave;
    float y = mod(nuv.y, uSpacing);
    // wave lines
    float line = uWidth * (1.0 - (t*uBright) - (i*uDist) );
    float waves = smoothstep(line, line+uAlias, abs(x-y) );
    // save the result for the next wave
    result += waves;
  }
  result /= levels;
  // increase contrast
  // result = smoothstep(0.6, 1.0, result);
  gl_FragColor= vec4(vec3(result), 1.0);
}
`

export const isfVertex = `
  void main(){
    isf_vertShaderInit();
  }
`
