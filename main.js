const electron = require('electron');
const openAboutWindow = require("about-window").default;
const serialport = require('serialport');
const Readline = require("@serialport/parser-readline");
const fs = require('fs');
const dateformat = require('dateformat');

const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let mainWindow, cldWindow;
let dataNo
let isChild = false, isRecord = false;
let saveDir, fileName;

function createMainWindow(){
  mainWindow = new BrowserWindow({
    width: 900,
    height: 500,
    minWidth: 900,
    minHeight: 500,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const menuContents = [
    {label: app.getName(), submenu: [
      {label: "このアプリについて", click: () => {
        openAboutWindow({
          icon_path: (__dirname + "/icon/icon.png"),
          package_json_dir: __dirname,
          description: "Arduinoデータの観測、書き出しをサポートします。",
          copyright: "Copyright (c) 2019 SeiyaHazama",
          win_options: {
            autoHideMenuBar: true
          }
        });
      }},
      {label: "アプリを終了", role: "quit"}
    ]}];

  const menu = Menu.buildFromTemplate(menuContents);
  Menu.setApplicationMenu(menu);

  mainWindow.loadFile('index.html');

  mainWindow.on("closed", () => {
    mainWindow = null;
  })
}

function createChildWindow() {
  if (isChild) {
    cldWindow.close();
  }
  cldWindow = new BrowserWindow({
    parent: mainWindow,
    width: 200,
    height: 200,
    minWidth: 200,
    minHeight: 200,
    maxWidth: 200,
    maxHeight: 200,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  cldWindow.loadFile("child.html");

  cldWindow.on("closed", () => {
    isChild = false;
  });
}

app.on('ready', () => {
  createMainWindow();
});

ipcMain.on('port', (event, msg) => {
  serialport.list((err, ports) => {
      event.reply('port', ports);
  });
});

ipcMain.on('connect', (event, msg) => {
  let conSerial = new serialport(msg, {
    baudRate: 115200,
  });

  conSerial.on('error', (err) => {
      event.reply("err", err.message);
  });

  const parser = conSerial.pipe(new Readline({delimiter: '\n'}));

  parser.on('data', (data) => {
    let ary = data.split(",");
    if (isChild) {
      cldWindow.webContents.send('data', ary[dataNo]);
    }
    if (isRecord) {
      fs.appendFileSync(saveDir + fileName, data);
    }
    mainWindow.webContents.send('data', data);
  });

  conSerial.on('close', () => {
    app.quit();
  });
});

ipcMain.on('meter', (event, msg) => {
  dataNo = msg;
  createChildWindow();
  isChild = true;
});

ipcMain.on('dir', (event, msg) => {
  saveDir = msg;
});

ipcMain.on('rec', (event, msg) => {
  isRecord = !isRecord;
  if (msg == "start") {
    fileName = "/Gino_" + dateformat(Date.now(), ("yyyymmddHHMMss")) + ".csv";
  }
});

app.on('activate', () => {
  if (mainWindow == null) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});
