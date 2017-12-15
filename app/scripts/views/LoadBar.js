var THREE = require('THREE');
import Loader from 'apollo-utils/Loader';
import Dispatcher from 'apollo-utils/Dispatcher';
import { getID, delay } from 'apollo-utils/DOMUtil';
import TimelineConfig from 'apollo-timeline/TimelineConfig';
import { assets } from '../models/global';

export default class LoadBar extends Dispatcher {
  static COMPLETE = 'complete';
  
  constructor() {
    super();
    this.element = getID('loadbar');
  }
  
  startLoad() {
    Loader.retinaCheck = false;
    Loader.loadAssets(
      assets,
      this.loadComplete.bind(this),
      this.loadProgress.bind(this),
      (evt) => {
        console.log('error', evt)
      }
    );
  }
  
  loadProgress(progress) {
    this.element.style.width = Math.round(progress * 200).toString() + 'px';
  }
  
  loadComplete() {
    // Images/Textures
    for(let i in Loader.images) {
      let tex = new THREE.Texture(Loader.images[i]);
      tex.needsUpdate = true;
      TimelineConfig.textures[i] = tex;
    }
    
    delay(0.1, () => {
      this.element.parentElement.removeChild(this.element);
      this.notify(LoadBar.COMPLETE);
    })
  }
}