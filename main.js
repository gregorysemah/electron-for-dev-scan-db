// Modules to control application life and create native browser window
const electron = require('electron')
const path = require('path')
const mqtt = require('mqtt')
const {app, BrowserWindow} = electron;
const express = require('express');
const proxy = require('express-http-proxy');
const exec = require('child_process').exec
const server = express();

let configID = 4;

let configs = [
  
  
  { 
    num:0, 
    mode:"MACRO",
    title:"MACRO PUPITRE GAUCHE", 
    ip:"192.168.1.50", 
    urls:[
      "/#/macro/pupitre/pupitregauche",
    ],
  },
  { 
    num:1, 
    mode:"MACRO",
    title:"MACRO PUPITRE DROIT", 
    ip:"192.168.1.51", 
    urls:[
      "/#/macro/pupitre/pupitredroit",
    ], 
  },
  { 
    num:2, 
    mode:"MICRO",
    title:"CHAMBRE CLARA", 
    ip:"?", 
    urls:[
      "/#/bedroom/chest",
      "/#/bedroom/pc-interface",
    ],
  },
  { 
    num:3, 
    mode:"MICRO",
    title:"SALON CLARA", 
    ip:"192.168.1.35", 
    urls:[
      "/#/living-room/chest",
      "/#/living-room/television",
    ],
  },
  { 
    num:4, 
    mode:"MICRO",
    title:"MALETTE SALON", 
    ip:"192.168.1.16", 
    urls:[
      "/#/headquarter/bedroom-bathroom/database",
      "/#/headquarter/bedroom-bathroom/scan",
    ],
  },
  { 
    num:5, 
    mode:"MICRO",
    title:"MALETTE CHAMBRE", 
    ip:"192.168.1.17", 
    urls:[
      "/#/headquarter/kitchen-living-room/database",
      "/#/headquarter/kitchen-living-room/scan",
    ],
  },
  { 
    num:6, 
    mode:"MICRO",
    title:"BRIEFING-ROOM", 
    ip:"192.168.1.5", 
    urls:[
      "/#/briefing/television",
    ],
  },
  { 
    num:7, 
    mode:"MICRO",
    title:"VELLEDA", 
    ip:"192.168.1.12", 
    urls:[
      "/#/corridor/velleda",
    ],
  },
  { 
    num:8, 
    mode:"MICRO",
    title:"TESTS", 
    ip:"RTC", 
    urls:[
      "/#/rtc/emiter/dev",
      "/#/rtc/receiver/dev",
    ],
    
  }
]

const environnement = configs[configID].mode;
let urls = configs[configID].urls;


let mqttBrokerUrl = 'mqtt://192.168.1.43:1883';
let baseUrl = "http://192.168.1.43:8080"
let serveUrl = "http://localhost:3000"

if(environnement == "MACRO"){
  mqttBrokerUrl = 'mqtt://192.168.1.44:1883';
  baseUrl = "http://192.168.1.44:8080"
  // serveUrl = "file://public"
  //server.use('/', express.static("public"));
  server.use('/', proxy(baseUrl));
}
else{
  server.use('/', proxy(baseUrl));
}

server.listen(3000, function () {})



let windows = [];

function createWindows () {
  // Create the browser window.
  const displays = electron.screen.getAllDisplays()
  for(let i = 0; i<urls.length; i++) {
    const url = urls[i];
    
    const display = displays[Math.min(i,displays.length-1)];
    const { x, y, width, height} = display.workArea;
    
    let window = new BrowserWindow({
      x, y, width, height, // set to display dimensions
      fullscreen: true,
      alwaysOnTop: true,
      resizable: true,
      movable: true,
      frame: false,
      show: false, 
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    
    // Open the DevTools.
    // window.webContents.openDevTools()
    
    // and load the index.html of the app.
    window.loadURL(serveUrl + url)
    
    // remove security warning
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    
    windows.push(window);
    
    window.once('ready-to-show', () => {
      window.show();
    })
    
    // Emitted when the window is closed.
    window.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      let index = windows.indexOf(window);
      if (index !== -1) windows.splice(index, 1);
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (window.length == 0) createWindows()
})

function reset() {
  if (windows.length != 0) {
    for (let index = 0; index < windows.length; index++) {
      const atomicWindow = windows[index];
      atomicWindow.webContents.reloadIgnoringCache()
      atomicWindow.reload()
    }
  }
}

function shutdown() {
  exec("shutdown /s")
}


function restart() {
  exec("shutdown /r")
}


topicHandlers = [
  {
    topic:"/display/reset",
    handler:(payload) => {
      reset();
    }
  }, 
  {
    topic:"/computer/shutdown",
    handler:(payload) => {
      shutdown();
    }
  }, 
  {
    topic:"/computer/restart",
    handler:(payload) => {
      restart();
    }
  }
]

function handleMessage(topic, message) {
  topicHandler = topicHandlers.find((t=>t.topic == topic))
  
  if(topicHandler){
    topicHandler.handler(message);
  }
}

mqttClient = mqtt.connect(mqttBrokerUrl);

mqttClient.on("connect", function (status) {
  console.log("MQTT connected with status: ", status)
})

mqttClient.on("message", function (topic, message) {
  console.log("mqtt message", topic, message)
  
  handleMessage(topic, message.toString())
})

for (const topicHandler of topicHandlers) {
  mqttClient.subscribe(topicHandler.topic)
  
} 