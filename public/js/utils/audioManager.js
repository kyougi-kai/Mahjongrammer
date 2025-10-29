export class AM{
    static soundEffect(soundCase){
        const soundData = {
            'lets':14,
            'pon':19
        };

        const audio = new Audio();
        let letsaudio = Math.floor(Math.random() * soundData[soundCase]) + 1;
        audio.src = `/mp3/${soundCase}_ver${letsaudio}.wav`;
        audio.play(); //audioを再生
    }

    static soundEffects(soundType){
            const audio = new Audio();
            audio.src = `/mp3/${soundType}.mp3`;
            audio.play(); //audioを再生  
    }
    
    static bgmStart(){
        const bgm = new Audio();
        bgm.src = "mp3/bgm/グラ麻雀ゲームBGM_Let'sGrammahjong - 20251029 11.03.mp3";
        bgm.loop = true;
        bgm.play(); //audioを再生
    }
}
