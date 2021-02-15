firebase.analytics();

var config;
var configById = {};
var categories = {};
var defaultView = "simple";
const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
var category = "all"; //urlParams.get("cat");
var id = urlParams.get("id");
var view = localStorage.getItem('view');

var vTimer;
var aTimer;

if (window.location.pathname != "/")
  category = window.location.pathname.replace("/", "");

var videoElement = document.getElementById("videoElement");
var audioElement = document.getElementById("audioElement");
var asmrAudioElement = document.getElementById("asmrAudioElement");
var logoSpan = document.getElementById("logo-span");
var tickerDiv = document.getElementById("ticker-div");
var titleDiv = document.getElementById("title-div");
var titleText = document.getElementById("title-text");
var tickerNews = document.getElementById("ticker-news");
var playButton = document.getElementById("play-button");
var fullscreenButton = document.getElementById("fullscreen-button");
var fullscreenText = document.getElementById("fullscreen-text");
var helpPopup= document.getElementById("help-popup");
var infoPopup = document.getElementById("info-popup");
var infoButton = document.getElementById("info-button");
var videoCredit = document.getElementById("credits-video");
var audioCredit = document.getElementById("credits-audio");
var brightElement = document.getElementById("bright-frame");
var categoryList = document.getElementById("cat-select");
var buttonPanel = document.getElementById("button-panel");
var themeSelect = document.getElementById("theme-select");
var newsCheckbox = document.getElementById("news-checkbox");
var muteCheckbox = document.getElementById("mute");
var asmrMuteCheckbox = document.getElementById("asmrMute");

var audioMute = localStorage.getItem('audioMute') == "true";
if (audioMute)
  muteCheckbox.setAttribute("checked", "");
else
  muteCheckbox.removeAttribute("checked");

var asmrMute = localStorage.getItem('asmrMute');
if (asmrMute == undefined || asmrMute == "true") 
  asmrMute = true;
else
  asmrMute = false;

if (asmrMute)
  asmrMuteCheckbox.setAttribute("checked", "");
else
  asmrMuteCheckbox.removeAttribute("checked");

if(view)
  themeSelect.value = view;
else {
  view = defaultView;
  themeSelect.value = defaultView;
}
// if (view === "news")
//   newsCheckbox.checked = true;
// else
//   newsCheckbox.checked = false;

audioElement.volume = 0;
asmrAudioElement.volume = 0;

fetch('config.json')
.then((res) => {
  if (!res.ok) {
    throw new Error('Whoops!')
  }
  return res;
})
.then((res) => res.json())
.then((res) => {
  config = res;
  config.scenes.forEach(scene => {

    if (scene.category) {
      var cats = scene.category.split(",");

      for (i in cats) {
        cat = cats[i].trim();
        if (!categories[cat]) {
          categories[cat] = [];
          var entryElement = document.createElement("option");
          entryElement.setAttribute("value", cat.toLowerCase());
          entryElement.innerHTML = cat;

          if (cat.toLowerCase() == category) entryElement.setAttribute("selected", "");

          categoryList.appendChild(entryElement);

          // iconElement.src = "./icons/" + cat.toLowerCase() + ".png";
          // iconElement.width = "40";
          
          // spanElement.innerHTML = cat;
          // spanElement.classList.add("category-name")

          // entryElement.classList.add("listentry");
          // entryElement.setAttribute("data-category", cat.toLowerCase());
          // entryElement.append(iconElement);
          // entryElement.append(spanElement);
          // entryElement.addEventListener('click', setCategory);
          // categoryList.appendChild(entryElement);
        }

        var newScene = Object.assign({}, scene);
        newScene.category = cat;
        configById[scene.id] = newScene;
        categories[cat].push(scene);
      }
    }
  });

  if (id)
    setVideo(id);
  else
    randomVideo();

  toggleInfoPopup();

  if(view == "news") {
    tickerDiv.style.display = "block";
  }
  else if (view == "simple" || view == "none") {
    //titleDiv.classList.remove("tit");
    titleDiv.classList.add("title-div-simple");    
    titleDiv.style.display = "block";
  }
  
  setTimeout(resizeVideo, 1000);
  setTimeout(resizeVideo, 8000);

  // Change the video every 5 minutes
  // videoSwitchTimer = setInterval(() => {
  //   randomVideo();
  // }, 300000);
})      
.catch((e) => console.log('Fetch Error:', e))      

