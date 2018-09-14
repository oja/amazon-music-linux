import { WebviewTag } from "electron";
import * as settings from "electron-settings"
import * as isDev from "electron-is-dev"
import APP_NAME from "../const";

/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-11 09:19:51
 * @desc the index.html"s renderer
*/

const { ipcRenderer, remote } = require("electron");
const { getTitle } = remote.require("./main");

let output: HTMLElement, outputWrapper: HTMLElement, webview: WebviewTag;
let expanded = true;
let blueLoop = "<img src='https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif' />"
onload = () => {
    webview = document.getElementById("amazon-music-webview") as WebviewTag;
    output = document.getElementById("output");
    outputWrapper = document.getElementById("output-wrapper");
    let lang;
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
    } else {
        lang = settings.get("language");
    }
    webview.setAttribute("src", `https://music.amazon.${lang}/home?output=embed`);

    webview.addEventListener("did-start-loading", start);
    webview.addEventListener("did-stop-loading", end);
    webview.addEventListener("dom-ready", ready);
    webview.addEventListener("media-started-playing", musicStarted);
    webview.addEventListener("media-paused", musicPaused);
    webview.addEventListener("console-message", (event) => log(event));
}


/**
 * loading start listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
const start = () => {
    showOutput();
    output.innerHTML = blueLoop;
};

/**
 * loading end listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
const end = () => {
    output.innerHTML = ""
    closeOutput();
}

/**
 * DOM ready listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
const ready = () => {
    //DEBUG!!!!!!!
    if (isDev) {
        webview.openDevTools()
    }

}

/**
 * media started listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
const musicStarted = () => {
    webview.executeJavaScript("am.onPlayClick();")
    webview.executeJavaScript("am.onNextClick();")
    webview.executeJavaScript("am.onPreviousClick();")
    webview.executeJavaScript("am.getTitle();", false, (title) => {
        if (getTitle() != `${APP_NAME}\t${title}`) {
            ipcRenderer.send("appendTitle", title)
        } else {
            setTimeout(musicStarted, 500)
        }
    })
    webview.executeJavaScript("am.getSongImage();", false, (image) => {
        ipcRenderer.send("setTrayImage", image)
    })
    handleLyrics();
}

/**
 * media paused listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
const musicPaused = () => {
    webview.executeJavaScript("am.clearInterval();")
    ipcRenderer.send("appendTitle", "")
    closeOutput();
}

/**
 * console log listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
const log = (event: Event) => {
    console.log("guest: " + event);
}

const showOutput = () => {
    if (expanded) {
        outputWrapper.style.visibility = "visible"
        webview.style.height = "97%"
        expanded = false
    }
}

const closeOutput = () => {
    if (!expanded) {
        outputWrapper.style.visibility = "hidden"
        webview.style.height = "100%"
        expanded = true
    }
}

const handleLyrics = () => {
    if (settings.get("lyrics")) {
        webview.executeJavaScript("am.hasSongText();", false, (textAv) => {
            webview.executeJavaScript("am.clearInterval();", false, () => {
                if (textAv) {
                    showOutput();
                    webview.executeJavaScript("am.getCurrentSongText();")
                }
            })
        })
    }
}

const clearLyricsAndRestart = () => {
    webview.executeJavaScript("am.clearInterval();")
    closeOutput();
    setTimeout(() => {
        handleLyrics();
    }, 300)
}

/**
 * handels the "play and pause" key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("playAndPause", () => {
    webview.executeJavaScript("am.playAndPauseMusic();")
});

/**
 * handels "the next track" key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("nextTrack", () => {
    webview.executeJavaScript("am.nextTrack();", false, () => {
        clearLyricsAndRestart();
    })
});

/**
 * handels "the previous track" key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("previousTrack", () => {
    webview.executeJavaScript("am.previousTrack();", false, () => {
        clearLyricsAndRestart();
    })
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("lyrics", (event: any, text: String) => {
    output.innerHTML = `${text}`
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("resumed", () => {
    handleLyrics();
    console.log("resumed!!");
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("paused", () => {
    /*webview.executeJavaScript("am.clearInterval();")
    closeOutput();*/
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("nextClicked", () => {
    clearLyricsAndRestart();
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("previousClicked", () => {
    clearLyricsAndRestart();
});
