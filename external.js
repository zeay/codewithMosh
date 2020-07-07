const render = require('electron').ipcRenderer;
const remote = require('electron').remote;

const globalData = remote.getGlobal('cliData');
var stage = 0;
let count = 0;
let intervalVar;
function clickLogin(){
    let loginElement = document.getElementsByClassName("fedora-navbar-link")[6];
    console.log(loginElement);
    loginElement.click();
}

function performLogin(){
    let emailField = document.getElementById("user_email");
    let passField = document.getElementById("user_password");
    if(emailField.value === ""){
        emailField.value = globalData.email;
    }else if(passField.value === ""){
        passField.value = globalData.pass;
    }
    setTimeout(()=>{
        let loginButton = document.getElementsByClassName("login-button");
        loginButton[0].click();
    }, 5000)

}

function clickStart(){
    let startBtn = document.getElementsByClassName("title-container")[globalData.count];
    let courseNameElement = document.getElementsByTagName("h2")[0];
    let courseName = courseNameElement.innerText.trim();

    setTimeout(()=>{
        render.send("globalData", true, courseName, null, null);
        startBtn.click();
    }, 7000);
}

function startDownloadFile(){
    let lectures = document.getElementsByClassName("lecture-name");
    let incrementer = globalData.count + 1;
    // console.log("incrementer", incrementer);
    // console.log("lecture innerText", lectures[incrementer].innerText);
    let videoHeading ;
    let videoName;
    let subDirectory;
    intervalVar = setInterval((e)=>{
        if(count < lectures.length){
            lectures[incrementer].click();
            count += 1;
            setTimeout((e)=>{
                let videoElem = document.getElementsByTagName("video")[0];
                if(videoElem){
                    videoHeading = document.getElementById("lecture_heading");
                    videoName = videoHeading.innerText.trim();
                    subDirectory = lectures[incrementer].parentElement.parentElement.parentElement.parentElement.parentElement.innerText.split("(");
                    // console.log("Subdirectory ----", subDirectory[0]);
                    render.send("globalData",null, null, videoName, subDirectory[0].trim());
                    render.send("sendDownload");
                    incrementer += 1;
                }else{
                    let downloadElement;
                    videoHeading = document.getElementById("lecture_heading");
                    videoName = videoHeading.innerText.trim();
                    subDirectory = lectures[incrementer].parentElement.parentElement.parentElement.parentElement.parentElement.innerText.split("(");
                    incrementer += 1;
                    try{
                        downloadElement = document.getElementsByClassName("download");
                        for(let i=0; i<downloadElement.length; i++){
                            setTimeout(()=>{
                                render.send("downloadingAsset", videoName, subDirectory[0].trim());
                                downloadElement[i].click();
                            } ,3000);
                        }
                    }catch(error){
                        console.log(error);
                    }
                }
            }, 5000);
        }else{
            console.log("Interval cleared");
            clearInterval(intervalVar);
        }
    }, 10000);
}

function extractVideo(){
    setTimeout(()=>{
        let firstLecture = document.getElementsByClassName("lecture-name")[0];
        let headingElement = document.getElementById("lecture_heading");
        let heading = headingElement.innerText.trim();
        let subDir = firstLecture.parentElement.parentElement.parentElement.parentElement.parentElement.innerText.split("(");
        console.log("Subdirectory", subDir[0]);
        console.log("Heading is: ", heading);
        render.send("globalData",null, null, heading, subDir[0].trim());
        render.send("sendDownload");
    }, 5000);
    setTimeout(()=>{
        startDownloadFile();
    },10000);
}
function startRipping(stage){
    console.log(stage);
    if(stage === 0){

    }else if(stage ===1){
        clickLogin();
    }else if(stage === 2){
        performLogin();
    }else if(stage === 3){
        window.location.href = globalData.url;
    } else if(stage === 4){
        clickStart();
    }else if(stage === 5){
        extractVideo();
    }else{
        console.log("Some Navigation occurs");
    }
}

window.onload = function () {
    let websiteName = window.location.href;
    console.log(websiteName);
    render.send("stage", websiteName);
    render.once('newStage', (e, s)=>{
        console.log("newStage Runed");
        stage = s;
        startRipping(stage);
    })
}