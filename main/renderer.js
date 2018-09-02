/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-01 06:15:04
 * @desc the index.html's renderer
*/
const { ipcRenderer, remote } = require('electron');
const { getTitle } = remote.require('./main');
const { APP_NAME } = require('../const');

let output, outputWrapper, webview;
let expanded = true;
let blueLoop = '<img src="https://m.media-amazon.com/images/G/01/digital/music/player/web/dragonfly/eqSmBlueLoop.gif" />'
onload = () => {
    webview = document.getElementById('amazon-music-webview');
    output = document.getElementById('output');
    outputWrapper = document.getElementById('output-wrapper');
    let lang;
    switch (navigator.language.split('-')[0]) {
        case "en":
            lang = "com"
            break;
        case "de":
            lang = "de"
            break;
        case "fr":
            lang = "fr"
            break;
        case "it":
            lang = "it"
            break;
        case "es":
            lang = "es"
            break;
        case "in":
            lang = "in"
            break;
        default:
            lang = "com"
    }
    webview.setAttribute('src', `https://music.amazon.${lang}/home?output=embed`);

    webview.addEventListener('did-start-loading', start)
    webview.addEventListener('did-stop-loading', end)
    webview.addEventListener('dom-ready', ready)
    webview.addEventListener('media-started-playing', musicStarted)
    webview.addEventListener('media-paused', musicPaused)
    webview.addEventListener('console-message', log(event))
}


/**
 * loading start listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
start = () => {
    showOutput();
    output.innerHTML = blueLoop;
}

/**
 * loading end listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
end = () => {
    output.innerHTML = ''
    closeOutput();
}

/**
 * DOM ready listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ready = () => {
    //DEBUG!!!!!!!
    // webview.openDevTools()
}

/**
 * media started listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
musicStarted = () => {
    webview.executeJavaScript("__am.getTitle();", false, (title) => {
        if (getTitle() != `${APP_NAME}\t${title}`) {
            ipcRenderer.send('appendTitle', title)
        } else {
            setTimeout(musicStarted, 500)
        }
    })
    webview.executeJavaScript('__am.getSongImage();', false, (image) => {
        ipcRenderer.send('setTrayImage', image)
    })
    webview.executeJavaScript("__am.hasSongText();", false, (textAv) => {
        webview.executeJavaScript("__am.clearInterval();", false, () => {
            if (textAv) {
                webview.executeJavaScript("__am.getCurrentSongText();")
            }
        })
    })
}

/**
 * media paused listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
musicPaused = () => {
    //webview.executeJavaScript("__am.clearInterval();")
    ipcRenderer.send('appendTitle', '')
    closeOutput();
}

/**
 * console log listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
log = (event) => {
    console.log('guest: ' + event.message);
}

showOutput = () => {
    if (expanded) {
        outputWrapper.style.visibility = 'visible'
        webview.style.height = '97%'
        expanded = false
    }
}

closeOutput = () => {
    if (!expanded) {
        outputWrapper.style.visibility = 'hidden'
        webview.style.height = '100%'
        expanded = true
    }
}

/**
 * handels the 'play and pause' key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on('playAndPause', () => {
    webview.executeJavaScript("__am.playAndPauseMusic();")
});

/**
 * handels 'the next track' key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on('nextTrack', () => {
    webview.executeJavaScript("__am.nextTrack();", false, () => {
        musicStarted();
    })
});

/**
 * handels 'the previous track' key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on('previousTrack', () => {
    webview.executeJavaScript("__am.previousTrack();", false, () => {
        musicStarted();
    })
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcRenderer.on('lyrics', (event, text) => {
    showOutput();
    output.innerHTML = `${text}`
});
