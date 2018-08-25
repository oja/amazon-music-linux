const { ipcRenderer } = require('electron');

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

start = () => {
    output.innerText = 'loading...'
}

end = () => {
    output.innerText = ''
}

ready = () => {
    console.log('ready!');
}

musicStarted = () => {
    webview.executeJavaScript("__am.getTitle();", false, (title) => { ipcRenderer.send('appendTitle', title) })
}

musicPaused = () => {
    ipcRenderer.send('appendTitle', '')
}

log = (event) => {
    console.log('guest: ' + event.message);
}