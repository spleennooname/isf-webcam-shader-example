console.clear();
import "./style.scss";
import { gsap } from "gsap";
/* import { of } from "rxjs";
import { map } from "rxjs/operators";
 */
import { Renderer } from "interactive-shader-format";
import { isfFragment, isfVertex } from './isf/city-lights'
// webcam

let aspectRatio = 1.333;
const constraints = {
  audio: false,
  video: true 
};
let then = window.performance.now();
let now = 0;
let delta = 0;
let time = 0;
let fps = 60;
const fpsMs = fps / 1000;

const video: HTMLVideoElement = document.querySelector("#video");
const image: HTMLImageElement = document.querySelector("#image");
const canvas: HTMLCanvasElement = document.querySelector("#canvas");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext("webgl",  {
  antialias: true,
  powerPreference: "high-performance"
});
const renderer = new Renderer(gl);
renderer.loadSource(isfFragment, isfVertex)


const resize = () => {
  var realToCSSPixels = window.devicePixelRatio;
  // Lookup the size the browser is displaying the canvas in CSS pixels
  // and compute a size needed to make our drawingbuffer match it in
  // device pixels.
  var width = Math.floor(canvas.clientWidth * realToCSSPixels);
  var height = Math.floor(canvas.clientHeight * realToCSSPixels);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    renderer.draw(canvas);
  }
};

const animate = () => {
  requestAnimationFrame(animate);
  now = window.performance.now();
  delta = now - then;
  if (delta > fpsMs) {
    if (video && video.readyState !== 4) return
    then = now - (delta % fpsMs);
    render({
      inputImage: video,
      intensity: 0.5,
      TIME: time
    })
    resize();
    time += 0.01;
  }
};

const render = (renderObject = {}) => {
  for (var unif in renderObject) {
    renderer.setValue(unif, renderObject[unif])
  }
  renderer.draw(canvas)
}

async function init(e) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    success(stream);
    e.target.disabled = true;
    then = window.performance.now();
    requestAnimationFrame(animate)
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
  const aspectRatio = videoSettings.width / videoSettings.height;

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
  // resize css display canvas
  if (aspectRatio > 1) { // w >h
    canvas.style.width = '100vw';
    canvas.style.height = (100/aspectRatio) + 'vw'
  }
  else {
    canvas.style.width = aspectRatio * 100 + 'vh';
    canvas.style.height = '100vh'
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

// rx
/* const source = of("World").pipe(map(x => `Hello ${x}!`));
source.subscribe(x => console.log(x)); */
