"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var isDev = require("electron-is-dev");
var settings = require("electron-settings");
var path = require("path");
var request = require("request");
var url = require("url");
var const_1 = require("./const");
// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow;
var tray;
var imageLocation;
var settingsWindow;
var shouldQuit = electron_1.app.makeSingleInstance(function (commandLine, workingDirectory) {
    if (mainWindow) {
        mainWindow.show();
    }
});
if (shouldQuit) {
    electron_1.app.quit();
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
    if (isDev) {
        imageLocation = "assets/favicon.png";
    }
    else {
        imageLocation =
            __dirname.replace("/resources/app.asar", "") + "/resources/favicon.png";
    }
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        height: 800,
        icon: path.join(__dirname, imageLocation),
        title: const_1["default"],
        webPreferences: { contextIsolation: false },
        width: 1200
    });
    mainWindow.setMenu(null);
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "main/index.html"),
        protocol: "file:",
        slashes: true
    }));
    // Open the DevTools.       DEBUG!!!!!!
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    // Emitted when the window is closed.
    mainWindow.on("closed", function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    tray = new electron_1.Tray(electron_1.nativeImage.createFromPath(imageLocation));
    var contextMenu = electron_1.Menu.buildFromTemplate([
        {
            click: function () {
                mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
            },
            label: "🎵 Toggle App"
        },
        { label: "⏭️ Next Track", type: "normal", click: nextTrack },
        { label: "⏯️ Play/Pause", type: "normal", click: playAndPause },
        { label: "⏮️ Previous Track", type: "normal", click: previousTrack },
        {
            click: function () {
                electron_1.app.quit();
            },
            label: "⏹️ Quit"
        },
        {
            click: function () {
                settingsWindow = new electron_1.BrowserWindow({
                    height: 800,
                    icon: path.join(__dirname, imageLocation),
                    title: const_1["default"],
                    width: 500
                });
                settingsWindow.setMenu(null);
                settingsWindow.loadURL(url.format({
                    pathname: path.join(__dirname, "settings/index.html"),
                    protocol: "file:",
                    slashes: true
                }));
                if (isDev) {
                    settingsWindow.webContents.openDevTools();
                }
            },
            label: "⚙️ Options"
        },
    ]);
    tray.setToolTip("Amazon Music");
    tray.setContextMenu(contextMenu);
    tray.on("click", function () {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
    mainWindow.on("minimize", function (event) {
        event.preventDefault();
        mainWindow.hide();
    });
    mainWindow.on("close", function (event) {
        event.preventDefault();
        mainWindow.hide();
        return false;
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", createWindow);
// Quit when all windows are closed.
electron_1.app.on("window-all-closed", function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", function () {
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
electron_1.ipcMain.on("appendTitle", function (event, arg) {
    mainWindow.setTitle(const_1["default"] + "\t" + arg);
});
/**
 * sets an image as tray icon
 *
 * @author Flo Dörr <flo@dörr.site>
 */
var options = {
    encoding: null,
    method: "get",
    url: url
};
electron_1.ipcMain.on("setTrayImage", function (event, arg) {
    options.url = arg;
    request(options, function (err, resp, body) {
        if (!err) {
            tray.setImage(electron_1.nativeImage.createFromBuffer(body));
        }
        else {
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
electron_1.app.on("ready", function () {
    if (electron_1.globalShortcut.register("mediaplaypause", playAndPause)) {
        // tslint:disable-next-line:no-console
        console.log("mediaplaypause registered!");
    }
    else {
        // tslint:disable-next-line:no-console
        console.log("mediaplaypause NOT registered!");
    }
    if (electron_1.globalShortcut.register("medianexttrack", nextTrack)) {
        // tslint:disable-next-line:no-console
        console.log("medianexttrack registered!");
    }
    else {
        // tslint:disable-next-line:no-console
        console.log("medianexttrack NOT registered!");
    }
    if (electron_1.globalShortcut.register("mediaprevioustrack", previousTrack)) {
        // tslint:disable-next-line:no-console
        console.log("mediaprevioustrack registered!");
    }
    else {
        // tslint:disable-next-line:no-console
        console.log("mediaprevioustrack NOT registered!");
    }
    if (electron_1.globalShortcut.register("mediastop", playAndPause)) {
        // tslint:disable-next-line:no-console
        console.log("mediastop registered!");
    }
    else {
        // tslint:disable-next-line:no-console
        console.log("mediastop NOT registered!");
    }
});
/**
 * handels the "play and pause" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
function playAndPause() {
    mainWindow.webContents.send("playAndPause");
}
/**
 * handels "the next track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
function nextTrack() {
    mainWindow.webContents.send("nextTrack");
}
/**
 * handels "the previous track" key
 *
 * @author Flo Dörr <flo@dörr.site>
 */
function previousTrack() {
    mainWindow.webContents.send("previousTrack");
}
/**
 * handels "the previous track" key
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
electron_1.ipcMain.on("lyrics", function (event, arg) {
    mainWindow.webContents.send("lyrics", arg);
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcMain.on("resumed", function () {
    mainWindow.webContents.send("resumed");
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcMain.on("paused", function () {
    mainWindow.webContents.send("paused");
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcMain.on("nextClicked", function () {
    mainWindow.webContents.send("nextClicked");
});
/**
 * handles the lyrics
 *
 * @author Flo Dörr <flo@dörr.site>
 */
electron_1.ipcMain.on("previousClicked", function () {
    mainWindow.webContents.send("previousClicked");
});
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
//# sourceMappingURL=main.js.map