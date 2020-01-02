console.clear();
import "./style.scss";
import { gsap } from "gsap";

import { Renderer } from "interactive-shader-format";
import { isfFragment, isfVertex } from "./isf/guilloche";

const guilloche = {
  uHeight: 0.003,
  uSpacing: 0.01,
  uFrequency: 30,
  uDist: 0.14,
  uAlias: 0.03,
  uBright: 1.2,
  uWidth: 0.015
}

/**
 * const float levels = 10.0;
const float angle = PI/levels;
const float spacing = 0.01;
const float frequency = 30.0;
const float height = 0.003;
const float width = 0.015;
const float alias = 0.002;
const float bright = 1.2;
const float dist = 0.2;
 */

const constraints = {
  audio: false,
  video: {
    width: { min: 640 },
    height: { min: 480 }
  }
};
// webcam

let aspectRatio = 1.333;
let then = window.performance.now();
let now = 0;
let delta = 0;
let time = 0;
let fps = 60;
let aspectRatio = 1.333;
const fpsMs = fps / 1000;

const video: HTMLVideoElement = document.querySelector("#video");
const image: HTMLImageElement = document.querySelector("#image");

const canvas: HTMLCanvasElement = document.querySelector("#canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl", {
  antialias: true,
  powerPreference: "high-performance"
});
const renderer = new Renderer(gl);
renderer.loadSource(isfFragment, isfVertex);

const resize = () => {
  const realToCSSPixels = window.devicePixelRatio;
  const width = Math.floor(canvas.clientWidth * realToCSSPixels);
  const height = Math.floor(canvas.clientHeight * realToCSSPixels);
  canvas.style.width = 100 * aspectRatio + "vh";
  canvas.style.height = "100vh";
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    renderer.draw(canvas);
  }
};

const animate = () => {
  window.requestAnimationFrame(animate);
  if (video && video.readyState !== 4) return;
  now = window.performance.now();
  delta = now - then;
  if (delta > fpsMs) {
    then = now - (delta % fpsMs);
    render({
      inputImage: video,
      ...guilloche,
      TIME: time
    });
    resize();
    time += 0.01;
  }
};

const render = (renderObject = {}) => {
  for (const unif in renderObject) {
    renderer.setValue(unif, renderObject[unif]);
  }
  renderer.draw(canvas);
};

async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    success(stream);
    e.target.disabled = true;
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
  aspectRatio = videoSettings.width / videoSettings.height;
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
  resize();
};

// start
document.querySelector("#cover").addEventListener("click", e => {
  gsap.to("#cover", 0.35, {
    autoAlpha: 0,
    onComplete: () => {
      init(e);
    }
  });
});

// rx
/* const source = of("World").pipe(map(x => `Hello ${x}!`));
source.subscribe(x => console.log(x)); */
