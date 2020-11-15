firebase.analytics();

var config;
var configById = {};
var categories = {};

const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
var category = urlParams.get("cat");
var id = urlParams.get("id");
var view = urlParams.get("view");

var videoElement = document.getElementById("videoElement");
var audioElement = document.getElementById("audioElement");
var logoSpan = document.getElementById("logo-span");
var tickerDiv = document.getElementById("ticker-div");
var titleDiv = document.getElementById("title-div");
var tickerNews = document.getElementById("ticker-news");
var playButton = document.getElementById("play-button");
var fullscreenButton = document.getElementById("fullscreen-button");
var fullscreenText = document.getElementById("fullscreen-text");
var menuPopup = document.getElementById("menu-popup");
var helpPopup= document.getElementById("help-popup");
var infoPopup = document.getElementById("info-popup");
var infoButton = document.getElementById("info-button");
var videoCredit = document.getElementById("credits-video");
var audioCredit = document.getElementById("credits-audio");
var brightElement = document.getElementById("bright-frame");
var categoryList = document.getElementById("categoryList");
var buttonPanel = document.getElementById("button-panel");
var themeSelect = document.getElementById("theme-select");
var newsCheckbox = document.getElementById("news-checkbox");

if(view)
  themeSelect.value = view;
else {
  view = "simple";
  themeSelect.value = "simple";
}
// if (view === "news")
//   newsCheckbox.checked = true;
// else
//   newsCheckbox.checked = false;

audioElement.volume = 0;

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
  config.scenes.unshift({
    category: "All"
  });

  config.scenes.forEach(scene => {
    configById[scene.id] = scene;

    if (scene.category) {
      if (!categories[scene.category]) {
        categories[scene.category] = [];
        var entryElement = document.createElement("div");
        var spanElement = document.createElement("span");
        var iconElement = document.createElement("img");
        
        iconElement.src = "./icons/" + scene.category.toLowerCase() + ".png";
        iconElement.width = "40";
        
        spanElement.innerHTML = scene.category;
        spanElement.classList.add("category-name")

        entryElement.classList.add("listentry");
        entryElement.setAttribute("data-category", scene.category.toLowerCase());
        entryElement.append(iconElement);
        entryElement.append(spanElement);
        entryElement.addEventListener('click', setCategory);
        categoryList.appendChild(entryElement);
      }

      categories[scene.category].push(scene);
    }
  });

  toggleInfoPopup();

  if (id)
    setVideo(id);
  else
    randomVideo();

  if(view == "news") {
    tickerDiv.style.display = "block";
  }
  else if (view == "simple") {
    //titleDiv.classList.remove("tit");
    titleDiv.classList.add("title-div-simple");    
    titleDiv.style.display = "block";
  }
  
  setTimeout(resizeVideo, 1000);
  setTimeout(resizeVideo, 8000);

  // Change the video every 10 minutes
  setInterval(() => {
    randomVideo();
  }, 600000);
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

function setCategory(e) {
  var newCategory = e.target.getAttribute("data-category");
  if (! newCategory) 
    newCategory = e.target.parentNode.getAttribute("data-category");

  var newUrl = window.location.origin + window.location.pathname;
  if (newCategory.toLowerCase() != "all") {
    newUrl += "?cat=" + newCategory;
    if (view != "simple") newUrl += "&view=" + view;
  }
  else if (view != "simple")
    newUrl += "?view=" + view;

  window.location.href = newUrl;
  //randomVideo();
}

function setVideo(newid) {
  var scene = configById[newid];
  id = newid;
  var videoLink = scene.videoLink;
  var audioLink = scene.audioLink;

  if (config.baseUrl && window.location.hostname != "localhost" && window.location.hostname != "127.0.0.1") {
    videoLink = config.baseUrl + videoLink;
    audioLink = config.baseUrl + audioLink;
  }

  videoElement.src = videoLink;
  audioElement.src = audioLink;
  if (infoPopup.style.display != "none") {
    fadeAudioOut();
    //audioElement.pause();
  }

  videoCredit.href = scene.videoSource;
  videoCredit.textContent = "\"" + scene.title + "\"";
  titleDiv.innerText = "Live: " + scene.title;
  tickerNews.innerText = "LIVE: " + scene.title;
  audioCredit.href = scene.audioSource;
  var audioTitle = scene.audioTitle;
  if (!audioTitle) audioTitle = scene.title;
  audioCredit.textContent = "\"" + audioTitle + "\"";

  if (infoPopup.style.display == "none") showTitle();
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
  if (infoPopup.style.display === "none") {
    infoPopup.style.display = "block";
  } else {
    infoPopup.style.display = "none";
  }
  //pause();
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }        
}