document.addEventListener('keydown', changeVideo);
document.addEventListener('click', togglePause);
document.addEventListener('dblclick', fullscreen);

window.onresize = resizeVideo;

document.addEventListener('swiped-right', function(e) {
  window.history.back(); 
});

document.addEventListener('swiped-left', function(e) {
  randomVideo();
});      

window.onpopstate = function (event) {
  console.log("hello");
  const queryString = window.location.search;
  console.log(queryString);
  const urlParams = new URLSearchParams(queryString);
  var newCategory = urlParams.get("cat");
  var newId = urlParams.get("id");        
  setVideo(newId);
}

var videoTimer = function() {
  randomVideo();
}

var audioTimer = function() {
  audioElement.src = "media/music/contemplation" + Math.floor(Math.random() * config.music.contemplation) + ".mp3";
}

function setCategory(e) {
  var newCategory = e.target.value;
  // if (! newCategory) 
  //   newCategory = e.target.parentNode.getAttribute("data-category");

  var newUrl = window.location.origin; // + window.location.pathname;
  if (newCategory.toLowerCase() != "all") {
    //newUrl += "?cat=" + newCategory;
    newUrl += "/" + newCategory;
    if (view != defaultView) newUrl += "&view=" + none;
  }
  // else if (view != defaultView)
  //   newUrl += "?view=" + view;

  if (view != defaultView)
    newUrl += "?view=" + view;

  window.location.href = newUrl;
  //randomVideo();
}

function setVideo(newid) {
  var scene = configById[newid];
  id = newid;
  var videoLink = scene.videoLink;
  var audioLink = "";
  
  clearTimeout(aTimer);
  clearTimeout(vTimer);

  if (scene.audioLink) audioLink = scene.audioLink;

  if (!audioLink) {
    //Load default music
    audioLink = "media/music/contemplation" + Math.floor(Math.random() * config.music.contemplation) + ".mp3";
    audioCredit.href = "https://www.bensound.com";
    audioCredit.textContent = "\"Royalty Free Music by BenSound\"";    
  }

  if (config.baseUrl && window.location.hostname != "localhost" && window.location.hostname != "127.0.0.1") {
    videoLink = config.baseUrl + videoLink;
    if (audioLink) audioLink = config.baseUrl + audioLink;
  }

  videoElement.src = videoLink;
  audioElement.src = audioLink;
  //if (infoPopup.style.display != "none") {
  if (infoPopup.style.opacity != 0) {  
    fadeAudioOut();
    //audioElement.pause();
  }

  videoCredit.href = scene.videoSource;
  videoCredit.textContent = "\"" + scene.title + "\"";
  var addText = "";
  if (category == "explore") addText = "Explore ";
  titleText.innerText = addText + scene.title;
  tickerNews.innerText = addText + scene.title;
  if (scene.audioSource) {
    audioCredit.href = scene.audioSource;
    var audioTitle = scene.audioTitle;
    if (!audioTitle) audioTitle = scene.title;
    audioCredit.textContent = "\"" + audioTitle + "\"";
  }

  //if (infoPopup.style.display == "none") showTitle();
  if (infoPopup.style.opacity == 0) showTitle();

  setTimeout(() => {
    //if (infoPopup.style.display != "none") {
    if (infoPopup.style.opacity != 0) {  
      videoElement.pause();
    }

    if (!scene.audioLink)
      aTimer = setTimeout(audioTimer, (audioElement.duration - 1) * 1000);

    var startTime = Math.floor(Math.random() * (videoElement.duration - 20));
    var newDuration = videoElement.duration - startTime;

    if (startTime) videoElement.currentTime = startTime;

    if (newDuration > 300)
      vTimer = setTimeout(videoTimer, (newDuration - 1) * 1000);
    else
      vTimer = setTimeout(videoTimer, 300000);
  }, 1000);
  
}

function jumpBrightness(e) {
  var opacity = brightElement.style.opacity;
  if (!opacity) opacity = "0.0";
  opacity = parseFloat(opacity) + .2;
  if (opacity >= 1) opacity = 0.2;

  brightElement.style.opacity = opacity.toString();

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }  
}

function stopPropagation(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }          
}

