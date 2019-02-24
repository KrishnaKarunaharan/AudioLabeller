AudioFiles = [];
AudioIndex = 0;
SpeakerId = 0;
labelList = [];

$(document).ready(function() {

    filenames = [],
    foldernames = [];

    $.get("http://127.0.0.1:8887/", function(response) {

        
        myWindow = document.open("", "MsgWindow", "width=500,height=300");
        myWindow.document.write(response);
        getNames();
        myWindow.document.close();

        var playlist = document.getElementById('playlist');

        for (var i = 0; i < AudioFiles.length; i++) {
            var x = document.createElement('p');
            x.classList.add("audio");
            x.innerHTML = AudioFiles[i];
            x.dataset.index = i;

            playlist.appendChild(x);
        }

        document.querySelectorAll('.audio').forEach(el => {
            console.log(el);
            el.addEventListener("click", function() {
                loadFile(el.dataset.index);
            }
        )});


        WaveSurfer
        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'red',
            progressColor: 'purple',
            height: '130',
            barWidth: '1',
            backend: 'MediaElement'
        });


        //To get waveform working, you need to download following extention
        //https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi/related?hl=en-US
        wavesurfer.load('http://127.0.0.1:8887/' + AudioFiles[AudioIndex]);
        document.getElementById("AudioName").innerHTML = AudioFiles[AudioIndex];


        wavesurfer.on('ready', function() {
            var timeline = Object.create(WaveSurfer.Timeline);

            timeline.init({
                wavesurfer: wavesurfer,
                container: '#waveform-timeline'
            });
        });

    
        var slider = document.querySelector('#slider');
    });

    function getNames() {

        var files = myWindow.document.querySelectorAll("a.icon.file");
        var folders = myWindow.document.querySelectorAll("a.icon.dir");
        files.forEach(function(item) {
            filenames.push(item.textContent)
        })
        folders.forEach(function(item) {
            foldernames.push(item.textContent.slice(0, -1))
        })


        for (var i = 0; i < filenames.length; i++) {
            if (filenames[i].endsWith(".mp3") || filenames[i].endsWith(".wav"))
                AudioFiles.push(filenames[i]);
        }

    }

});


function indexCounter() {
    global AudioIndex
    wavesurfer.clearRegions();
    if (AudioFiles.length > AudioIndex)
        AudioIndex++;
    else
        AudioIndex = 0;
    wavesurfer.load('http://127.0.0.1:8887/' + AudioFiles[AudioIndex]);
    document.getElementById("AudioName").innerHTML = AudioFiles[AudioIndex];
}

function loadFile(index){
    global AudioIndex
    wavesurfer.clearRegions();
    wavesurfer.load('http://127.0.0.1:8887/' + AudioFiles[index]);
    document.getElementById("AudioName").innerHTML = AudioFiles[index];
    AudioIndex = index;
}

//Speaker Starts
function speakerStarts(Id) {

    //Stopping AudioFile if playing
    if (wavesurfer.isPlaying())
        wavesurfer.playPause();

    //Creates new label object 
    label = new Object();


    label.StartTime = Math.round(wavesurfer.getCurrentTime() * 100) / 100;



    document.getElementById("status").innerHTML = "Speaker #"+ Id +" starting to speak at " + label.StartTime + " seconds";

    //Displays Stop button and removes start button
    document.getElementById('stop').style.visibility = 'visible';

    SpeakerId = Id;

    wavesurfer.playPause();
}

