const ipcRenderer = require("electron").ipcRenderer;
const portsElm = document.getElementById("ports");

let conPort = "";

document.addEventListener('DOMContentLoaded', () => {
  loadSerialPortList();
});

ipcRenderer.on('port', (event, msg) => {
  portsElm.innerHTML = "<option value='none'>接続先を選択</option>";
  let flg = false;
  for (var i = 0; i < msg.length; i++) {
    if (msg[i].manufacturer && msg[i].manufacturer.match("Arduino") && !flg) {
      dispNotification("alert alert-success", "Arduinoを検出し、自動選択しました。");
      portsElm.innerHTML += '<option selected value="' + msg[i].comName + '">' + msg[i].comName + '</option>';
      flg = true;
    } else {
      portsElm.innerHTML += '<option value="' + msg[i].comName + '">' + msg[i].comName + '</option>';
    }
  }
  portsElm.innerHTML += '<option value="reload">ポートを更新</option>';
  if (!flg) {
    dispNotification("alert alert-warning", "接続先が選択されていません");
  }
});

function dispNotification(cls, text) {
  document.getElementById("notif").className = cls;
  document.getElementById("notif").innerHTML = text;
}

function loadSerialPortList() {
  dispNotification("","");
  portsElm.innerHTML = '<option selected>お待ちください...</option>';
  ipcRenderer.send('port', 'request');
}

function changedSelectPort() {
  switch (document.getElementById("ports").value) {
    case "reload":
      loadSerialPortList();
      break;
    case "none":
      conPort = "";
      dispNotification("alert alert-warning", "接続先が選択されていません");
      break;
    default:
      conPort = document.getElementById("ports").value;
      dispNotification("alert alert-primary", "Arduinoであることを確認し[接続]をクリックします");
  }
}
