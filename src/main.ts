import { BrowserWindow, Tray, NativeImage, app, ipcMain, globalShortcut, Menu, nativeImage } from "electron";
import APP_NAME from './const';
import * as path from 'path';
import * as url from 'url';
import * as request from 'request'
import * as isDev from 'electron-is-dev'
import * as settings from 'electron-settings'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow, tray: Tray, imageLocation: string, settingsWindow: BrowserWindow

let shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    mainWindow.show()
  }
})

if (shouldQuit) {
  app.quit()
}

function createWindow() {
  if (!settings.has('autoLanguage')) {
    settings.set('autoLanguage', true)
    settings.set('language', 'com')
    console.log('init set settings.');
  }
  if (!settings.has('lyrics')) {
    settings.set('lyrics', true)
    console.log('init set settings lyrics.');
  }
  if (isDev) {
    imageLocation = 'assets/favicon.png'
  } else {
    imageLocation = __dirname.replace('/resources/app.asar', '') + '/resources/favicon.png'
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: APP_NAME,
    width: 1200,
    height: 800,
    icon: path.join(__dirname, imageLocation),
    webPreferences: {contextIsolation: false},
  });
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'main/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.       DEBUG!!!!!!
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  tray = new Tray(nativeImage.createFromPath(imageLocation))
  const contextMenu = Menu.buildFromTemplate([
    { label: '🎵 Toggle App', click: () => { mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show() } },
    { label: '⏭️ Next Track', type: 'normal', click: nextTrack },
    { label: '⏯️ Play/Pause', type: 'normal', click: playAndPause },
    { label: '⏮️ Previous Track', type: 'normal', click: previousTrack },
    { label: '⏹️ Quit', click: () => { app.quit(); } },
    {
      label: '⚙️ Options', click: () => {
        settingsWindow = new BrowserWindow({
          title: APP_NAME,
          width: 500,
          height: 800,
          icon: path.join(__dirname, imageLocation),
        });
        settingsWindow.setMenu(null);

        settingsWindow.loadURL(url.format({
          pathname: path.join(__dirname, 'settings/index.html'),
          protocol: 'file:',
          slashes: true
        }))
        if (isDev) {
          settingsWindow.webContents.openDevTools()
        }
      }
    }
  ])
  tray.setToolTip('Amazon Music')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  })

  mainWindow.on('minimize', function (event: Event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event: Event) => {
    event.preventDefault();
    mainWindow.hide();
    return false;
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * appends a string to the app's title
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on('appendTitle', function (event: Event, arg: string) {
  mainWindow.setTitle(`${APP_NAME}\t${arg}`);
})

/**
 * sets an image as tray icon
 * 
 * @author Flo Dörr <flo@dörr.site>
 */

var options: any = {
  url,
  method: 'get',
  encoding: null
}

ipcMain.on('setTrayImage', function (event: Event, arg: any) {
  options.url = arg
  request(options, (err: Error, resp: any, body: Buffer) => {
    if (!err) {
      tray.setImage(nativeImage.createFromBuffer(body));
    } else {
      tray.setImage(imageLocation);
    }
  })
})

/**
 * is executed when electron is done loading
 * the following code is going to register the media keys
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
app.on('ready', () => {
  if (globalShortcut.register('mediaplaypause', playAndPause)) {
    console.log('mediaplaypause registered!');
  } else {
    console.log('mediaplaypause NOT registered!');
  }

  if (globalShortcut.register('medianexttrack', nextTrack)) {
    console.log('medianexttrack registered!');
  } else {
    console.log('medianexttrack NOT registered!');
  }

  if (globalShortcut.register('mediaprevioustrack', previousTrack)) {
    console.log('mediaprevioustrack registered!');
  } else {
    console.log('mediaprevioustrack NOT registered!');
  }

  if (globalShortcut.register('mediastop', playAndPause)) {
    console.log('mediastop registered!');
  } else {
    console.log('mediastop NOT registered!');
  }
})

/**
 * handels the 'play and pause' key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
function playAndPause() {
  mainWindow.webContents.send('playAndPause')
}

/**
 * handels 'the next track' key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
function nextTrack() {
  mainWindow.webContents.send('nextTrack')
}

/**
 * handels 'the previous track' key
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
function previousTrack() {
  mainWindow.webContents.send('previousTrack')
}

/**
 * handels 'the previous track' key
 * 
 * @returns the current app title
 * @author Flo Dörr <flo@dörr.site>
 */
exports.getTitle = function getTitle() {
  return mainWindow.getTitle();
}

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on('lyrics', (event: Event, arg: string) => {
  mainWindow.webContents.send('lyrics', arg)
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on('resumed', () => {
  mainWindow.webContents.send('resumed')
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on('paused', () => {
  mainWindow.webContents.send('paused')
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on('nextClicked', () => {
  mainWindow.webContents.send('nextClicked')
});

/**
 * handles the lyrics
 * 
 * @author Flo Dörr <flo@dörr.site>
 */
ipcMain.on('previousClicked', () => {
  mainWindow.webContents.send('previousClicked')
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
