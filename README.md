Graphicalino
===

![https://opensource.org/licenses/MIT](https://img.shields.io/badge/license-MIT-green.svg)

You can observation graphically of Arduino serial data and export for CSV file.

## Description

Graphicalino is tool for observation graphically of Arduino serial data. Usually, think everyone use serial monitor of Arduino IDE or simple tool of you made, when everyone observation serial data.
Serial monitor of Arduino IDE is very easy for observation of data. But, serial monitor is can't export to CSV data.
Simple tool for like run at terminal is can export CSV data. But, develop tool is diffical for begginer.
Therefor, I develop Graphicalino. Graphicalino is easy operate and can export CSV data.

Graphicalino is can observation serial data of other than Arduino.

This develop started for my practice of Electron. So, This software is may be unstable.

If i have time, I schedule add a little more function.

## Rule of serial data format

Serial data is must split of comma. For example, when send data is 2 pieces, please format for serial data to like under.

```
<data1>,<data2>
```

And please add new line code `¥n` at end. If sender is Arduino, code of send serial data is ok at under.

```
Serial.println(...);
```

## Installation

Please access download page.

### Language

Japanese

## Do you want custom Graphicalino?

To custom Graphicalino, Electron is needed in addition your environment.

```
npm install electron -g
```

1. Clone this repository

```
git clone https://github.com/SeiyaHazama/Graphicalino.git
```

2. Install of require package

```
npm install
```

3. Rebuild package

Please see [electron-rebuild](https://github.com/electron/electron-rebuild).

4. Run

```
electron .
```

## Use framework and library

|Name(Link)|Use|
|:---:|:---|
|[Bootstrap4](https://getbootstrap.com/)|CSS framework. App design.|
|[justgage-1.2.2](http://justgage.com/)|Create gauge.|
|[seialport](https://serialport.io/)|Connect Arduino.|

## License

MIT

I'm don't accept pull request, but you can improvement and redistribution.

## Author

SeiyaHazama
