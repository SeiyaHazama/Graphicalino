const ipcRenderer = require("electron").ipcRenderer;
const portsElm = document.getElementById("ports");

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('port', 'request');
});

ipcRenderer.on('port', (event, msg) => {
  portsElm.innerHTML = "<option value='none'>接続先を選択</option>";
  let flg = false;
  for (var i = 0; i < msg.length; i++) {
    if (msg[i].manufacturer && msg[i].manufacturer.match("Arduino") && !flg) {
      dispNotification("alert alert-primary", "Arduinoを検出し、自動選択しました。");
      portsElm.innerHTML += '<option selected value="' + msg[i].comName + '">' + msg[i].comName + '</option>';
      flg = true;
    } else {
      portsElm.innerHTML += '<option value="' + msg[i].comName + '">' + msg[i].comName + '</option>';
    }
  }
  portsElm.innerHTML += '<option value="reload">ポートを更新</option>';
  if (!flg) {
    dispNotification("alert alert-warning", "Arduinoを見つけることができませんでした。<br>互換品の場合は手動で選択してください。");
  }
});

function dispNotification(cls, text) {
  document.getElementById("notif").className = cls;
  document.getElementById("notif").innerHTML = text;
}
