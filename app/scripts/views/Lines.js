var THREE = require('THREE');
var glsl = require('glslify');
import Debug from 'apollo-utils/Debug';
import { lerp } from 'apollo-utils/MathUtil';
import { debug, renderer, MAX_SIZE, TEX_SIZE, FORMAT } from '../models/global';
import HUD from './HUD';

const iTex = TEX_SIZE - 1;

let fboVel, fboAcc, fboPos;
let velPass, accPass, posPass, renPass;
let tarPos, tarPrev, tarEmpty, tarPop;

export default class Lines extends THREE.LineSegments {
  constructor() {
    const FRAMES = 2;
    let i, b, n, total = TEX_SIZE * TEX_SIZE;
    let vertices = new Float32Array(total * 3 * FRAMES);
    for(i = 0; i < total; ++i) {
      b = i * FRAMES;
      n = b * 3;
      
      // Current
      vertices[n + 0] = (i % TEX_SIZE) / iTex;
      vertices[n + 1] = Math.floor(i / TEX_SIZE) / iTex;
      vertices[n + 2] = 0;
      
      // Previous
      vertices[n + 3] = vertices[n + 0];
      vertices[n + 4] = vertices[n + 1];
      vertices[n + 5] = 1;
    }
    
    let geom = new THREE.BufferGeometry();
    geom.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    super(geom, null);
    
    this.castShadow = true;
    this.receiveShadow = true;
    this.frustumCulled = false;
    this.name = 'lines';
  }
  
  setup() {
    this.setupData();
    this.setupShaders();
    this.setupFBOs();
    this.setupDebug();
  }
  
  setupData() {
    var channels = FORMAT === THREE.RGBFormat ? 3 : 4,
      len = TEX_SIZE * TEX_SIZE * channels,
      dataEmpty = new Float32Array(len),
      dataPosition = new Float32Array(len),
      dataPrev = new Float32Array(len),
      dataPop  = new Float32Array(len);
    let i, a, b, c, d, n = 0;
    for(i = 0; i < len; i += channels) {
      a = i+0;
      b = i+1;
      c = i+2;
      d = i+3;
      
      dataPosition[a] = lerp(Math.random(), -MAX_SIZE, MAX_SIZE);
      dataPosition[b] = lerp(Math.random(), -MAX_SIZE, MAX_SIZE);
      dataPosition[c] = lerp(Math.random(), -MAX_SIZE, MAX_SIZE);
      
      dataPrev[a] = dataPosition[a];
      dataPrev[b] = dataPosition[b];
      dataPrev[c] = dataPosition[c] + 10;
      
      dataPop[a] = lerp(Math.random(), -10, 10);
      dataPop[b] = lerp(Math.random(), 0.25, 1) * debug.bounds.y * -8.0;
      dataPop[c] = lerp(Math.random(), -10, 10);
      
      ++n;
    }
    
    tarPos    = THREE.getDataTexture(dataPosition, TEX_SIZE, TEX_SIZE, FORMAT);
    tarPrev   = THREE.getDataTexture(dataPrev, TEX_SIZE, TEX_SIZE, FORMAT);
    tarEmpty  = THREE.getDataTexture(dataEmpty, TEX_SIZE, TEX_SIZE, FORMAT);
    tarPop    = THREE.getDataTexture(dataPop, TEX_SIZE, TEX_SIZE, FORMAT);
  }
  
