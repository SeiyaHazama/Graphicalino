const shell = require('electron').shell;
const ipcRenderer = require("electron").ipcRenderer;
const dialog = require("electron").remote.dialog;

const portsElm = document.getElementById("ports");
const dataNoElm = document.getElementById("dataNo");
const recBtnElm = document.getElementById("recbtn");
const saveDirElm = document.getElementById("saveDirectory");
const notifElm = document.getElementById("notif");
const tbltrElm = document.getElementById("tbltr");
const tblvalElm = document.getElementById("tblval");
const progressElm = document.getElementById("progress");

let conPort = "";
let isConnected = false, isRecord = false;
let dataLength = 0;
let saveDir = [process.env[process.platform == "win32" ? "USERPROFILE": "HOME"]];

document.addEventListener('DOMContentLoaded', () => {
  loadSerialPortList();
  ipcRenderer.send("dir", saveDir[0]);
  saveDirElm.innerText = 'CSVファイルは"' + saveDir + '"に保存されます。';
});

ipcRenderer.on('port', (event, msg) => {
  portsElm.innerHTML = "<option value='none'>接続先を選択</option>";
  let flg = false;
  for (var i = 0; i < msg.length; i++) {
    if (msg[i].manufacturer && msg[i].manufacturer.match("Arduino") && !flg) {
      portsElm.innerHTML += '<option selected value="' + msg[i].comName + '">' + msg[i].comName + '(Arduino)</option>';
      conPort = msg[i].comName;
      dispNotification("alert alert-success", "<span class='oi oi-circle-check'></span> Arduinoを自動検出しました。");
      flg = true;
    } else {
      portsElm.innerHTML += '<option value="' + msg[i].comName + '">' + msg[i].comName + '</option>';
    }
  }
  portsElm.innerHTML += '<option value="reload">ポートを更新</option>';
  if (!flg) {
    dispNotification("alert alert-warning", "<span class='oi oi-circle-x'></span> 接続先が選択されていません");
  }
});

ipcRenderer.on('err', (event, msg) => {
  dispNotification("alert alert-danger", "<span class='oi oi-circle-x'></span> 接続エラー：" + msg);
  isConnected = false;
  portsElm.disabled = false;
});

ipcRenderer.on('data', (event, data) => {
  portsElm.disabled = true;
  document.getElementById("conbtn").disabled = true;
  dataNoElm.disabled = false;
  document.getElementById("meterbtn").disabled = false;
  recBtnElm.disabled = false;
  if (!isConnected) {
    dispNotification("alert alert-success", "<span class='oi oi-circle-check'></span> 接続しました");
    isConnected = true;
  }
  receivedSerialData(data);
});

function dispNotification(cls, text) {
  notifElm.className = cls;
  notifElm.innerHTML = text;
}

function loadSerialPortList() {
  dispNotification("","");
  portsElm.innerHTML = '<option selected>お待ちください...</option>';
  ipcRenderer.send('port', 'request');
}

function changedSelectPort() {
  switch (portsElm.value) {
    case "reload":
      conPort = "";
      loadSerialPortList();
      break;
    case "none":
      conPort = "";
      dispNotification("alert alert-warning", "<span class='oi oi-circle-x'></span> 接続先が選択されていません");
      break;
    default:
      conPort = portsElm.value;
      dispNotification("alert alert-primary", "<span class='oi oi-info'></span> Arduinoであることを確認し[接続]をクリックします");
  }
}

function openSerial() {
  if (conPort != '') {
    ipcRenderer.send('connect', conPort);
  }
}

function receivedSerialData(data) {
  let toArray = data.split(",");
  let cvArray = [];
  for (var i = 0; i < toArray.length; i++) {
    cvArray[i] = Number(toArray[i]);
    if (isNaN(cvArray[i])) {
      cvArray[i] = toArray[i];
    }
  }
  dispSerialData(cvArray);
}

function dispSerialData(data) {
  tbltrElm.innerHTML = "";
  tblvalElm.innerHTML = "";
  if (data.length != dataLength) {
    dataNoElm.innerHTML = "";
    for (var i = 0; i < data.length; i++) {
      dataNoElm.innerHTML += "<option value='" + i + "'>Data" + (i + 1) + "</option>";
    }
    dataLength = data.length;
  }
  for (var i = 0; i < data.length; i++) {
    tbltrElm.innerHTML += "<th scope='col'>Data" + (i + 1) + "</th>";
    tblvalElm.innerHTML += "<td>" + data[i] + "</td>";
  }
}

function openAnalogMeter() {
  ipcRenderer.send("meter", dataNoElm.value);
}

function openDiretoryDialog() {
  saveDir = dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "CSV保存先を選択",
    defaultPath: saveDir[0]
  });
  ipcRenderer.send("dir", saveDir[0]);
  saveDirElm.innerText = 'CSVファイルは"' + saveDir[0] + '"に保存されます。';
}

function pressRecButton() {
  let msg = "";
  let label = "";
  isRecord = !isRecord;
  if (isRecord) {
    msg = "start";
    label = "<span class='oi oi-video'></span> 記録を終了";
    progressElm.hidden = false;
    dispNotification("alert alert-primary", "<span class='oi oi-spreadsheet'></span> 指定ディレクトリに記録しています。")
  } else {
    msg = "stop";
    label = "<span class='oi oi-video'></span> 記録を開始";
    progressElm.hidden = true;
    dispNotification("alert alert-success", "<span class='oi oi-circle-check'></span> 記録が完了しました。");
  }
  ipcRenderer.send("rec", msg);
  recBtnElm.innerHTML = label;
}

function openFiler() {
  shell.openItem(saveDir[0]);
}
