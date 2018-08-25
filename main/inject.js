__am={
    getMusicTitle: function(){
        return document.getElementsByClassName('trackTitle')[0].children[0].children[0].innerHTML
    },getArtist: function(){
        return document.getElementsByClassName('trackArtist')[0].children[0].children[0].innerHTML
    },getPlaylist: function(){
        return document.getElementsByClassName('trackSourceLink')[0].children[0].children[0].innerHTML
    },getTitle: function(){
        return __am.getMusicTitle() + " - " + __am.getArtist() + "   -   " + __am.getPlaylist()
    },pauseMusic: function(){
        document.getElementsByClassName('playButton')[0].click();
    }
}