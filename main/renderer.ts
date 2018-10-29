import { ipcRenderer, remote, WebviewTag } from "electron";
import * as isDev from "electron-is-dev";
import * as settings from "electron-settings";
import * as constants from "../const";

/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-11 09:19:51
 * @desc the index.html"s renderer
 */
const { getTitle } = remote.require("./main");

let output: HTMLElement;
let outputWrapper: HTMLElement;
let webview: WebviewTag;
let expanded = true;

const blueLoop =
  "<img src='https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif' />";
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
  webview.addEventListener("console-message", event => log(event));
};

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
  output.innerHTML = "";
  closeOutput();
};

/**
 * DOM ready listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
const ready = () => {
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
const musicStarted = () => {
  /*webview.executeJavaScript("__am.getTracklist();", false, (tracklist) => {
    console.log(tracklist);
  });*/
  webview.executeJavaScript("__am.onPlayClick();");
  webview.executeJavaScript("__am.onNextClick();");
  webview.executeJavaScript("__am.onPreviousClick();");
  webview.executeJavaScript("__am.getTitle();", false, title => {
    if (getTitle() !== `${constants.APP_NAME}\t${title}`) {
      ipcRenderer.send("appendTitle", title);
    } else {
      setTimeout(musicStarted, 500);
    }
  });
  sendTrackAndArtist();
  setTimeout(() => {
    webview.executeJavaScript("__am.getSongImage();", false, image => {
      ipcRenderer.send("setTrayImage", image);
    });
  }, 2000);
  handleLyrics();
  ipcRenderer.send("sendPlayingStatus", false);
};

const sendTrackAndArtist = () => {
  setTimeout(() => {
    webview.executeJavaScript("__am.getMusicTitle();", false, track => {
      webview.executeJavaScript("__am.getArtist();", false, artist => {
        ipcRenderer.send("setTrackAndArtist", [track, artist]);
      });
    });
  }, 1000);
};

/**
 * media paused listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
const musicPaused = () => {
  webview.executeJavaScript("__am.clearInterval();");
  ipcRenderer.send("appendTitle", "");
  closeOutput();
  ipcRenderer.send("sendPlayingStatus", true);
};

/**
 * console log listener
 *
 * @author Flo Dörr <flo@dörr.site>
 */
const log = (event: Event) => {
  // tslint:disable-next-line:no-console
  console.log("guest: " + event);
};

const showOutput = () => {
  if (expanded) {
    outputWrapper.style.visibility = "visible";
    webview.style.height = "97%";
    expanded = false;
  }
};

const closeOutput = () => {
  if (!expanded) {
    outputWrapper.style.visibility = "hidden";
    webview.style.height = "100%";
    expanded = true;
  }
};

const handleLyrics = () => {
  if (settings.get("lyrics")) {
    webview.executeJavaScript("__am.hasSongText();", false, textAv => {
      webview.executeJavaScript("__am.clearInterval();", false, () => {
        if (textAv) {
          showOutput();
          webview.executeJavaScript("__am.getCurrentSongText();");
        }
      });
    });
  }
};

const clearLyricsAndRestart = () => {
  webview.executeJavaScript("__am.clearInterval();");
  closeOutput();
  setTimeout(() => {
    handleLyrics();
  }, 300);
};

/**
 * handels the "play and pause" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("playAndPause", () => {
  webview.executeJavaScript("__am.playAndPauseMusic();");
});

/**
 * handels "the next track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("nextTrack", () => {
  webview.executeJavaScript("__am.nextTrack();", false, () => {
    clearLyricsAndRestart();
  });
});

/**
 * handels "the previous track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("previousTrack", () => {
  webview.executeJavaScript("__am.previousTrack();", false, () => {
    clearLyricsAndRestart();
  });
});

ipcRenderer.on("forceTrackAndArtist", () => {
  sendTrackAndArtist();
  setTimeout(() => {
    webview.executeJavaScript("__am.getSongImage();", false, image => {
      ipcRenderer.send("setTrayImage", image);
    });
  }, 2000);
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("lyrics", (event: any, text: string) => {
  output.innerHTML = `${text}`;
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("resumed", () => {
  handleLyrics();
  // tslint:disable-next-line:no-console
  console.log("resumed!!");
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on("paused", () => {
  /*webview.executeJavaScript("__am.clearInterval();")
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
