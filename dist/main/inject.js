/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 03:22:35
 * @modify date 2018-09-01 06:15:10
 * @desc file to be injected into amazon music
 */
"use strict";
var am = {
    getArtist: function () {
        return document.getElementsByClassName("trackArtist")[0].children[0]
            .children[0].innerHTML;
    },
    getMusicTitle: function () {
        return document.getElementsByClassName("trackTitle")[0].children[0]
            .children[0].innerHTML;
    },
    getPlaylist: function () {
        return document.getElementsByClassName("trackSourceLink")[0].children[0]
            .children[0].innerHTML;
    },
    getTitle: function () {
        return (am.getMusicTitle() + " - " + am.getArtist() + "   -   " + am.getPlaylist());
    },
    playAndPauseMusic: function () {
        document.getElementsByClassName("playButton")[0].click();
    },
    nextTrack: function () {
        document.getElementsByClassName("button nextButton icon-fastForward transportButton")[0].click();
    },
    previousTrack: function () {
        document.getElementsByClassName("button previousButton icon-fastBackward transportButton")[0].click();
    },
    getSongImage: function () {
        return document.getElementsByClassName("renderImage")[0].src;
    },
    getCurrentSongText: function () {
        setTimeout(function () {
            am.getLines();
            am.lyricsInterval = setInterval(am.getLines, 600);
        }, 300);
    },
    getLines: function () {
        try {
            var lines = document.getElementsByClassName("nowPlayingLyricsContainer")[0].children[0].children;
            if (lines !== undefined) {
                if (am.highlighted == null || am.highlighted === undefined) {
                    am.highlighted = am.getStart(lines);
                    am.sendToElectron(am.highlighted.innerHTML);
                }
                if (am.highlighted != undefined &&
                    document.getElementById(am.highlighted.id).classList.item(1) !==
                        "highlighted") {
                    am.highlighted = document.getElementById(am.highlighted.id)
                        .nextSibling;
                    am.sendToElectron(am.highlighted.innerHTML);
                }
            }
        }
        catch (error) {
            am.clearInterval();
            am.getCurrentSongText();
        }
    },
    getStart: function (lines) {
        try {
            for (var _i = 0, _a = lines.length; _i < _a.length; _i++) {
                var i = _a[_i];
                if (lines[i].classList.length === 2) {
                    return lines[i];
                }
            }
        }
        catch (error) {
            am.clearInterval();
            am.getCurrentSongText();
        }
    },
    clearInterval: function () {
        if (am.lyricsInterval !== undefined) {
            clearInterval(am.lyricsInterval);
            am.lyricsInterval = undefined;
        }
        if (am.highlighted !== undefined) {
            am.highlighted = undefined;
        }
    },
    hasSongText: function () {
        return (document.getElementsByClassName("lyricsBadge")[0].classList.length === 1);
    },
    sendToElectron: function (text) {
        if (text.indexOf("playingEqualizer") !== -1) {
            am.ipcRenderer.send("lyrics", "<img src='https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif' />");
        }
        else {
            am.ipcRenderer.send("lyrics", text);
        }
    },
    onPlayClick: function () {
        setTimeout(function () {
            document.getElementsByClassName("playbackControls")[0]
                .children[1].onclick = function () {
                if (document
                    .getElementsByClassName("playbackControls")[0]
                    .children[1].classList.contains("playerIconPlay")) {
                    am.ipcRenderer.send("resumed");
                    am.onPlayClick();
                }
                else {
                    am.ipcRenderer.send("paused");
                    am.onPlayClick();
                }
            };
        }, 300);
    },
    onNextClick: function () {
        setTimeout(function () {
            document.getElementsByClassName("playbackControls")[0]
                .children[2].onclick = function () {
                am.ipcRenderer.send("nextClicked");
                am.onNextClick();
            };
        }, 300);
    },
    onPreviousClick: function () {
        setTimeout(function () {
            document.getElementsByClassName("playbackControls")[0]
                .children[0].onclick = function () {
                am.ipcRenderer.send("previousClicked");
                am.onPreviousClick();
            };
        }, 300);
    },
    highlighted: undefined,
    lyricsInterval: undefined,
    ipcRenderer: require("electron").ipcRenderer
};
//# sourceMappingURL=inject.js.map