function toggleMenuPopup(e) {
  
  if (menuPopup.style.display === "none") {
    infoPopup.style.display = "none";
    menuPopup.style.display = "block";
  } else {
    infoPopup.style.display = "block";
    menuPopup.style.display = "none";
  }

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

  if (e.target.value != "simple") {
    var newUrl = window.location.origin + window.location.pathname + "?view=" + e.target.value + "&id=" + id;
    if (category && category !== "all") newUrl += "&cat=" + category;

    window.location.href = newUrl;         
  }
  else {
    var newUrl = window.location.origin + window.location.pathname + "?id=" + id;
    if (category && category !== "all") newUrl += "&cat=" + category;
  
    window.location.href = newUrl;
  }
}

// function toggleNewsTheme(e) {
//   if (view === "news") {
//     newsCheckbox.checked = false;
//     var newUrl = window.location.origin + window.location.pathname + "?id=" + id;

//     if (category && category !== "all") newUrl += "&cat=" + category;
  
//     window.location.href = newUrl;    
//   }
//   else {
//     newsCheckbox.checked = false;
//     var newUrl = window.location.origin + window.location.pathname + "?view=news&id=" + id;
  
//     if (category && category !== "all") newUrl += "&cat=" + category;

//     window.location.href = newUrl;     
//   }
// }

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
  if(infoPopup.style.display != "none") {
    play(e);
  }
  else {
    pause(e);
  }
}

function pause(e) {
  //videoElement.pause();
  //audioElement.pause();
  fadeAudioOut();
  hideTitle();
  infoPopup.style.display = "block";

  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function play(e) {
  videoElement.play();
  //audioElement.play();
  fadeAudioIn();
  infoPopup.style.display = "none";
  menuPopup.style.display = "none";       

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
  if (category) {
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

function refreshVideo(newid) {   
  var videoArray = [];

  var newUrl = window.location.origin + window.location.pathname
  var params = "";
  if (category && category.toLowerCase() != "all")
    params = "cat=" + category;
  
  if (params)
    params += "&id=" + newid;
  else
    params = "id=" + newid;

  if (view != "simple") params += "&view=" + view;
  history.pushState({}, null, newUrl + "?" + params);
  setVideo(newid);
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
    }
    // When volume at zero stop all the intervalling
    if (audioElement.volume === 0.0) {
        if (fadeAudio) clearInterval(fadeAudio);
    }
  }, 200);
}  

function fadeAudioIn () {

  if (fadeAudio) clearInterval(fadeAudio);
  audioElement.play();

  fadeAudio = setInterval(function () {
    // Only fade if past the fade out point or not at zero already
    if (audioElement.volume != 1.0) {
      var newVolume = audioElement.volume + 0.1;
      if (newVolume > 1) newVolume = 1;
      audioElement.volume = newVolume;
    }
    // When volume at zero stop all the intervalling
    if (audioElement.volume === 1.0) {
      if (fadeAudio) clearInterval(fadeAudio);
    }
  }, 200);
}

var titleFade;

function showTitle() {
  if (view == "none") {
    hideTitle();

    titleFade = setTimeout(() => {
      titleDiv.style.display = "block";
  
      titleFade = setTimeout(() => {
        titleDiv.style.display = "none";
      }, 4000);
    }, 1000);
  }
  else {
    //tickerDiv.style.display = "block";
  }
}

function hideTitle() {
  if (view == "none") {
    titleDiv.style.display = "none";
    if (titleFade) clearInterval(titleFade);
  }
}