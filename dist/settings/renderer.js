"use strict";
exports.__esModule = true;
/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-11 09:19:46
 * @desc the index.html's renderer
*/
var settings = require("electron-settings");
var regionByOSCheckbox, regionDropdown, regionByOS, setRegion, dropdownMenuButton, lyricsCheck;
onload = function () {
    regionByOS = document.getElementById('region-by-os');
    regionByOSCheckbox = regionByOS.children[0].children[1].children[0];
    setRegion = document.getElementById('select-region');
    regionDropdown = setRegion.children[0].children[1].children[0].children[0];
    dropdownMenuButton = document.getElementById('dropdownMenuButton');
    lyricsCheck = document.getElementById('lyrics-check');
    regionByOSCheckbox.checked = settings.get('autoLanguage');
    lyricsCheck.checked = settings.get('lyrics');
    if (settings.has('language')) {
        dropdownMenuButton.innerText = settings.get('language');
    }
    document.getElementById('en').addEventListener('click', function () { langChanged('com'); });
    document.getElementById('de').addEventListener('click', function () { langChanged('de'); });
    document.getElementById('fr').addEventListener('click', function () { langChanged('fr'); });
    document.getElementById('it').addEventListener('click', function () { langChanged('it'); });
    document.getElementById('es').addEventListener('click', function () { langChanged('es'); });
    document.getElementById('in').addEventListener('click', function () { langChanged('in'); });
    regionByOSCheckbox.addEventListener('change', regionCheckboxChanged);
    regionCheckboxChanged();
    lyricsCheck.addEventListener('change', lyricsCheckboxChanged);
    lyricsCheckboxChanged();
};
var regionCheckboxChanged = function () {
    if (regionByOSCheckbox.checked) {
        settings.set('language', undefined);
        settings.set('autoLanguage', true);
        regionDropdown.disabled = true;
    }
    else {
        settings.set('autoLanguage', false);
        regionDropdown.disabled = false;
    }
};
var lyricsCheckboxChanged = function () {
    if (lyricsCheck.checked) {
        settings.set('lyrics', true);
    }
    else {
        settings.set('lyrics', false);
    }
};
var langChanged = function (lang) {
    settings.set('language', lang);
    dropdownMenuButton.innerText = lang;
};
//# sourceMappingURL=renderer.js.map