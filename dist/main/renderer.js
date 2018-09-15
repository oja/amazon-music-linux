"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var isDev = require("electron-is-dev");
var settings = require("electron-settings");
var const_1 = require("../const");
/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-11 09:19:51
 * @desc the index.html"s renderer
 */
var getTitle = electron_1.remote.require("./main").getTitle;
var output;
var outputWrapper;
var webview;
var expanded = true;
var blueLoop = "<img src='https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif' />";
onload = function () {
    webview = document.getElementById("amazon-music-webview");
    output = document.getElementById("output");
    outputWrapper = document.getElementById("output-wrapper");
    var lang;
    if (settings.get("autoLanguage")) {
        switch (navigator.language.split("-")[0]) {
            case "en":
                lang = "com";
                break;
            case "de":
                lang = "de";
                break;
            case "fr":
                lang = "fr";
                break;
            case "it":
                lang = "it";
                break;
            case "es":
                lang = "es";
                break;
            case "in":
                lang = "in";
                break;
            default:
                lang = "com";
        }
    }
    else {
        lang = settings.get("language");
    }
    webview.setAttribute("src", "https://music.amazon." + lang + "/home?output=embed");
    webview.addEventListener("did-start-loading", start);
    webview.addEventListener("did-stop-loading", end);
    webview.addEventListener("dom-ready", ready);
    webview.addEventListener("media-started-playing", musicStarted);
    webview.addEventListener("media-paused", musicPaused);
    webview.addEventListener("console-message", function (event) { return log(event); });
};
/**
 * loading start listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var start = function () {
    showOutput();
    output.innerHTML = blueLoop;
};
/**
 * loading end listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var end = function () {
    output.innerHTML = "";
    closeOutput();
};
/**
 * DOM ready listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var ready = function () {
    // DEBUG!!!!!!!
    if (isDev) {
        webview.openDevTools();
    }
};
/**
 * media started listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var musicStarted = function () {
    webview.executeJavaScript("__am.onPlayClick();");
    webview.executeJavaScript("__am.onNextClick();");
    webview.executeJavaScript("__am.onPreviousClick();");
    webview.executeJavaScript("__am.getTitle();", false, function (title) {
        if (getTitle() !== const_1["default"] + "\t" + title) {
            electron_1.ipcRenderer.send("appendTitle", title);
        }
        else {
            setTimeout(musicStarted, 500);
        }
    });
    webview.executeJavaScript("__am.getSongImage();", false, function (image) {
        electron_1.ipcRenderer.send("setTrayImage", image);
    });
    handleLyrics();
};
/**
 * media paused listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var musicPaused = function () {
    webview.executeJavaScript("__am.clearInterval();");
    electron_1.ipcRenderer.send("appendTitle", "");
    closeOutput();
};
/**
 * console log listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var log = function (event) {
    // tslint:disable-next-line:no-console
    console.log("guest: " + event);
};
var showOutput = function () {
    if (expanded) {
        outputWrapper.style.visibility = "visible";
        webview.style.height = "97%";
        expanded = false;
    }
};
var closeOutput = function () {
    if (!expanded) {
        outputWrapper.style.visibility = "hidden";
        webview.style.height = "100%";
        expanded = true;
    }
};
var handleLyrics = function () {
    if (settings.get("lyrics")) {
        webview.executeJavaScript("__am.hasSongText();", false, function (textAv) {
            webview.executeJavaScript("__am.clearInterval();", false, function () {
                if (textAv) {
                    showOutput();
                    webview.executeJavaScript("__am.getCurrentSongText();");
                }
            });
        });
    }
};
var clearLyricsAndRestart = function () {
    webview.executeJavaScript("__am.clearInterval();");
    closeOutput();
    setTimeout(function () {
        handleLyrics();
    }, 300);
};
/**
 * handels the "play and pause" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("playAndPause", function () {
    webview.executeJavaScript("__am.playAndPauseMusic();");
});
/**
 * handels "the next track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("nextTrack", function () {
    webview.executeJavaScript("__am.nextTrack();", false, function () {
        clearLyricsAndRestart();
    });
});
/**
 * handels "the previous track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("previousTrack", function () {
    webview.executeJavaScript("__am.previousTrack();", false, function () {
        clearLyricsAndRestart();
    });
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("lyrics", function (event, text) {
    output.innerHTML = "" + text;
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("resumed", function () {
    handleLyrics();
    // tslint:disable-next-line:no-console
    console.log("resumed!!");
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("paused", function () {
    /*webview.executeJavaScript("__am.clearInterval();")
      closeOutput();*/
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("nextClicked", function () {
    clearLyricsAndRestart();
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcRenderer.on("previousClicked", function () {
    clearLyricsAndRestart();
});
//# sourceMappingURL=renderer.js.map