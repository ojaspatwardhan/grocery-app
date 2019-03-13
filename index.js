const electron = require("electron");
const url = require("url");
const path = require("path");

const { app, BrowserWindow, Menu, ipcMain } = electron;

//Setting Environment
process.env.NODE_ENV = "";

require('electron-reload')(__dirname);

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function() {
  //Create new window
  mainWindow = new BrowserWindow({});

  //Load HTML File into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "mainWindow.html"),
    protocol: "file:",
    slashes: true
  }));

  //Build menu from template
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  //Insert Menu
  Menu.setApplicationMenu(mainMenu);
});

//Handle Add Item Window
function createAddWindow() {
  //Create new window
  addWindow = new BrowserWindow({
    width: 500,
    height: 300,
    title: "Add Item"
  });

  //Load HTML File into window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, "addWindow.html"),
    protocol: "file:",
    slashes: true
  }));

  //Garbage Collection
  addWindow.on('close', function() {
    addWindow = null;
  });

  //Quit App when closed
  mainWindow.on('closed', function() {
    app.quit();
  });
}

// Call createAddWindow
ipcMain.on("click", () => {
  createAddWindow();
});

//Catch item:add
ipcMain.on("item:add", function(e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
});

//Create Menu template
const menuTemplate = [
  {
    label: "Electron",
    submenu: [
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    label: "File",
    submenu: [
      {
        label: "Add",
        click() {
          createAddWindow();
        },
        role: "services"
      },
      {
        label: "Remove",
        role: "services"
      }
    ]
  }
];

//Add developer tools if not in production
if(process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        label: "Dev Tools",
        accelerator: process.platform === "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: "reload"
      }
    ]
  });
}
