/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-11 08:38:36
 * @desc the index.html's renderer
*/
const settings = require('electron-settings');

let regionByOSCheckbox, regionDropdown, regionByOS, setRegion, dropdownMenuButton

onload = () => {
    regionByOS = document.getElementById('region-by-os')
    regionByOSCheckbox = regionByOS.children[0].children[1].children[0]
    setRegion = document.getElementById('select-region')
    regionDropdown = setRegion.children[0].children[1].children[0].children[0]
    dropdownMenuButton = document.getElementById('dropdownMenuButton')

    regionByOSCheckbox.checked = settings.get('autoLanguage')

    if (settings.has('language')) {
        dropdownMenuButton.innerText = settings.get('language')
    }

    document.getElementById('en').addEventListener('click', () => { langChanged('com') })
    document.getElementById('de').addEventListener('click', () => { langChanged('de') })
    document.getElementById('fr').addEventListener('click', () => { langChanged('fr') })
    document.getElementById('it').addEventListener('click', () => { langChanged('it') })
    document.getElementById('es').addEventListener('click', () => { langChanged('es') })
    document.getElementById('in').addEventListener('click', () => { langChanged('in') })


    regionByOSCheckbox.addEventListener('change', checkboxChanged)
    checkboxChanged();
}

checkboxChanged = () => {
    if (regionByOSCheckbox.checked) {
        settings.set('language', undefined)
        settings.set('autoLanguage', true)
        regionDropdown.disabled = true;
    } else {
        settings.set('autoLanguage', false)
        regionDropdown.disabled = false;
    }
}

langChanged = (lang) => {
    settings.set('language', lang)
    dropdownMenuButton.innerText = lang
}