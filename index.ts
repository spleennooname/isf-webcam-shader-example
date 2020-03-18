
import "./style.scss";

import { gsap } from "gsap";
import { Renderer } from "interactive-shader-format";
import { isfFragment, isfVertex } from "./isf/guilloche-ray";

// webcam constrains object
const constraints = {
  audio: false,
  video: {
    width: { min: 640 },
    height: { min: 480 }
  }
};

// webcam
let then = window.performance.now();
let now = 0;
let delta = 0;
let time = 0;
let fps = 60;

let aspectRatio = 1.333;
const fpsMs = fps / 1000;

const pixelRatio = window.devicePixelRatio || 1;

// dom objects of relevance
const video: HTMLVideoElement = document.querySelector("#video");
const canvas: HTMLCanvasElement = document.querySelector("#canvas");
const cover: HTMLElement = document.querySelector("#cover");
// init webgl context
const gl = canvas.getContext("webgl", {
  powerPreference: "default",
  preserveDrawingBuffer: true,
  desynchronized: true,
  antialias: true
});
// init ISF renderer
const renderer = new Renderer(gl);
try {
  renderer.loadSource(isfFragment, isfVertex);
} catch (err) {
  console.error("isf:", err.toString());
}

const resize = () => {
  // https://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html as source of truth
  // w/h according pixel ratio and canvas size
  const height = Math.round(gl.canvas.clientHeight * pixelRatio);
  const width = Math.round(gl.canvas.clientWidth * pixelRatio);
  const h = Math.round(window.innerHeight);
  const w = Math.round(window.innerWidth);
  // resize only if necessary
  const needsResize = gl.canvas.width !== width || gl.canvas.height !== height;
  if (needsResize) {
    if (w < h) { // porrait
      gl.canvas.width = Math.round(height / aspectRatio);
      gl.canvas.height = height;
    } else { // landscape
      gl.canvas.width = width;
      gl.canvas.height = Math.round(width / aspectRatio);
    }
  }
  renderer.draw(canvas);
};

const animate = () => {
  window.requestAnimationFrame(animate);
  // if the video's not ready, skip it
  if (video && video.readyState !== 4) return;
  now = window.performance.now();
  delta = now - then;
  if (delta > fpsMs) {
    then = now - (delta % fpsMs);
    resize();
    render({
      inputImage: video,
      TIME: time
    });
    time += 0.01;
  }
};

const render = (renderObject = {}) => {
  for (const unif in renderObject) {
    renderer.setValue(unif, renderObject[unif]);
  }
  renderer.draw(canvas);
};

async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // init video stuff
    success(stream);
    // start effect here
    then = window.performance.now();
    animate();
  } catch (e) {
    error(e);
  }
}

const error = e => {
  console.error(e);
};

const success = stream => {
  // check iOS device
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  // set video 
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "");
  const videoTracks = stream.getVideoTracks();
  const videoSettings = videoTracks[0].getSettings();
  const videoTracks = stream.getVideoTracks();
  const videoSettings = videoTracks[0].getSettings();
  // ccompute aspect ratio (ios swap height/width)
  aspectRatio = ios
    ? videoSettings.height / videoSettings.width
    : videoSettings.width / videoSettings.height;
  // bind video stream
  window.stream = stream;
  if (video.mozSrcObject !== undefined) {
    video.mozSrcObject = stream;
  } else {
    if (typeof video.srcObject === "object") {
      video.srcObject = stream;
    } else {
      window.URL =
        window.URL || window.webkitURL || window.mozURL || window.msURL;
      video.src = window.URL && window.URL.createObjectURL(stream);
    }
  }
  // 1st canvas resize, according video settings and aspect ratio
  resize()
};

// start
cover.addEventListener("click", e => {
  gsap.to(cover, 0.85, {
    autoAlpha: 0,
    onComplete: () => init()
  });
});
