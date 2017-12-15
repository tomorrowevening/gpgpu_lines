var THREE = require('THREE');
var text2d = require('three-text2d');
require('apollo-utils/ThreeUtil')(THREE);
import { renderer } from '../models/global';

let textureY = 0;
let visible = true;
let _instance = null, container;
let camera;

export default class HUD extends THREE.Scene {
  constructor() {
    super();
    
    if(!_instance) {
      container = new THREE.Object3D();
      this.add(container);
      _instance = this;
      this.uniformScale = 0.7;
      this.position.y = -30;
    }
    
    camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.resize(window.innerWidth, window.innerHeight);
    
    return _instance;
  }
  
  draw() {
    if(!visible) return;
    renderer.clearDepth();
    renderer.render(this, camera);
  }
  
  resize(w, h) {
    camera.left   = w / -2;
    camera.right  = w /  2;
    camera.top    = h /  2;
    camera.bottom = h / -2;
    
    // Centered
    camera.position.x = w /  2;
    camera.position.y = h / -2;
    
    camera.updateProjectionMatrix();
  }
  
  show() {
    visible = true;
  }
  
  hide() {
    visible = false;
  }
  
  showTexture(texture, name, width, height) {
    let item = new THREE.Object3D();
    container.add(item);
    
    let geom = new THREE.PlaneBufferGeometry(width, height, 1, 1);
    geom.topLeftAnchor();
    let mat  = new THREE.MeshBasicMaterial({
      map: texture
    });
    let mesh = new THREE.Mesh(geom, mat);
    mesh.name = name;
    mesh.position.y = textureY;
    item.add(mesh);
    
    let text = new Text({
      font: 'Arial',
      fontSize: 12,
      text: name
    });
    text.position.y = textureY - height;
    text.scale.setScalar(0.5);
    item.add(text);
    
    textureY -= height + 20;
    
    return mat;
  }
  
  get uniformScale() {
    return container.scale.x;
  }
  
  set uniformScale(value) {
    container.scale.setScalar(value);
  }
  
  static get instance() {
    if(!_instance) {
      _instance = new HUD();
    }
    return _instance;
  }
}

const TextGeom = new THREE.PlaneBufferGeometry(1, 1);
TextGeom.topLeftAnchor(true);
const TextMat  = new THREE.MeshBasicMaterial({
  color: 0x000000,
  opacity: 0.7,
  transparent: true
});

class Text extends THREE.Object3D {
  constructor(params) {
    super();
    
    if(params === undefined) params = {};
    
    this.bg = new THREE.Mesh(TextGeom, TextMat);
    this.bg.position.y = -5;
    this.add(this.bg);
    
    var fName = params.font !== undefined ? params.font : 'Arial';
    var fSize = (params.fontSize !== undefined ? params.fontSize : 12) * window.devicePixelRatio;
    var offY = Math.round(fSize * 0.33);
    var tColor = new THREE.Color(params.color);
    this.txtSprite = new text2d.SpriteText2D('', {
      align: text2d.textAlign.topLeft,
      font: fSize.toString() + 'px ' + fName,
      fillStyle: tColor.getStyle(),
      antialias: true
    });
    this.txtSprite.position.x = 6;
    this.txtSprite.position.y = offY;
    this.add(this.txtSprite);
    
    this.text = params.text;
  }
  
  dispose() {
    while(this.children.length > 0) {
      this.remove(this.children[0]);
    }

    if(this.parent) this.parent.remove(this);
  }
  
  // Getters

  get text() {
    return this.txtSprite.text;
  }

  // Setters

  set text(value) {
    this.txtSprite.text = value;
    this.bg.scale.set(this.txtSprite.width + 12, this.txtSprite.height + 2, 1);
  }
}