function toggleInfoPopup(e) {

  // if (infoPopup.style.display === "none") {
  //   infoPopup.style.display = "block";
  // } else {
  //   infoPopup.style.display = "none";
  // }

  if (infoPopup.style.opacity == 0) {
    infoPopup.style.opacity = .9;
  } else {
    infoPopup.style.opacity = 0;
  }  

  pause();
  
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }        
}

function toggleHelpPopup(e) {
  
  if (helpPopup.style.display === "none") {
    infoPopup.style.display = "none";
    helpPopup.style.display = "block";
  } else {
    infoPopup.style.display = "block";
    helpPopup.style.display = "none";
  }

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }        
}

function setTheme(e) {
  console.log(e.target.value);
  var newView = e.target.value;

  if (newView != view && newView != defaultView) {
    var newUrl = window.location.origin + "/" + category + "?view=" + newView;

    if (category != "explore") {
      newUrl += "&id=" + id;
    }

    window.location.href = newUrl;
  }
  // if (e.target.value != defaultView) {
  //   var newUrl = window.location.origin + window.location.pathname + "?view=" + e.target.value + "&id=" + id;
  //   if (category && category !== "all") newUrl += "&cat=" + category;

  //   window.location.href = newUrl;         
  // }
  // else {
  //   var newUrl = window.location.origin + window.location.pathname + "?id=" + id;
  //   if (category && category !== "all") newUrl += "&cat=" + category;
  
  //   window.location.href = newUrl;
  // }
}

function resizeVideo() {
  //if (window.innerHeight > window.innerWidth) {
    videoElement.style.height = "100%";
    videoElement.style.width = "auto";
    videoElement.style.left = -1 * (videoElement.offsetWidth / 2 - (window.innerWidth / 2));
    
    // if (infoPopup.style.display === "none" && menuPopup.style.display === "none") {
    //   audioElement.pause();
    //   audioElement.play();
    // }
}

function togglePause(e) {
  //if(infoPopup.style.display != "none") {
  if(infoPopup.style.opacity != 0) {
    play(e);
  }
  else {
    pause(e);
  }
}

