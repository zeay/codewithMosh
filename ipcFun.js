const path = require('path');
const url = require('url');
const fs = require('fs');
const ipcMain = require('electron').ipcMain;
const downloadM3u8 = require("./m3u8");
const sanitize = require('sanitize-filename');
global.videoDs = false;
webData = global.cliData;
let stage = 0;
let match = false;
let websiteName = "";
let downloadData = [];
global.assetManager = []
let downloadObject;
let count = 0;
let downloader;

ipcMain.on('stage', (e, web)=>{
    //setting stage
    // console.log(webData);
    // console.log(web);
    match = false;
    if(web.indexOf("sign_in?") > -1){
        match =true
    }
    if(stage === 1){
        stage = 2;
    }
    if(!match){
        stage += 1;
    }
    websiteName = web;
    e.sender.send('newStage', stage);

});

ipcMain.on("globalData", (e, startPushing, courseName, heading, subDir)=>{
    // console.log("webData pushing.....", startPushing, courseName, heading, subDir);
    if(startPushing){
        webData.startPushing = startPushing;
    }
    if(courseName){
        webData.courseName = courseName;
    }
    if(heading){
        webData.title = heading;
    }
    if(subDir){
        webData.subDir = subDir;
    }
});

ipcMain.on("sendDownload", (e)=>{
            let downloadUrl = global.videoLinks[(global.videoLinks.length - 1)];
            let sanitizeMainFolder = sanitize(webData.courseName);
            let sanitizeSubDirectory = sanitize(webData.subDir);
            // console.log("SanitizeSubDirectory.....", sanitizeSubDirectory);
            let fileName = sanitize(webData.title);
            let dir = webData.destination+"/"+sanitizeMainFolder;
            if(!fs.existsSync(dir)){
              fs.mkdirSync(dir);
            }
            let mainDirectory = dir+"/"+sanitizeSubDirectory;
            downloadObject= {
                url: downloadUrl,
                directory: mainDirectory,
                file: fileName
            }
            console.log("Download Object======\n", downloadObject);
            downloadData.push(downloadObject);
            global.videoDs = true;
});

ipcMain.on("downloadingAsset", (e, assetName, subDir)=>{
    let sanitizeMainFolder = sanitize(webData.courseName);
    let sanitizeSubDirectory = sanitize(subDir);
    let address = webData.destination+"\\"+sanitizeMainFolder+"\\"+sanitizeSubDirectory;
    let downloadObject = {
        destination: address
    }
    global.assetManager.push(downloadObject);
});



downloader = setInterval((e)=>{
    if(global.videoDs && count < downloadData.length){
        console.log("About to start Downloading ........")
        global.videoDs = false;
        downloadM3u8(downloadData[count].url, downloadData[count].directory, downloadData[count].file);
        count += 1;

    }
}, 15000);

let cancelAllInterval = setInterval(()=>{
    console.log("Checking is bot finished working.......");
    if(count >= downloadData.length){
        clearInterval(downloader);
        clearInterval(cancelAllInterval);
        console.log("Download Completed");
        process.exit();
    }
}, 60000 * 10);





















