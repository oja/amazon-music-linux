/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 03:22:35
 * @modify date 2018-09-01 06:15:10
 * @desc file to be injected into amazon music
 */

__am = {
    getMusicTitle: function () {
        return document.getElementsByClassName('trackTitle')[0].children[0].children[0].innerHTML
    },
    getArtist: function () {
        return document.getElementsByClassName('trackArtist')[0].children[0].children[0].innerHTML
    },
    getPlaylist: function () {
        return document.getElementsByClassName('trackSourceLink')[0].children[0].children[0].innerHTML
    },
    getTitle: function () {
        return __am.getMusicTitle() + " - " + __am.getArtist() + "   -   " + __am.getPlaylist()
    },
    playAndPauseMusic: function () {
        document.getElementsByClassName('playButton')[0].click()
    },
    nextTrack: function () {
        document.getElementsByClassName('button nextButton icon-fastForward transportButton')[0].click()
    },
    previousTrack: function () {
        document.getElementsByClassName('button previousButton icon-fastBackward transportButton')[0].click()
    },
    getSongImage: function () {
        return document.getElementsByClassName('renderImage')[0].src
    },
    getCurrentSongText: function () {
        setTimeout(() => {
            __am.getLines();
            __am.lyricsInterval = setInterval(__am.getLines, 600)
        }, 300)
    },
    getLines: function () {
        try {
            const lines = document.getElementsByClassName('nowPlayingLyricsContainer')[0].children[0].children;
            if (lines != undefined) {
                if (__am.highlighted == null || __am.highlighted == undefined) {
                    __am.highlighted = __am.getStart(lines);
                    __am.sendToElectron(__am.highlighted.innerHTML)

                }

                if (__am.highlighted != undefined && document.getElementById(__am.highlighted.id).classList.item(1) != 'highlighted') {
                    __am.highlighted = document.getElementById(__am.highlighted.id).nextSibling
                    __am.sendToElectron(__am.highlighted.innerHTML)
                }
            }
        } catch (error) {
            __am.clearInterval();
            __am.getCurrentSongText();
        }
    },
    getStart: function (lines) {
        try {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].classList.length == 2) {
                    return lines[i]
                }
            }
        } catch (error) {
            __am.clearInterval();
            __am.getCurrentSongText();
        }
    },
    clearInterval: function () {
        if (__am.lyricsInterval != undefined) {
            clearInterval(__am.lyricsInterval)
            __am.lyricsInterval = undefined
        }
        if (__am.highlighted != undefined) {
            __am.highlighted = undefined
        }
    },
    hasSongText: function () {
        return document.getElementsByClassName('lyricsBadge')[0].classList.length == 1
    },
    sendToElectron: function (text) {
        if (text.includes('playingEqualizer')) {
            __am.ipcRenderer.send('lyrics', '<img src="https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif" />')
        } else {
            __am.ipcRenderer.send('lyrics', text)
        }
    },
    onPlayClick: function () {
        setTimeout(() => {
            document.getElementsByClassName('playbackControls')[0].children[1].onclick = () => {
                if (document.getElementsByClassName('playbackControls')[0].children[1].classList.contains('playerIconPlay')) {
                    __am.ipcRenderer.send('resumed')
                    __am.onPlayClick();
                } else {
                    __am.ipcRenderer.send('paused')
                    __am.onPlayClick();
                }
            }
        }, 300)
    },
    onNextClick: function () {
        setTimeout(() => {
            document.getElementsByClassName('playbackControls')[0].children[2].onclick = () => {
                __am.ipcRenderer.send('nextClicked')
                __am.onNextClick();
            }
        }, 300)
    },
    onPreviousClick: function () {
        setTimeout(() => {
            document.getElementsByClassName('playbackControls')[0].children[0].onclick = () => {
                __am.ipcRenderer.send('previousClicked')
                __am.onPreviousClick();
            }
        }, 300)
    },
    getTracklist: function() {
        const trackList = new Array();
        const songList = document.getElementsByClassName("listPane")[0];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < songList.children.length; i++) {
          const currSubList = songList.children[i];
          // tslint:disable-next-line:prefer-for-of
          for (let j = 0; j < currSubList.children.length; j++) {
            const songElement = currSubList.children[j];
            // tslint:disable-next-line:no-console
            if(songElement.style.display !== "none"){
                trackList.push({
                    trackNumber: parseInt(songElement.children[2].children[0].children[0].children[0].innerHTML),
                    trackArt: songElement.children[3].children[0].children[0].children[0].children[0].src,
                    title: songElement.children[4].title,
                    album: songElement.children[4].children[3].children[0].innerHTML,
                    duration: songElement.children[5].children[0].children[0].innerHTML
                });
            }
          }
        }
        return trackList;
      },
    highlighted: undefined,
    lyricsInterval: undefined,
    ipcRenderer: require('electron').ipcRenderer
}