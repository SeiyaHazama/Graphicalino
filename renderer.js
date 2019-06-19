const ipcRenderer = require("electron").ipcRenderer;
const portsElm = document.getElementById("ports");

let conPort = "";
let isConnected = false;
let gageNum = 0;

let g = new JustGage({
  id: "gauge",
  value: 0,
  min: 0,
  max: 1024,
  title: "AnalogMeter"
});

document.addEventListener('DOMContentLoaded', () => {
  loadSerialPortList();
});

ipcRenderer.on('port', (event, msg) => {
  portsElm.innerHTML = "<option value='none'>接続先を選択</option>";
  let flg = false;
  for (var i = 0; i < msg.length; i++) {
    if (msg[i].manufacturer && msg[i].manufacturer.match("Arduino") && !flg) {
      portsElm.innerHTML += '<option selected value="' + msg[i].comName + '">' + msg[i].comName + '(Arduino)</option>';
      conPort = msg[i].comName;
      dispNotification("alert alert-success", "Arduinoを自動検出しました。");
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

ipcRenderer.on('err', (event, msg) => {
  dispNotification("alert alert-danger", "接続エラー：" + msg);
  isConnected = false;
  portsElm.disabled = false;
});

ipcRenderer.on('data', (event, data) => {
  portsElm.disabled = true;
  isConnected = true;
  dispNotification("alert alert-success", "接続しました");
  receivedSerialData(data);
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
      conPort = "";
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

function openSerial() {
  if (conPort != '') {
    ipcRenderer.send('connect', conPort);
  }
}

function receivedSerialData(data) {
  let toArray = data.split(",");
  let cvArray = [];
  for (var i = 0; i < toArray.length; i++) {
    try {
      cvArray[i] = Number(toArray[i]);
    } catch (e) {
      cvArray[i] = toArray[i];
    }
  }
  dispSerialData(cvArray);
}

function dispSerialData(data) {
  document.getElementById("tbltr").innerHTML = "";
  document.getElementById("tblval").innerHTML = "";
  document.getElementById("tblbtn").innerHTML = "";
  for (var i = 0; i < data.length; i++) {
    document.getElementById("tbltr").innerHTML += "<th scope='col'>Data" + (i + 1) + "</th>";
    document.getElementById("tblval").innerHTML += "<td>" + data[i] + "</td>";
    document.getElementById("tblbtn").innerHTML += "<td><button type='button' class='btn btn-info'>ゲージ切替</button></td>";
  }
  g.refresh(data[0]);
  if (typeof data[0] != "number") {
    document.getElementById("gaugeInfo").innerText = "Data" + data[0] + "はモニタできません。";
  } else {
    document.getElementById("gaugeInfo").innerText = "Data" + data[0] + "をモニタ中";
  }
}
