export class AM{
    static soundEffect(soundCase){
        const soundData = {
            'lets':15,
            'pon':20
        };

        const audio = new Audio();
        let letsaudio = Math.floor(Math.random() * soundData[soundCase]);
        audio.src = `/mp3/${soundCase}_ver${letsaudio}.wav`;
        audio.play(); //audioを再生
    }

    static soundEffects(soundType){
            const audio = new Audio();
            audio.src = `/mp3/${soundType}.mp3`;
            audio.play(); //audioを再生  
    }
}
