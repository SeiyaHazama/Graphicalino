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

let window, cldwindow, dataNo, isChild = false, isRecord = false, saveDir, saveData;

function createwindow(){
  window = new BrowserWindow({
    width: 900,
    height: 500,
    minWidth: 900,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: true
    }
  });

  const menuContents = [
    {label: app.getName(), submenu: [
      {label: "このアプリについて", click: () => {
        openAboutWindow({
          icon_path: (__dirname + "/icon.png"),
          package_json_dir: __dirname,
          win_options: {
            autoHideMenuBar: true
          }
        });
      }},
      {label: "アプリを終了", role: "quit"}
    ]}];

  const menu = Menu.buildFromTemplate(menuContents);
  Menu.setApplicationMenu(menu);

  window.loadFile('index.html');
  window.webContents.openDevTools();
}

function createChildWindow() {
  if (isChild) {
    cldwindow.close();
  }
  cldwindow = new BrowserWindow({
    parent: window,
    minWidth: 200,
    minHeight: 200,
    maxWidth: 200,
    maxHeight: 200,
    webPreferences: {
      nodeIntegration: true
    }
  });
  cldwindow.loadFile("child.html");

  cldwindow.on("closed", () => {
    isChild = false;
  });
}

app.on('ready', () => {
  createwindow();
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
      cldwindow.webContents.send('data', ary[dataNo]);
    }
    if (isRecord) {
      fs.appendFileSync(saveDir + saveData, data);
    }
    window.webContents.send('data', data);
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
    saveData = "/Gino_" + dateformat(Date.now(), ("yyyymmddHHMMss")) + ".csv";
  }
})
