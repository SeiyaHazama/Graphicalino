const electron = require('electron');
const serialport = require('serialport');
const Readline = require("@serialport/parser-readline");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let window;

function createwindow(){
  window = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  window.loadFile('index.html');
  window.webContents.openDevTools();
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
  console.log("received:" + msg);
  let conSerial = new serialport(msg, {
    baudRate: 115200,
  });

  conSerial.on('error', (err) => {
      event.reply("err", err.message);
  });

  const parser = conSerial.pipe(new Readline({delimiter: '\n'}));

  parser.on('data', (data) => {
    window.webContents.send('data', data);
  });

  conSerial.on('close', () => {
    console.log("closed");
  });
});
