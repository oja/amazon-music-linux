[![GitHub version](https://img.shields.io/github/tag/oja/amazon-music-linux.svg)](https://github.com/oja/amazon-music-linux/releases)
[![GitHub license](https://img.shields.io/github/license/oja/amazon-music-linux.svg)](https://github.com/oja/amazon-music-linux/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/oja/amazon-music-linux.svg)](https://github.com/oja/amazon-music-linux/issues)
[![GitHub stars](https://img.shields.io/github/stars/oja/amazon-music-linux.svg)](https://github.com/oja/amazon-music-linux/stargazers)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/oja/amazon-music-linux/)
[![Open Source Love](https://badges.frapsoft.com/os/v1/open-source.svg?v=102)](https://github.com/oja/amazon-music-linux/)
[![Gluten Free](https://img.shields.io/badge/Gluten-free-green.svg)](https://github.com/oja/amazon-music-linux/)
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


## Legal Disclaimer
No affiliation with Amazon.com, Inc. All trademarks and registered trademarks are the property of their respective owners.
