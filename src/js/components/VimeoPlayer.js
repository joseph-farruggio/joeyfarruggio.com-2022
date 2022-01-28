
import Alpine from 'alpinejs';
import Player from '@vimeo/player';

const initVimeoPlayer = () => {
    Alpine.data('player', (
        playerID, 
        iframe = new Player(document.getElementById(playerID)),
    ) => ({
        playing: false,
        show: true,
        firstPlay: true,

        toggleVideo() {
            this.firstPlay = false;

            if (this.playing) {
            iframe.pause();
            this.show = true;
            } else {
            iframe.play();
            setTimeout(() => {
                this.show = false;
            }, 1000)
            }
            this.playing = !this.playing;

            var here = this;
            iframe.on('ended', function(data) {
                here.playing = false;
            });
        },
        
        
    }));
}

export default initVimeoPlayer;