  setupShaders() {
    velPass = new THREE.ShaderMaterial({
      uniforms: {
        tAcc: { type:'t', value: tarEmpty },
        tVel: { type:'t', value: tarEmpty },
        tPos: { type:'t', value: tarPos },
        mouse: { type:'v3', value: debug.mouse },
        mouseRadius: { type:'f', value: debug.mouseRadius },
        mouseStrength: { type: 'f', value: debug.mouseStrength },
        time: { type: 'f', value: debug.time }
      },
      vertexShader: glsl('../glsl/default.vert'),
      fragmentShader: glsl('../glsl/velocity.frag')
    });
    
    accPass = new THREE.ShaderMaterial({
      uniforms: {
        tVel: { type:'t', value: tarEmpty },
        friction: { type: 'f', value: debug.friction },
        force: { type: 'v3', value: debug.force },
        time: { type:'f', value: debug.time }
      },
      vertexShader: glsl('../glsl/default.vert'),
      fragmentShader: glsl('../glsl/acceleration.frag')
    });
    
    posPass = new THREE.ShaderMaterial({
      uniforms: {
        tPos: { type:'t', value: tarPos },
        tVel: { type:'t', value: tarEmpty },
        bounds: { type:'v3', value: debug.bounds },
        constrain: { type:'f', value: 0 },
        wrap: { type:'f', value: 1.0 },
        time: { type:'f', value: debug.time }
      },
      vertexShader: glsl('../glsl/default.vert'),
      fragmentShader: glsl('../glsl/pos.frag')
    });
    
    renPass = new THREE.ShaderMaterial({
      uniforms: {
        tPos: { type:'t', value: tarPos },
        tPrev: { type: 't', value: tarPrev },
        bounds: { type:'v3', value: debug.bounds },
        colorA: { type: 'v4', value: new THREE.Vector4(debug.colorA[0]/255, debug.colorA[1]/255, debug.colorA[2]/255, debug.alphaA) },
        colorB: { type: 'v4', value: new THREE.Vector4(debug.colorB[0]/255, debug.colorB[1]/255, debug.colorB[2]/255, debug.alphaB) }
      },
      linewidth: 1,
      vertexShader: glsl('../glsl/lines.vert'),
      fragmentShader: glsl('../glsl/lines.frag'),
      transparent: true
    });
    renPass.linewidth = 2;
    
    this.material = renPass;
    
    this.customDepthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tPos : { type:'t', value: tarPos },
        tPrev: { type:'t', value: tarPrev },
        bounds: { type:'v3', value: debug.bounds }
      },
      vertexShader  : glsl('../glsl/lineDepth.vert'),
      fragmentShader: glsl('../glsl/lineDepth.frag'),
      depthTest: true,
      depthWrite: true
    });
  }
  
  setupFBOs() {
    fboVel = new THREE.FBO(velPass, TEX_SIZE, TEX_SIZE, FORMAT);
    fboAcc = new THREE.FBO(accPass, TEX_SIZE, TEX_SIZE, FORMAT);
    fboPos = new THREE.FBO(posPass, TEX_SIZE, TEX_SIZE, FORMAT);
  }
  
  setupDebug() {
    HUD.instance.showTexture(fboVel.texture, 'velocity', TEX_SIZE, TEX_SIZE);
    HUD.instance.showTexture(fboAcc.texture, 'acceleration', TEX_SIZE, TEX_SIZE);
    HUD.instance.showTexture(fboPos.texture, 'position', TEX_SIZE, TEX_SIZE);
    
    let folder = Debug.gui.addFolder('Lines');
    folder.add(this, 'reset').name('Reset');
    folder.add(this, 'pop').name('Pop');
    // folder.add(debug, 'time', -1, 1);
    folder.add(debug, 'friction', 0, 1);
    folder.add(debug, 'constrain');
    folder.add(debug, 'wrap');
    folder.add(debug, 'randomWrap');
    folder.addColor(debug, 'colorA');
    folder.addColor(debug, 'colorB');
    folder.add(debug, 'alphaA', 0, 1);
    folder.add(debug, 'alphaB', 0, 1);
  }
  
  reset() {
    velPass.uniforms.tVel.value = tarEmpty;
    velPass.uniforms.tAcc.value = tarEmpty;
    velPass.uniforms.tPos.value = tarPos;
    
    accPass.uniforms.tVel.value = tarEmpty;
    
    posPass.uniforms.tVel.value = tarEmpty;
    posPass.uniforms.tPos.value = tarPos;
    
    renPass.uniforms.tPos.value = tarPos;
    renPass.uniforms.tPrev.value = tarPrev;
    this.customDepthMaterial.uniforms.tPos.value = tarPos;
    this.customDepthMaterial.uniforms.tPrev.value = tarPrev;
  }
  
  pop() {
    accPass.uniforms.tVel.value = tarPop;
  }
  
  update() {
    let wrap = debug.randomWrap ? 2 : (debug.wrap ? 1 : 0);
    
    velPass.uniforms.time.value = debug.time;
    velPass.uniforms.mouseRadius.value = debug.mouseRadius;
    velPass.uniforms.mouseStrength.value = debug.mouseStrength;
    velPass.uniforms.mouse.value = debug.mouse;
    
    accPass.uniforms.friction.value = debug.friction;
    accPass.uniforms.force.value = debug.force;
    accPass.uniforms.time.value = debug.time;
    
    posPass.uniforms.time.value = debug.time;
    posPass.uniforms.bounds.value = debug.bounds;
    posPass.uniforms.constrain.value = debug.constrain ? 1 : 0;
    posPass.uniforms.wrap.value = debug.wrap ? 1 : (debug.randomWrap ? 2 : 0);
    
    renPass.uniforms.bounds.value = debug.bounds;
    renPass.uniforms.colorA.value.set(debug.colorA[0]/255, debug.colorA[1]/255, debug.colorA[2]/255, debug.alphaA);
    renPass.uniforms.colorB.value.set(debug.colorB[0]/255, debug.colorB[1]/255, debug.colorB[2]/255, debug.alphaB);
    this.customDepthMaterial.uniforms.bounds.value = debug.bounds;
  }
  
  draw() {
    renPass.uniforms.tPrev.value = fboPos.texture;
    this.customDepthMaterial.uniforms.tPrev.value = fboPos.texture;
    
    fboVel.render(renderer);
    fboAcc.render(renderer);
    fboPos.render(renderer);
    
    velPass.uniforms.tVel.value = fboVel.texture;
    velPass.uniforms.tAcc.value = fboAcc.texture;
    velPass.uniforms.tPos.value = fboPos.texture;
    
    accPass.uniforms.tVel.value = fboVel.texture;
    
    posPass.uniforms.tVel.value = fboVel.texture;
    posPass.uniforms.tPos.value = fboPos.texture;
    
    renPass.uniforms.tPos.value = fboPos.texture;
    this.customDepthMaterial.uniforms.tPos.value = fboPos.texture;
  }
}
