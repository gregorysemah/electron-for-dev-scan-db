// Modules to control application life and create native browser window
const electron = require('electron')
const path = require('path')
const mqtt = require('mqtt')
const {app, BrowserWindow} = electron;

let configID = 6;

let mqttBrokerUrl = 'mqtt://192.168.1.43:1883';
let baseUrl = "http://192.168.1.43:8080"

let configs = [
  [ //0 MACRO PUPITRE GAUCHE 192.168.1.50
    "/#/macro/pupitre/pupitregauche",
  ],
  [ //1 MACRO PUPITRE DROIT 192.168.1.51
    "/#/macro/pupitre/pupitredroit",
  ], 
  [ //2
    "/#/bedroom/chest",
    "/#/bedroom/pc-interface",
  ],
  [ //3 SALON CLARA 192.168.1.35
    "/#/living-room/chest",
    "/#/living-room/television",
  ],
  [ //4 MALETTE SALON 192.168.1.16
    "/#/headquarter/bedroom-bathroom/database",
    "/#/headquarter/bedroom-bathroom/scan",
  ],
  [ //5 MALETTE CHAMBRE 192.168.1.17
    "/#/headquarter/kitchen-living-room/database",
    "/#/headquarter/kitchen-living-room/scan",
  ],
  [ //6 BRIEFING-ROOM 192.168.1.130 ou 192.168.1.5
    "/#/briefing/television",
  ],
  [ //7 VELLEDA 192.168.1.12
    "/#/corridor/velleda",
  ],
]
let urls = configs[configID];

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
    window.loadURL(baseUrl + url)

    // remove security warning
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

    windows.push(window);
    


    window.once('ready-to-show', () => {
      window.show();
      // navigator.getUserMedia(
      //   { video: true, audio: true },
      //   stream => {
      //     const video_stream = window.URL.createObjectURL(stream);
      //     console.log(video_stream)
      //   },
      //   error => {

      //   }
      // )
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



topicHandlers = [
  {
    topic:"/display/reset",
    handler:(payload) => {
      reset();
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