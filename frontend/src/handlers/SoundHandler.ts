import { popChat, popUser } from '../assets/audio';

export class SoundHandler {
    private chatSound: HTMLAudioElement;

    private userSound: HTMLAudioElement;

    private static instance: SoundHandler;

    private constructor() {
        this.chatSound = new Audio(popChat);
        this.userSound = new Audio(popUser);
    }

    static getInstance(): SoundHandler {
        if (!SoundHandler.instance) {
            SoundHandler.instance = new SoundHandler();
        }

        return SoundHandler.instance;
    }

    public popChat() {
        this.chatSound.play();
    }

    public popUser() {
        this.userSound.play();
    }
}
