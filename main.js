const {app, BrowserWindow, globalShortcut} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const request = require('request');
const { session, IncomingMessage } = require('electron');
// const downloadM3u8 = require("./m3u8");
require('events').EventEmitter.defaultMaxListeners = Infinity;
// var startDownload = true;
// var count = 0;
// var match = false;
 global.cliData = {
    url: process.argv[2],
    email: process.argv[3],
    pass: process.argv[4],
    destination: process.argv[5],
    courseName: "",
    title: "",
    subDir:"",
    startPushing: false,
    count: Number(process.argv[6]) || 0
};
global.videoLinks = [];
 const ipcFun = require('./ipcFun');
//-------------Function Started--------------------------------------------------
function createWindow () {
      // Create the browser window.
   win = new BrowserWindow({width: 1200, height: 600, webPreferences:{
     nodeIntegration: false,
     allowRunningInsecureContent:true,
     preload: __dirname+'/external.js'
   }});
   win.setMenu(null);
   win.loadURL(cliData.url);
    const ses = win.webContents.session;
    ses.clearCache(()=>{
      console.log("cached clear");
    });
    ses.clearStorageData();
    ses.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36");
    console.log(ses.getUserAgent());
    //load url;
     // Open the DevTools.
    //win.webContents.openDevTools();
    win.webContents.on('media-started-playing', function(e){
        console.log("Media started playing");
    });
    session.defaultSession.webRequest.onBeforeSendHeaders(function(details, cb){  
        if(details.url.indexOf('m3u8?origin_v2=1') > -1){
            //console.log("url is", details.url);
            if(global.cliData.startPushing){
                // console.log("Video link last element", global.videoLinks[(global.videoLinks.length - 1)]);
                if(global.videoLinks.length === 0){
                    // console.log("------------------newLink is about to push");
                    global.videoLinks.push(details.url);
                }
                if(details.url !== global.videoLinks[(global.videoLinks.length - 1)]){
                    // console.log("------------------2newLink is about to push");
                    global.videoLinks.push(details.url);
                }
            }
        }
        cb(details);
    });
    //download Funtion
    win.webContents.session.on('will-download', (event, item, webContents) => {
        let fileName = item.getFilename();
        let destination = global.assetManager[(global.assetManager.length - 1)].destination+"/"+fileName;
        // console.log(destination);
      item.setSavePath(destination);
      console.info("Assets Downloading Started");
      item.on('updated', (event, state) => {
        if (state === 'interrupted') {
          console.log('Download is interrupted but can be resumed');
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            console.log('Download is paused')
          } else {
            console.log(`Received bytes: ${item.getReceivedBytes()}`);
          }
        }
      })
      item.once('done', (event, state) => {
        if (state === 'completed') {
          console.log('Download successfully');
          console.info("If video fetching still don't start it will strat idle time 10 mins PLEASE WAIT");
        } else {
          console.log(`Download failed: ${state}`);
        }
      })
    });

      win.on('closed', () => {
        win = null
      });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  };
})

