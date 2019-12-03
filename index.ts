console.clear();

import { gsap } from "gsap";

import { of } from "rxjs";
import { map } from "rxjs/operators";

import "./style.scss";

import { Renderer } from "interactive-shader-format";
import fsISF from "./glitch-flood";

// webcam
let aspectRatio = 1.333;
const constraints = {
  audio: false,
  video: true /*  {
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
};

const resize = () => {
  var width = gl.canvas.clientWidth;
  var height = gl.canvas.clientHeight;
  if (gl.canvas.width !== width || gl.canvas.height !== height) {
    canvas.style.width =
      aspectRatio > 1
        ? aspectRatio * 100 + "vh"
        : aspectRatio * window.innerHeight + "px";
    gl.canvas.width = width;
    gl.canvas.height = height;
    renderer.draw(canvas);
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  now = window.performance.now();
  delta = now - then;
  if (delta > fpsMs) {
    then = now - (delta % fpsMs);
    resize();
    renderer.setValue("inputImage", video);
    renderer.setValue("TIME", time);
    renderer.draw(canvas);
    time += 0.01;
  }
};

async function init(e) {
  try {
    console.log("init");
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    success(stream);
    e.target.disabled = true;
  } catch (e) {
    error(e);
  }
}

const error = e => {
  console.error(e);
};

const success = stream => {
  const video = document.querySelector("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "true");
  video.setAttribute("playsinline", "");
  const videoTracks = stream.getVideoTracks();
  const videoSettings = videoTracks[0].getSettings();
  const aspectRatio = videoSettings.width / videoSettings.height;

  /*   video.style.width =
      aspectRatio > 1 ? (aspectRatio * 100 )+ "vh" : (aspectRatio * window.innerHeight )+ "px"; */

  document.querySelector("#status").innerHTML =
    videoSettings.width + " " + videoSettings.height + " " + aspectRatio;

  console.log(
    "Got stream with constraints:",
    videoTracks[0].label,
    videoTracks[0].getSettings(),
    aspectRatio
  );
  window.stream = stream; // make variable available to browser console
  if (video.mozSrcObject !== undefined) {
    // hack for Firefox < 19
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
document.querySelector("#cover").addEventListener("click", e => {
  gsap.to("#cover", 0.35, {
    autoAlpha: 0,
    onComplete: () => {
      init(e);
    }
  });
});

let then = window.performance.now();
let now = 0;
let delta = 0;
let time = 0;
const fpsMs = 60 / 1000;

const glContext = {
  antialias: true,
  powerPreference: "high-performance"
};

const canvas: HTMLCanvasElement = document.querySelector("#canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl", glContext);

const renderer = new Renderer(gl);
renderer.loadSource(fsISF);

then = window.performance.now();
canvas.style.width =
  aspectRatio > 1
    ? aspectRatio * 100 + "vh"
    : aspectRatio * window.innerHeight + "px";
gl.canvas.width = (gl.canvas as HTMLCanvasElement).clientWidth;
gl.canvas.height = (gl.canvas as HTMLCanvasElement).clientHeight
renderer.draw(canvas);
animate();

// rx
/* const source = of("World").pipe(map(x => `Hello ${x}!`));
source.subscribe(x => console.log(x)); */
