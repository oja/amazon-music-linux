/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 02:38:43
 * @modify date 2018-09-11 09:19:46
 * @desc the index.html"s renderer
 */
import * as settings from "electron-settings";

let appServer: HTMLInputElement;
let appPort: HTMLInputElement;
let regionByOSCheckbox: HTMLInputElement;
let regionDropdown: HTMLInputElement;
let regionByOS: HTMLElement;
let setRegion: HTMLElement;
let dropdownMenuButton: HTMLElement;
let lyricsCheck: HTMLInputElement;

onload = () => {
  regionByOS = document.getElementById("region-by-os");
  regionByOSCheckbox = regionByOS.children[0].children[1]
    .children[0] as HTMLInputElement;
  setRegion = document.getElementById("select-region");
  regionDropdown = setRegion.children[0].children[1].children[0]
    .children[0] as HTMLInputElement;
  dropdownMenuButton = document.getElementById("dropdownMenuButton");
  lyricsCheck = document.getElementById("lyrics-check") as HTMLInputElement;
  appServer = document.getElementById("app-check") as HTMLInputElement;
  appPort = document.getElementById("app-port") as HTMLInputElement;

  regionByOSCheckbox.checked = settings.get("autoLanguage") as boolean;
  lyricsCheck.checked = settings.get("lyrics") as boolean;

  if (settings.has("language")) {
    dropdownMenuButton.innerText = settings.get("language") as string;
  }

  appPort.value = settings.get("appPort") as string;
  appServer.checked = settings.get("appServer") as boolean;
  appPort.disabled = !appServer.checked;

  document.getElementById("en").addEventListener("click", () => {
    langChanged("com");
  });
  document.getElementById("de").addEventListener("click", () => {
    langChanged("de");
  });
  document.getElementById("fr").addEventListener("click", () => {
    langChanged("fr");
  });
  document.getElementById("it").addEventListener("click", () => {
    langChanged("it");
  });
  document.getElementById("es").addEventListener("click", () => {
    langChanged("es");
  });
  document.getElementById("in").addEventListener("click", () => {
    langChanged("in");
  });

  regionByOSCheckbox.addEventListener("change", regionCheckboxChanged);
  regionCheckboxChanged();

  lyricsCheck.addEventListener("change", lyricsCheckboxChanged);
  lyricsCheckboxChanged();

  appServer.addEventListener("change", appServerToggle);
  appPort.addEventListener("change", portChanged);
};

const regionCheckboxChanged = () => {
  if (regionByOSCheckbox.checked) {
    settings.set("language", undefined);
    settings.set("autoLanguage", true);
    regionDropdown.disabled = true;
  } else {
    settings.set("autoLanguage", false);
    regionDropdown.disabled = false;
  }
};

const lyricsCheckboxChanged = () => {
  if (lyricsCheck.checked) {
    settings.set("lyrics", true);
  } else {
    settings.set("lyrics", false);
  }
};

const langChanged = (lang: string) => {
  settings.set("language", lang);
  dropdownMenuButton.innerText = lang;
};

const portChanged = () => {
  settings.set("appPort", +appPort.value);
  console.log(settings.get("appPort"));
};

const appServerToggle = () => {
  settings.set("appServer", appServer.checked);
  appPort.disabled = !appServer.checked;
};
