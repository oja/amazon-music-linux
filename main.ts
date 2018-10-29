import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Tray
} from "electron";
import * as isDev from "electron-is-dev";
import * as settings from "electron-settings";
import * as path from "path";
import * as request from "request";
import * as url from "url";
import * as constants from "./const";
import { Connection } from "./app-server";

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow;
let tray: Tray;
let imageLocation: string;
let settingsWindow: BrowserWindow;
let connection: Connection;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
});

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    mainWindow.show();
  }
});

if (shouldQuit) {
  app.quit();
}

function createWindow() {
  if (!settings.has("autoLanguage")) {
    settings.set("autoLanguage", true);
    settings.set("language", "com");
    // tslint:disable-next-line:no-console
    console.log("init set settings.");
  }
  if (!settings.has("lyrics")) {
    settings.set("lyrics", true);
    // tslint:disable-next-line:no-console
    console.log("init set settings lyrics.");
  }
  if (!settings.has("appServer")) {
    settings.set("appServer", true);
    // tslint:disable-next-line:no-console
    console.log("init set settings app server.");
  }
  if (!settings.has("appPort")) {
    settings.set("appPort", 3000);
    // tslint:disable-next-line:no-console
    console.log("init set settings app port.");
  }
  if (isDev) {
    imageLocation = "assets/favicon.png";
  } else {
    imageLocation =
      __dirname.replace("/resources/app.asar", "") + "/resources/favicon.png";
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    icon: path.join(__dirname, imageLocation),
    title: constants.APP_NAME,
    webPreferences: { contextIsolation: false },
    width: 1200
  });
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "main/index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Open the DevTools.       DEBUG!!!!!!
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  tray = new Tray(nativeImage.createFromPath(imageLocation));
  const contextMenu = Menu.buildFromTemplate([
    {
      click: () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
      },
      label: "🎵 Toggle App"
    },
    { label: "⏭️ Next Track", type: "normal", click: nextTrack },
    { label: "⏯️ Play/Pause", type: "normal", click: playAndPause },
    { label: "⏮️ Previous Track", type: "normal", click: previousTrack },
    {
      click: () => {
        mainWindow.removeAllListeners("close");
        mainWindow.close();
        app.quit();
      },
      label: "⏹️ Quit"
    },
    {
      click: () => {
        settingsWindow = new BrowserWindow({
          height: 800,
          icon: path.join(__dirname, imageLocation),
          title: constants.APP_NAME,
          width: 500
        });
        settingsWindow.setMenu(null);

        settingsWindow.loadURL(
          url.format({
            pathname: path.join(__dirname, "settings/index.html"),
            protocol: "file:",
            slashes: true
          })
        );
        if (isDev) {
          settingsWindow.webContents.openDevTools();
        }
      },
      label: "⚙️ Options"
    }
  ]);
  tray.setToolTip("Amazon Music");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  mainWindow.on("minimize", (event: Event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", (event: Event) => {
    event.preventDefault();
    mainWindow.hide();
    return false;
  });
  connection = new Connection();
  connection.startServer(() => {
    mainWindow.webContents.send("forceTrackAndArtist");
    connection.setListener(connection.socket, (message: string) => {
      switch (message) {
        case "playAndPause":
          mainWindow.webContents.send("playAndPause");
          break;
        case "nextTrack":
          mainWindow.webContents.send("nextTrack");
          break;
        case "previousTrack":
          mainWindow.webContents.send("previousTrack");
          break;
      }
    });
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * appends a string to the app"s title
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on("appendTitle", (event: Event, arg: string) => {
  connection.setTrack(arg);
  mainWindow.setTitle(`${constants.APP_NAME}\t${arg}`);
});

ipcMain.on("setTrackAndArtist", (event: Event, arg: String[]) => {
  connection.setTrackAndArtist(arg[0], arg[1]);
});

/**
 * sets an image as tray icon
 *
 * @author Flo Dörr <flo@dörr.site>
 */

const options: any = {
  encoding: null,
  method: "get",
  url
};

ipcMain.on("setTrayImage", (event: Event, arg: any) => {
  options.url = arg;
  request(options, (err: Error, resp: any, body: Buffer) => {
    if (!err) {
      tray.setImage(nativeImage.createFromBuffer(body));
      connection.sendTrackImage(body.toString("base64"));
    } else {
      tray.setImage(imageLocation);
    }
  });
});

/**
 * is executed when electron is done loading
 * the following code is going to register the media keys
 *
 * @author Flo Dörr <flo@dörr.site>
 */
app.on("ready", () => {
  if (globalShortcut.register("mediaplaypause", playAndPause)) {
    // tslint:disable-next-line:no-console
    console.log("mediaplaypause registered!");
  } else {
    // tslint:disable-next-line:no-console
    console.log("mediaplaypause NOT registered!");
  }

  if (globalShortcut.register("medianexttrack", nextTrack)) {
    // tslint:disable-next-line:no-console
    console.log("medianexttrack registered!");
  } else {
    // tslint:disable-next-line:no-console
    console.log("medianexttrack NOT registered!");
  }

  if (globalShortcut.register("mediaprevioustrack", previousTrack)) {
    // tslint:disable-next-line:no-console
    console.log("mediaprevioustrack registered!");
  } else {
    // tslint:disable-next-line:no-console
    console.log("mediaprevioustrack NOT registered!");
  }

  if (globalShortcut.register("mediastop", playAndPause)) {
    // tslint:disable-next-line:no-console
    console.log("mediastop registered!");
  } else {
    // tslint:disable-next-line:no-console
    console.log("mediastop NOT registered!");
  }
});

/**
 * handles the "play and pause" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
function playAndPause() {
  mainWindow.webContents.send("playAndPause");
}

/**
 * handles "the next track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
function nextTrack() {
  mainWindow.webContents.send("nextTrack");
}

/**
 * handles "the previous track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
function previousTrack() {
  mainWindow.webContents.send("previousTrack");
}

/**
 * handles "the previous track" key
 *
 * @returns the current app title
 * @author Flo Dörr <flo@dörr.site>
 */
exports.getTitle = function getTitle() {
  return mainWindow.getTitle();
};

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on("lyrics", (event: Event, arg: string) => {
  mainWindow.webContents.send("lyrics", arg);
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on("resumed", () => {
  mainWindow.webContents.send("resumed");
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on("paused", () => {
  mainWindow.webContents.send("paused");
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on("nextClicked", () => {
  mainWindow.webContents.send("nextClicked");
});

/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on("previousClicked", () => {
  mainWindow.webContents.send("previousClicked");
});

ipcMain.on("sendPlayingStatus", (event: Event, arg: boolean) => {
  connection.sendPlayingStatus(arg);
});

ipcMain.on("sendTrackName", (event: Event, arg: string) => {
  connection.setTrack(arg);
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
