var THREE = require('THREE');
require('apollo-utils/ThreeUtil')(THREE);
import { getID } from 'apollo-utils/DOMUtil';

// 0 = low, 1 = medium, 2 = high
let quality = 0;
if(window.location.hash === '#high') quality = 2;
else if(window.location.hash === '#medium') quality = 1;

export const BG_COLOR = 0x0F0C1A;

export const canvas = getID('world');

export const assets = {
  json: [
  ],
  audio: [
  ],
  images: [
    'images/env.jpg'
  ],
  video: [
  ]
};

let textureSize = 0;
switch(quality) {
  case 0:
    textureSize = 32;
  break;
  case 1:
    textureSize = 64;
  break;
  case 2:
    textureSize = 128;
  break;
}

export const MAX_SIZE = 512;
export const TEX_SIZE = textureSize;
export const FORMAT   = THREE.RGBAFormat;
export const settings = {
  names: [
    'blackhole',
    'wormhole'
  ],
  blackhole: function() {
    debug.mouseRadius = 250;
    debug.mouseStrength = -15;
    debug.mouseOpacity = 0.2;
    debug.mouse.set(0, 0, 0);
  },
  wormhole: function() {
    debug.mouseRadius = 150;
    debug.mouseStrength = -1;
    debug.mouseOpacity = 0.25;
    debug.mouse.set(0, 0, 0);
    debug.force.y = 20;
    debug.wrap = true;
    debug.constrain = false;
  }
};
export let debug = {
  time: 1,
  friction: 0.1,
  constrain: false,
  wrap: false,
  randomWrap: true,
  colorA: [255, 255, 255],
  colorB: [255, 255, 255],
  alphaA: 1,
  alphaB: 0,
  roomColor: [51, 51, 51],
  mouseColor: [153, 153, 153],
  bounds: new THREE.Vector3(MAX_SIZE, MAX_SIZE/2, MAX_SIZE),
  force: new THREE.Vector3(0, 10, 0), // natural force
  mouse: new THREE.Vector3(0, -MAX_SIZE/3, 0),
  mouseRadius: 100,
  mouseStrength: 1,
  mouseOpacity: 1,
  setting: '',
  
  quality_high: function() {
    window.location.hash = '#high';
    window.location.reload();
  },
  
  quality_medium: function() {
    window.location.hash = '#medium';
    window.location.reload();
  },
  
  quality_low: function() {
    window.location.hash = '';
    window.location.reload();
  },
  
  updateSetting: function(setting) {
    if(settings[setting] !== undefined) settings[setting]();
  }
};

export const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  // antialias: true,
  stencil: false,
  depth: true,
  alpha: false,
  preserveDrawingBuffer: false
});
renderer.autoClear = false;
renderer.sortObjects = false;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;
// renderer.shadowMap.enabled = false;
renderer.setClearColor( BG_COLOR );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize(window.innerWidth, window.innerHeight);
