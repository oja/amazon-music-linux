/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-08-26 03:26:19
 * @desc the index.html's renderer
*/
const { ipcRenderer, remote } = require('electron');
const { getTitle } = remote.require('./main');
const { APP_NAME } = require('../const');

let output;
let webview;
onload = () => {
    webview = document.getElementById('amazon-music-webview');
    output = document.getElementById('output');
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
    output.innerText = 'loading...'
}

/**
 * loading end listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
end = () => {
    output.innerText = ''
}

/**
 * DOM ready listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ready = () => {
    
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
        }else{
            setTimeout(musicStarted, 500)
        }
    })
}

/**
 * media paused listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
musicPaused = () => {
    ipcRenderer.send('appendTitle', '')
}

/**
 * console log listener
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
log = (event) => {
    console.log('guest: ' + event.message);
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
