const electron = require('electron');
const serialport = require('serialport');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let window;

function createwindow(){
  window = new BrowserWindow({
    width: 800,
    height: 600,
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
