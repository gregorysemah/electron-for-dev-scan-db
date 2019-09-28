// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')

let configID = 6;

let baseUrl = "http://192.168.1.43:8080"

let configs = [
  [ //0
    "/#/macro/pupitre/pupitregauche",
  ],
  [ //1
    "/#/macro/pupitre/pupitredroit",
  ],
  [ //2
    "/#/bedroom/chest",
    "/#/bedroom/pc-interface",
  ],
  [ //3
    "/#/living-room/chest",
    "/#/living-room/television",
  ],
  [ //4
    "/#/headquarter/bedroom-bathroom/scan",
    "/#/headquarter/bedroom-bathroom/database",
  ],
  [ //5
    "/#/headquarter/kitchen-living-room/scan",
    "/#/headquarter/kitchen-living-room/database",
  ],
  [ //6
    "/#/briefing/television",
  ],
  [ //7
    "/#/coridor/veleda",
  ],
]

let urls = configs[configID];

let windows = [];


function createWindows () {
  // Create the browser window.
  for (const url of urls) {
      
    let window = new BrowserWindow({
      width: 1920,
      height: 1080,
      fullscreen:true,
      alwaysOnTop: true,
      resizable:true,
      movable:true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })

    // and load the index.html of the app.
    window.loadURL(baseUrl + url)

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    windows.push(window);
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