var infoFade;
function pause(e) {
  videoElement.pause();
  //audioElement.pause();
  clearTimeout(infoFade);
  fadeAudioOut();
  hideTitle();
  //infoPopup.style.opacity = 0;
  infoPopup.style.display = "block";
  setTimeout(() => {
    infoPopup.style.opacity = 0.9;
  }, 100);

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function play(e) {
  videoElement.play();
  //audioElement.play();
  fadeAudioIn();
  //infoPopup.style.display = "none";
  infoPopup.style.opacity = 0;

  infoFade = setTimeout(() => {
    infoPopup.style.display = "none";
  }, 1100);

  showTitle();

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function fullscreen(e) {

  if (!document.fullscreen) {
    document.documentElement.requestFullscreen();
    fullscreenButton.classList.remove("video-button-fullscreen");
    fullscreenButton.classList.add("video-button-exitfullscreen");
    fullscreenText.innerText = "Exit Fullscreen";

    play();
  }
  else {
    document.exitFullscreen();
    fullscreenButton.classList.remove("video-button-exitfullscreen");
    fullscreenButton.classList.add("video-button-fullscreen");      
    fullscreenText.innerText = "Fullscreen";    
  }

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }        
}

function randomVideo(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  //play();

  var videoArray = [];
  if (category && category != "all") {
    var catString = category[0].toUpperCase() + category.substr(1);
    videoArray = categories[catString];
  }
  else
    videoArray = config.scenes;

  var newIndex = Math.floor(Math.random() * videoArray.length);
  while((videoArray[newIndex].id === id) || (videoArray[newIndex].id == undefined) ) {
    newIndex = Math.floor(Math.random() * videoArray.length);
  }
  
  refreshVideo(videoArray[newIndex].id);
}

function changeVideo(e) {
  console.log(e.code); 
  if (e.code === "ArrowRight") {
    window.history.forward();
    var oldId = id;
    setTimeout(() => {
      if (id == oldId) randomVideo();
    }, 1000);
  }
  else if (e.code === "ArrowLeft") {
    window.history.back();
  }      
  else if (e.code === "KeyR" || e.code === "ArrowDown" || e.code === "ArrowUp") {
    randomVideo();
  }
  else if (e.code === "Space" || e.code === "KeyP") {
    togglePause();
  }
  else if (e.code === "NumpadEnter" || e.code === "Enter" || e.code === "KeyF") {
    //videoElement.requestFullscreen();
    fullscreen(e);
  }
  else if (e.code === "Escape") {
    play(e);
  }
  else if (e.code === "ArrowUp") {
    //if (audioElement.volume <= 0.9) audioElement.volume += 0.1;
  }
  else if (e.code === "ArrowDown") {
    //if (audioElement.volume >= 0.1) audioElement.volume -= 0.1;
  }          
}

videoElement.onpause = function() {
    //audioElement.pause();
    // playButton.classList.remove("video-button-pause");
    // playButton.classList.add("video-button-play");
    //document.getElementById("play-text").innerText = "Play";
};

videoElement.onplay = function() {
    //audioElement.play();
    //playButton.classList.remove("video-button-play");
    //playButton.classList.add("video-button-pause");
    //document.getElementById("play-text").innerText = "Pause";
};      

function refreshVideo(newId) {   
  var videoArray = [];

  var newUrl = window.location.origin;
  if (category && category.toLowerCase() != "all")
    newUrl += "/" + category.toLowerCase();

  if (category.toLowerCase() != "explore") {
    newUrl += "?id=" + newId;
    window.location.href = newUrl; 
  }
  else {
    setVideo(newId);
  }
  // var newUrl = window.location.origin + window.location.pathname
  // var params = "";
  // if (category && category.toLowerCase() != "all")
  //   params = "cat=" + category;
  
  // if (params)
  //   params += "&id=" + newid;
  // else
  //   params = "id=" + newid;

  // if (view != defaultView) params += "&view=" + view;
  // history.pushState({}, null, newUrl + "?" + params);
  // setVideo(newid);
  //window.location.href = newUrl + "?" + params;    
}

var fadeAudio;

function fadeAudioOut () {

  if (fadeAudio) clearInterval(fadeAudio);
  fadeAudio = setInterval(function () {
    // Only fade if past the fade out point or not at zero already
    if (audioElement.volume != 0.0) {
      var newVolume = audioElement.volume - 0.1;
      if (newVolume < 0) newVolume = 0;
      audioElement.volume = newVolume;
      asmrAudioElement.volume = newVolume;
    }
    // When volume at zero stop all the intervalling
    if (audioElement.volume === 0.0) {
        if (fadeAudio) clearInterval(fadeAudio);
        audioElement.pause();
        asmrAudioElement.pause();
    }
  }, 200);
}  

function fadeAudioIn () {

    if (fadeAudio) clearInterval(fadeAudio);
    if (!audioMute) audioElement.play();
    if (!asmrMute) asmrAudioElement.play();

    fadeAudio = setInterval(function () {
      // Only fade if past the fade out point or not at zero already
      if (audioElement.volume != 1.0) {
        var newVolume = audioElement.volume + 0.1;
        if (newVolume > 1) newVolume = 1;
        audioElement.volume = newVolume;
        asmrAudioElement.volume = newVolume;
      }
      // When volume at zero stop all the intervalling
      if (audioElement.volume === 1.0) {
        if (fadeAudio) clearInterval(fadeAudio);
      }
    }, 200);
}

var titleFade;

function showTitle() {
  if (view == "none" || view == "simple") {
    hideTitle();

    titleFade = setTimeout(() => {
      titleDiv.style.opacity = .7;
  
      titleFade = setTimeout(() => {
        if (view == "none") titleDiv.style.opacity = 0;
      }, 8000);
    }, 1000);
  }
  else {
    //tickerDiv.style.display = "block";
  }
}

function hideTitle() {
  if (view == "none" || view == "simple") {
    titleDiv.style.opacity = 0;
    if (titleFade) clearInterval(titleFade);
  }
}

function toggleMute(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  audioMute = !audioMute;
  localStorage.setItem("audioMute", audioMute);

  if (audioMute)
    muteCheckbox.setAttribute("checked", "");
  else
    muteCheckbox.removeAttribute("checked");
}

function toggleAsmrMute(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
    
  asmrMute = !asmrMute;
  localStorage.setItem("asmrMute", asmrMute);

  if (asmrMute)
    asmrMuteCheckbox.setAttribute("checked", "");
  else
    asmrMuteCheckbox.removeAttribute("checked");
}