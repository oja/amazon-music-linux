/**
 * @author Flo Dörr
 * @email flo@dörr.site
 * @create date 2018-08-26 03:22:35
 * @modify date 2018-08-27 02:28:41
 * @desc file to be injected into amazon music
*/
__am = {
    getMusicTitle: function () {
        return document.getElementsByClassName('trackTitle')[0].children[0].children[0].innerHTML
    }, getArtist: function () {
        return document.getElementsByClassName('trackArtist')[0].children[0].children[0].innerHTML
    }, getPlaylist: function () {
        return document.getElementsByClassName('trackSourceLink')[0].children[0].children[0].innerHTML
    }, getTitle: function () {
        return __am.getMusicTitle() + " - " + __am.getArtist() + "   -   " + __am.getPlaylist()
    }, playAndPauseMusic: function () {
        document.getElementsByClassName('playButton')[0].click()
    }, nextTrack: function () {
        document.getElementsByClassName('button nextButton icon-fastForward transportButton')[0].click()
    }, previousTrack: function () {
        document.getElementsByClassName('button previousButton icon-fastBackward transportButton')[0].click()
    }, getSongImage: function () {
        return document.getElementsByClassName('renderImage')[0].src
    }
}