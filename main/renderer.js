const webview = document.getElementById('amazon-music-webview');
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
webview.setAttribute('src', `https://music.amazon.${lang}/home`);