# amazon-music-linux
A standalone app for Amazon Prime Music/Amazon Music Unlimited.

## Installation

### Prebuilt packages
`.deb` and `.rpm` packages can be downloaded [from the releases page](https://github.com/oja/amazon-music-linux/releases).

### Building from source
```
git clone https://github.com/oja/amazon-music-linux
cd amazon-music-linux
npm install
npm run package-linux
```

Then, depending on whether you want to build for Ubuntu/Debian or Fedora/openSUSE, do the following:

- Ubuntu/Debian:
  ```
  sudo npm install -g electron-installer-debian
  electron-installer-debian --src release-builds/amazon-music-linux-linux-x64/ --arch amd64 --config build-config.json
  ```

- Fedora/openSUSE:
  ```
  sudo npm install -g electron-installer-redhat
  electron-installer-redhat --src release-builds/amazon-music-linux-linux-x64/ --arch x86_64 --config build-config.json
  ```

The output `.deb` or `.rpm` file will be in the `release-builds/` directory.

## Troubleshooting
- If you get an error about `libXss.so.1`, install `libXScrnSaver` or equivalent.

## TODO
- Add a Settings Page to set language ([#12](https://github.com/oja/amazon-music-linux/issues/12)) and turn off lyrics feature ([#10](https://github.com/oja/amazon-music-linux/pull/10))

## Legal Disclaimer
No affiliation with Amazon.com, Inc. All trademarks and registered trademarks are the property of their respective owners.
