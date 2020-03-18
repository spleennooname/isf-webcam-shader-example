console.clear();
import "./style.scss";
import { gsap } from "gsap";

import { Renderer } from "interactive-shader-format";
import { isfFragment, isfVertex } from "./isf/guilloche-ray";

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

const video: HTMLVideoElement = document.querySelector("#video");
const canvas: HTMLCanvasElement = document.querySelector("#canvas");
const cover: HTMLElement = document.querySelector("#cover");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl", {
  powerPreference: "default",
  preserveDrawingBuffer: true,
  desynchronized: true,
  antialias: true
});

const renderer = new Renderer(gl);
try {
  renderer.loadSource(isfFragment, isfVertex);
} catch (err) {
  console.error("isf:", err.toString());
}

const resize = () => {
  const height = Math.round(gl.canvas.clientHeight * pixelRatio);
  const width = Math.round(gl.canvas.clientWidth * pixelRatio);
  const h = Math.round(window.innerHeight);
  const w = Math.round(window.innerWidth);
  if (canvas.width !== width || canvas.height !== height) {
    if (w < h) {
      gl.canvas.width = Math.round(height / aspectRatio);
      gl.canvas.height = height;
    } else {
      gl.canvas.width = width;
      gl.canvas.height = Math.round(width / aspectRatio);
    }
  }
};

const animate = () => {
  window.requestAnimationFrame(animate);
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
    success(stream);
    then = window.performance.now();
    requestAnimationFrame(animate);
  } catch (e) {
    error(e);
  }
}

const error = e => {
  console.error(e);
};

const success = stream => {
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "");
  const videoTracks = stream.getVideoTracks();
  const videoSettings = videoTracks[0].getSettings();
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const videoTracks = stream.getVideoTracks();
  const videoSettings = videoTracks[0].getSettings();
  // 1st canvas resize, according video size
  gl.canvas.width = videoSettings.width;
  gl.canvas.height = videoSettings.height;
  // compute aspectRatio
  aspectRatio = ios
    ? videoSettings.height / videoSettings.width
    : videoSettings.width / videoSettings.height;

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
};

// start
cover.addEventListener("click", e => {
  gsap.to("#cover", 1.0, {
    autoAlpha: 0,
    onComplete: () => {
      
    }
  });
  init();
});

// rx
/* const source = of("World").pipe(map(x => `Hello ${x}!`));
source.subscribe(x => console.log(x)); */
