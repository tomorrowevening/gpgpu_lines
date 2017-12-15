var THREE = require('THREE');
var glsl = require('glslify');
require('./OrbitControls')(THREE);
import TimelineConfig from 'apollo-timeline/TimelineConfig';
import Debug from 'apollo-utils/Debug';
import { listen, ignore } from 'apollo-utils/DOMUtil';
import Event from 'apollo-utils/Event';
import AppRunner from 'apollo-utils/AppRunner';
import Loader from 'apollo-utils/Loader';
import { renderer, canvas, debug, MAX_SIZE } from '../models/global';
import HUD from '../views/HUD';
import Lines from '../views/Lines';

const MAX_WIDTH  = 0;
const MAX_HEIGHT = 0;
// const MAX_WIDTH  = 1024;
// const MAX_HEIGHT = 720;

let scene, camera, orbit;
let lines, cube, mouse;
let mouseDown, mouseMove, mouseUp, mForce = 0;
let fboEmpty;

export default class App extends AppRunner {
  constructor() {
    super();
    
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.0001, 3500);
    // camera.position.set(0, 0, 1000);
    camera.position.set(450, 280, 330);
    
    orbit = new THREE.OrbitControls(camera, canvas);
    orbit.maxDistance = 2000;
    orbit.noPan = true;
    orbit.update();
    
    HUD.instance;
    
