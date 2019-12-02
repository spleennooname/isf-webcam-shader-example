console.clear()

import { of } from "rxjs";
import { map } from "rxjs/operators";

import "./style.scss";
import isf2 from "./flood";

let then = window.performance.now();
let now = 0;
let delta = 0;
let time = 0;
const fpsMs = 60 / 1000;

const glContext = {
  antialias: true,
  powerPreference: "high-performance"
};

const ISFRenderer = require("interactive-shader-format").Renderer;
const canvas = document.querySelector("#canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl", glContext);

const renderer = new ISFRenderer(gl);
renderer.loadSource(isf2);

const animate = () => {
  requestAnimationFrame(animate);
  now = window.performance.now();
  delta = now - then;
  if (delta > fpsMs) {
    then = now - (delta % fpsMs);
    renderer.setValue('inputImage', video)
    renderer.setValue('TIME', time)
    renderer.draw(canvas);
    time += 0.01;
  }
};

const resize = e => {
  var width = gl.canvas.clientWidth;
  var height = gl.canvas.clientHeight;
  if (gl.canvas.width !== width || gl.canvas.height !== height) {
    gl.canvas.width = width;
    gl.canvas.height = height;
    renderer.draw(canvas);
  }
};

then = window.performance.now();
window.addEventListener("resize", resize);
animate();

// webcam


const constraints = {
  audio: false,
  video: true/*  {
    width: {
      min: 640,
      max: 1920
    },
    height: {
      min: 480,
      max: 1080
    },
    frameRate: {
      ideal: 50,
      max: 60
    }
  } */
}

async function init (e) {
  try {
    console.log('init')
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    success(stream)
    e.target.disabled = true
  } catch (e) {
    error(e)
  }
}

const error = e =>{
  console.error(e)
}

const success = stream =>{
  const video = document.querySelector('video')
  video.setAttribute('autoplay', '')
  video.setAttribute('muted', 'true')
  video.setAttribute('playsinline', '')
  const videoTracks = stream.getVideoTracks()
  console.log('Got stream with constraints:', constraints)
  console.log(`Using video device: ${videoTracks[0].label}`)
  const aspectRatio = videoTracks[0].getSettings().aspectRatio
  console.log( aspectRatio)
  window.stream = stream // make variable available to browser console
  if (video.mozSrcObject !== undefined) {
    // hack for Firefox < 19
    video.mozSrcObject = stream

  } else {
    if (typeof video.srcObject === 'object') {
      video.srcObject = stream
    } else {
      window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL
      video.src = (window.URL && window.URL.createObjectURL(stream))
    }
  }
  
}

document.querySelector('#video').addEventListener('click', e => init(e))

// rx
const source = of("World").pipe(map(x => `Hello ${x}!`));
source.subscribe(x => console.log(x));
