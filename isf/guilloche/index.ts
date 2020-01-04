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

#define NUM_SAMPLES 8.0

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

const float uDensity = 0.7;
const float uWeight = 0.6;
const float uDecay = 0.75;
vec4 light(vec2 uv, vec2 pos, float t) {
 
    vec2 tc = uv.xy;
    
    vec2 deltaUv = tc - pos.xy;
    deltaUv *= (1.0 / NUM_SAMPLES * uDensity);
    
    float illuminationDecay = 1.0;

    vec4 color = IMG_NORM_PIXEL(bufferA, tc.xy);
	
    tc += deltaUv * fract( sin( dot(uv.xy + fract(t), vec2(12.9898, 78.233)))* 43758.5453 );
    for (float i = 0.0; i < NUM_SAMPLES; i+=1.0)
	{
        tc -= deltaUv;
        vec4 sampleTex = IMG_NORM_PIXEL(bufferA, tc.xy);

        sampleTex *= illuminationDecay * uWeight;
        color += sampleTex;
        illuminationDecay *= uDecay;
    }
    
    return color * vec4(0.5);
}

vec4 rblur( vec2 uv, vec2 center, float falloffExp){
    // Translate our floating point space to the center of our blur.
    uv -= center;
    // Go ahead and precompute the inverse of the number of samples.
    // so we don't have any inner divisions.
    float invSamples = 1.0 / NUM_SAMPLES;
    
    // Place to accumulate the result.
    float result = 0.0;
    
    // Independent locations to store the results of each inner tap.
    // Why? So each tap doesn't need to write back before the next one
    // can start executing, preventing stalls. Works on x86 and piped
    // MIPS and I think it helps this out too (at least on my old thinkpad).
    float r0=0.0,r1=0.0,r2=0.0,r3=0.0;
    
    // We need to do each tap at a different index/position, so by storing
    // them in a vector we can make incrementation a single op instead of 4.
    vec4 indices = vec4(0,1,2,3);
    
	// Same thing with the scale.
    vec4 scale = vec4(0);
    
    // Go through and and sample the texture.
    for( float i = 0.0; i < NUM_SAMPLES; i+=4.0 ){
        scale = indices*invSamples;
        
        r0 = IMG_NORM_PIXEL(bufferA, (uv*scale.x + center)).g;
        r1 = IMG_NORM_PIXEL(bufferA, (uv*scale.y + center)).g;
        r2 = IMG_NORM_PIXEL(bufferA, (uv*scale.z + center)).g;
        r3 = IMG_NORM_PIXEL(bufferA, (uv*scale.w + center)).g;
        
        indices += 4.0;
        
        result += r0+r1+r2+r3;
    }
    
    float b = pow(result * invSamples, falloffExp);
    
    return vec4(b,b,b,1.);
}

void main() {
  
  vec2 uv = gl_FragCoord.xy/R.xy;

  if (PASSINDEX == 0)	{
    float result = 0.0;
    float tex = luma( IMG_NORM_PIXEL(inputImage, uv) );
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
  else if (PASSINDEX == 1){
     gl_FragColor = light( uv, vec2(0.5, 0.5), t);
  }
}
`;

export const isfVertex = `
  void main(){
    isf_vertShaderInit();
  }
`;