    mouseDown = this.mouseDown.bind(this);
    mouseMove = this.mouseMove.bind(this);
    mouseUp = this.mouseUp.bind(this);
    listen(canvas, Event.MOUSE_DOWN, mouseDown);
    listen(canvas, Event.MOUSE_MOVE, mouseMove);
    listen(canvas, Event.MOUSE_UP, mouseUp);
  }
  
  setup() {
    cube = new THREE.Mesh(
      new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1),
      new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 5,
        depthTest: false,
        side: THREE.BackSide
      })
    );
    cube.name = 'room';
    cube.castShadow = false;
    cube.receiveShadow = true;
    cube.scale.set(debug.bounds.x, debug.bounds.y, debug.bounds.z);
    scene.add(cube);
    
    let envMap = TimelineConfig.textures.env;
    envMap.format = THREE.RGBFormat;
    envMap.wrapS = envMap.wrapT = THREE.MirroredRepeatWrapping;
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    envMap.magFilter = THREE.LinearFilter;
    envMap.minFilter = THREE.LinearMipMapLinearFilter;
    var mouseGeometry = new THREE.IcosahedronGeometry(1, 4);
    mouse = new THREE.Mesh(mouseGeometry, new THREE.MeshPhongMaterial({
      color: 0x999999,
      specular: 0x444444,
      shininess: 20,
      map: envMap,
      transparent: true,
      depthWrite: false
    }));
    mouse.name = 'mouse';
    mouse.castShadow = true;
    mouse.scale.setScalar(100);
    scene.add(mouse);
    
    this.setupDebug();
    
    lines = new Lines();
    lines.setup();
    scene.add(lines);
    
    this.setupLighting();
  }
  
  setupDebug() {
    let folder = Debug.gui.addFolder('Quality');
    folder.add(debug, 'quality_high').name('High');
    folder.add(debug, 'quality_medium').name('Medium');
    folder.add(debug, 'quality_low').name('Low');
    
    folder = Debug.gui.addFolder('Room');
    folder.addColor(debug, 'roomColor');
    folder.add(debug.bounds, 'x', 0, 1024).name('Bounds X');
    folder.add(debug.bounds, 'y', 0, 1024).name('Bounds Y');
    folder.add(debug.bounds, 'z', 0, 1024).name('Bounds Z');
    folder.add(debug.force, 'x', -20, 20).name('Force X');
    folder.add(debug.force, 'y', -20, 20).name('Force Y');
    folder.add(debug.force, 'z', -20, 20).name('Force Z');
    folder.add(cube, 'visible');
    
    folder = Debug.gui.addFolder('Mouse');
    folder.addColor(debug, 'mouseColor');
    folder.add(debug, 'mouseRadius', 1, 512).name('Radius');
    folder.add(debug, 'mouseStrength', -50, 50).name('Strength');
    folder.add(debug, 'mouseOpacity', 0, 1).name('Opacity');
    folder.add(mouse, 'visible');
    folder.add(mouse, 'castShadow');
  }
  
  setupLighting() {
    var ambient = new THREE.AmbientLight( 0xcccccc );
    scene.add( ambient );

    let spot = new THREE.SpotLight( 0xffffff, 1, 512*4, Math.PI / 3, 0.25 );
    spot.position.x = 400;
    spot.position.y = 700;
    spot.position.z = 200;
    spot.target.position.set( 0, 0, 0 );

    spot.castShadow = true;

    spot.shadow.camera.near = 100;
    spot.shadow.camera.far = 2500;
    spot.shadow.camera.fov = 120;

    spot.shadow.bias = 0.0003;

    spot.shadow.mapSize.width  = 1024;
    spot.shadow.mapSize.height = 2048;
    scene.add( spot );
  }
  
  update() {
    orbit.update();
    lines.update();
    mouse.position.copy(debug.mouse);
    mouse.scale.setScalar(debug.mouseRadius);
    mouse.material.opacity = debug.mouseOpacity;
    mouse.material.color.setRGB(debug.mouseColor[0]/255, debug.mouseColor[1]/255, debug.mouseColor[2]/255);
    
    cube.scale.set( debug.bounds.x*2, debug.bounds.y*2, debug.bounds.z*2);
    cube.material.color.setRGB(debug.roomColor[0]/255, debug.roomColor[1]/255, debug.roomColor[2]/255);
  }
  
  draw() {
    Debug.begin();
    
    renderer.clear();
    lines.draw();
    renderer.render(scene, camera);
    
    HUD.instance.draw();
    
    Debug.end();
  }
  
  resize(evt) {
    const w = MAX_WIDTH  > 0 ? Math.min(window.innerWidth,  MAX_WIDTH)  : window.innerWidth;
    const h = MAX_HEIGHT > 0 ? Math.min(window.innerHeight, MAX_HEIGHT) : window.innerHeight;
    const a = w / h;
    renderer.setSize(w, h);
    
    camera.aspect = a;
    camera.updateProjectionMatrix();
    HUD.instance.resize(w, h);
  }
  
  mouseDown(evt) {
    let x = (evt.clientX / window.innerWidth)  * 2 - 1;
    let y = ((evt.clientY / window.innerHeight) * 2 - 1) * -1;
    let collision = getMouseIntersection(x, y, camera, scene);
    if(collision === null) return;
    if(collision.object.name !== 'mouse') return;
    
    orbit.enabled = false;
    let pos = new THREE.Vector3(evt.clientX, evt.clientY, 0);
    let wPos = THREE.mouseToWorld(pos, camera);
    debug.mouse.x = wPos.x / 1;
    debug.mouse.y = wPos.y / 1;
    debug.mouse.z = wPos.z / 1;
    mForce = 1;
    // if(debug.mouseStrength !== 0.0) mForce = 1;
  }
  
  mouseMove(evt) {
    if(mForce < 1) return;
    let pos = new THREE.Vector3(evt.clientX, evt.clientY, 0);
    let wPos = THREE.mouseToWorld(pos, camera);
    debug.mouse.x = wPos.x / 1;
    debug.mouse.y = wPos.y / 1;
    debug.mouse.z = wPos.z / 1;
  }
  
  mouseUp(evt) {
    mForce = 0;
    orbit.enabled = true;
  }
}

function getMouseIntersection(x, y, camera, scene) {
  let raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  
  let intersections = raycaster.intersectObjects(scene.children);
  return intersections.length > 0 ? intersections[0] : null;
}