//Speaker Starts
function speakerFinishes() {

    //Stopping AudioFile if playing
    if (wavesurfer.isPlaying())
        wavesurfer.playPause();


    //Label Endtime
    label.EndTime = Math.round(wavesurfer.getCurrentTime() * 100) / 100;
    label.File = AudioFiles[AudioIndex];

    //Prompt Name
    label.Speaker = SpeakerId;

    //Summary Alert
    document.getElementById("status").innerHTML = "Speaker #"+label.Speaker + " has spoken from " + label.StartTime + " to " + label.EndTime + " seconds.";

    //Adding onto list of Labels
    labelList.push(label);

    switch (SpeakerId) {
        case 1:
            colourText = 'hsl(180,100%,50%,0.3)';
            break;
        case 2:
            colourText = 'hsl(30, 100%, 85%,0.5)';
            break;
        case 3:
            colourText = 'hsl(0,100%,50%, 0.2)';
            break;
    }

    //Displays Start button and removes Stop button
    document.getElementById('stop').style.visibility = 'hidden';

 
        wavesurfer.addRegion({
            start: label.StartTime, // time in seconds
            end: label.EndTime, // time in seconds
            color: colourText
        });   

}

function clearLabels() {
    wavesurfer.clearRegions();
    labelList = [];
}

function download() {
    //Download putting functionality. Outputs txt file with Name/Timestaps
    var output = "";

    for (var i = 0; i < labelList.length; i++) {
        // output += "File Name: " + labelList[i].File + "\n" + "Speaker: " + labelList[i].Speaker + "\n" + "Start Time: " + labelList[i].StartTime + "\n" + "End Time: " + labelList[i].EndTime + "\n\n";
        output += labelList[i].StartTime + ", " + labelList[i].Endtime + ", " + labelList[i].Speaker + "\n";

    }

    //Downloads txt file
    var blob = new Blob([output], {
        type: "text/plain;charset=utf-8"
    });

    // fileName = labelList.File + ".csv";
    // saveAs(blob, fileName);
    saveAs(blob, "Parsed-Labels.txt");
    
}

function setSpeed_1_5x() {
    wavesurfer.backend.setPlaybackRate(1.5);
    document.getElementById("status").innerHTML = "Set playback speed to 1.5x!";
}

function setSpeed_2x() {
    wavesurfer.backend.setPlaybackRate(2);
    document.getElementById("status").innerHTML = "Set playback speed to 2x!";
}

function setSpeed_3x() {
    wavesurfer.backend.setPlaybackRate(3);
    document.getElementById("status").innerHTML = "Set playback speed to 3x!";
}

// Control keyboard shortcuts
window.addEventListener("keydown", function(e){

// Space
if (e.keyCode==32){
    wavesurfer.playPause();
}
// "1"
else if (e.keyCode==49){
    if (e.keyCode==49 && e.shiftKey){
        speakerFinishes(1);
    }
    else{
        speakerStarts(1);
    }
}
// "2"
else if (e.keyCode==50){
    if (e.keyCode==50 && e.shiftKey){
        speakerFinishes(2);
    }
    else{
        speakerStarts(2);
    }
}
// "3"
else if (e.keyCode==51){
    if (e.keyCode==51 && e.shiftKey){
        speakerFinishes(3);
    }
    else{
        speakerStarts(3);
    }
}
// Right Arrow
else if (e.keyCode==39){
    if (e.keyCode==39 && e.ctrlKey){
        wavesurfer.skipForward(5);
    }
    else if (e.keyCode==39 && e.shiftKey){
        wavesurfer.skipForward(0.3);
    }
    else{
        wavesurfer.skipForward(1);
    }
}
// Left Arrow
else if (e.keyCode==37){
    if (e.keyCode==37 && e.ctrlKey){
        wavesurfer.skipBackward(5);
    }
    else if (e.keyCode==37 && e.shiftKey){
        wavesurfer.skipBackward(0.3);
    }
    else{
        wavesurfer.skipBackward(1);
    }
}
// Ctrl + Shift + "S"
else if (e.keyCode==83){
    if (e.keyCode==83 && e.shiftKey && e.ctrlKey){
        download();
    }
}
// "up arrow"
else if (e.keyCode==38){
    wavesurfer.setPlaybackRate(2);
}

// "down arrow"
else if (e.keyCode==40)
    wavesurfer.setPlaybackRate(1);

});