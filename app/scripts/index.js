import { listen, ignore } from 'apollo-utils/DOMUtil';
import Debug from 'apollo-utils/Debug';
import App from './controllers/App';
import LoadBar from './views/LoadBar';

let loader, app;

function beginLoad(evt) {
  ignore(document, 'DOMContentLoaded', beginLoad);
  
  // Load everything
  loader = new LoadBar();
  loader.listen(LoadBar.COMPLETE, loadComplete);
  loader.startLoad();
}

function loadComplete(evt) {
  loader.ignore(LoadBar.COMPLETE, loadComplete);
  loader = undefined;
  
  Debug.init();
  let gui = document.getElementsByClassName('dg main a')[0];
  gui.style.width = '245px';
  gui.style.marginRight = '0px';
  
  let stats = document.getElementById('stats');
  stats.style.left = 'calc(100% - 334px)';
  
  app = new App();
  app.setup();
  app.resize();
  app.play();
}

listen(document, 'DOMContentLoaded', beginLoad);