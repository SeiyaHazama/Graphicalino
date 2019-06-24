const electron = require('electron');
const serialport = require('serialport');
const Readline = require("@serialport/parser-readline");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let window, cldwindow, dataNo, isChild = false, isRecord = false, saveDir;

function createwindow(){
  window = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });
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
    if (isChild) {
      let ary = data.split(",");
      cldwindow.webContents.send('data', ary[dataNo]);
    }
    window.webContents.send('data', data);
  });

  conSerial.on('close', () => {
    console.log("closed");
  });
});

ipcMain.on('meter', (event, msg) => {
  dataNo = msg;
  createChildWindow();
  isChild = true;
});

ipcMain.on('dir', (event, msg) => {
  saveDir = msg;
  console.log(msg);
});

ipcMain.on('rec', (event, msg) => {
  isRecord = !isRecord;
  if (msg == "start") {
    console.log('start', isRecord);
  } else {
    console.log('stop', isRecord);
  }
})
