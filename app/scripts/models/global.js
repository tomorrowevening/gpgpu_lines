var THREE = require('THREE');
require('apollo-utils/ThreeUtil')(THREE);
import { getID } from 'apollo-utils/DOMUtil';

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

export const MAX_SIZE = 512;
export const TEX_SIZE = 64;
export const FORMAT   = THREE.RGBAFormat;
export let debug = {
  time: 1,
  friction: 0.1,
  constrain: false,
  wrap: false,
  randomWrap: true,
  color: [255, 255, 255],
  alpha: 1,
  roomColor: [51, 51, 51],
  mouseColor: [153, 153, 153],
  bounds: new THREE.Vector3(MAX_SIZE, MAX_SIZE/2, MAX_SIZE),
  force: new THREE.Vector3(0, 10, 0), // natural force
  mouse: new THREE.Vector3(0, -MAX_SIZE/3, 0),
  mouseRadius: 100,
  mouseStrength: 1,
  mouseOpacity: 1
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
