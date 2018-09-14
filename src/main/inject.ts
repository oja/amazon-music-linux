/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 03:22:35
 * @modify date 2018-09-01 06:15:10
 * @desc file to be injected into amazon music
 */
"use strict";

let am = {
  getArtist: () => {
    return document.getElementsByClassName("trackArtist")[0].children[0]
      .children[0].innerHTML;
  },
  getMusicTitle: () => {
    return document.getElementsByClassName("trackTitle")[0].children[0]
      .children[0].innerHTML;
  },
  getPlaylist: () => {
    return document.getElementsByClassName("trackSourceLink")[0].children[0]
      .children[0].innerHTML;
  },
  getTitle: () => {
    return (
      am.getMusicTitle() + " - " + am.getArtist() + "   -   " + am.getPlaylist()
    );
  },
  playAndPauseMusic: () => {
    (document.getElementsByClassName("playButton")[0] as HTMLElement).click();
  },
  nextTrack: () => {
    (document.getElementsByClassName(
      "button nextButton icon-fastForward transportButton"
    )[0] as HTMLElement).click();
  },
  previousTrack: () => {
    (document.getElementsByClassName(
      "button previousButton icon-fastBackward transportButton"
    )[0] as HTMLElement).click();
  },
  getSongImage: () => {
    return (document.getElementsByClassName(
      "renderImage",
    )[0] as HTMLImageElement).src;
  },
  getCurrentSongText: () => {
    setTimeout(() => {
      am.getLines();
      am.lyricsInterval = setInterval(am.getLines, 600);
    }, 300);
  },
  getLines: () => {
    try {
      const lines = document.getElementsByClassName(
        "nowPlayingLyricsContainer",
      )[0].children[0].children;
      if (lines !== undefined) {
        if (am.highlighted == null || am.highlighted === undefined) {
          am.highlighted = am.getStart(lines);
          am.sendToElectron((am.highlighted as HTMLElement).innerHTML);
        }

        if (
          am.highlighted != undefined &&
          document.getElementById(am.highlighted.id).classList.item(1) !==
            "highlighted"
        ) {
          am.highlighted = document.getElementById(am.highlighted.id)
            .nextSibling as HTMLElement;
          am.sendToElectron(am.highlighted.innerHTML);
        }
      }
    } catch (error) {
      am.clearInterval();
      am.getCurrentSongText();
    }
  },
  getStart: (lines: any) => {
    try {
      for (const i of lines.length) {
        if (lines[i].classList.length === 2) {
          return lines[i];
        }
      }
    } catch (error) {
      am.clearInterval();
      am.getCurrentSongText();
    }
  },
  clearInterval: () => {
    if (am.lyricsInterval !== undefined) {
      clearInterval(am.lyricsInterval);
      am.lyricsInterval = undefined;
    }
    if (am.highlighted !== undefined) {
      am.highlighted = undefined;
    }
  },
  hasSongText: () => {
    return (
      document.getElementsByClassName("lyricsBadge")[0].classList.length === 1
    );
  },
  sendToElectron: (text: String) => {
    if (text.indexOf("playingEqualizer") !== -1) {
      am.ipcRenderer.send(
        "lyrics",
        "<img src='https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif' />",
      );
    } else {
      am.ipcRenderer.send("lyrics", text);
    }
  },
  onPlayClick: () => {
    setTimeout(() => {
      (document.getElementsByClassName("playbackControls")[0]
        .children[1] as HTMLElement).onclick = () => {
        if (
          document
            .getElementsByClassName("playbackControls")[0]
            .children[1].classList.contains("playerIconPlay")
        ) {
          am.ipcRenderer.send("resumed");
          am.onPlayClick();
        } else {
          am.ipcRenderer.send("paused");
          am.onPlayClick();
        }
      };
    }, 300);
  },
  onNextClick: () => {
    setTimeout(() => {
      (document.getElementsByClassName("playbackControls")[0]
        .children[2] as HTMLElement).onclick = () => {
        am.ipcRenderer.send("nextClicked");
        am.onNextClick();
      };
    }, 300);
  },
  onPreviousClick: () => {
    setTimeout(() => {
      (document.getElementsByClassName("playbackControls")[0]
        .children[0] as HTMLElement).onclick = () => {
        am.ipcRenderer.send("previousClicked");
        am.onPreviousClick();
      };
    }, 300);
  },
  highlighted: undefined as any,
  lyricsInterval: undefined as any,
  ipcRenderer: require("electron").ipcRenderer,
};
