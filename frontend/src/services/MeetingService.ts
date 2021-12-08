import { Client, IFrame, IMessage } from '@stomp/stompjs';
import axios, { AxiosResponse } from 'axios';
import { PixelChanges } from '../interfaces/Canvas';
import { ChatMessageInterface } from '../interfaces/Chat';

export class MeetingService {
    private static instance: MeetingService;

    public client: Client | null = null;

    private connected: boolean;

    private id = '';

    private constructor() {
        this.connected = false;
        // this.client = new Client({
        //     brokerURL: 'ws://localhost:8080/board',
        //     onConnect: () => {
        //         console.log('Client connected to ws://');
        //         this.connected = true;
        //     },
        //     onStompError: (frame: IFrame) => {
        //         console.log('Broker reported error: ', frame.headers.message);
        //         console.log('Additional details: ', frame.body);
        //     },
        //     onDisconnect: () => {
        //         this.connected = false;
        //     },
        // });

        // this.client.activate();
    }

    createClient(callback:() => void, login: string, roomId: string, password?: string) : void {
        this.client = new Client({
            brokerURL: 'ws://localhost:8080/room',
            connectHeaders: {
                login,
                roomId,
                roomPassword: password || '',
            },
            onConnect: () => {
                console.log('Client connected to ws://');
                this.connected = true;
                this.id = roomId;
            },
            onStompError: (frame: IFrame) => {
                console.log('Broker reported error: ', frame.headers.message);
                console.log('Additional details: ', frame.body);
            },
            onDisconnect: () => {
                this.connected = false;
            },
        });

        this.client.activate();
    }

    static getInstance(): MeetingService {
        if (!MeetingService.instance) {
            MeetingService.instance = new MeetingService();
        }

        return MeetingService.instance;
    }

    sendCanvasChanges(changes: PixelChanges) : void {
        if (this.connected && this.client !== null) {
            this.client.publish({
                destination: `/api/board/send/${this.id}`,
                body: JSON.stringify(changes),
                skipContentLengthHeader: true,
            });
        }
    }

    sendChatMessage(message: ChatMessageInterface) : void {
        if (this.connected && this.client !== null) {
            this.client.publish({
                destination: `/api/chat/send/${this.id}`,
                body: JSON.stringify(message),
            });
        }
    }

    addSubscription(destination: string, callback: (message: IMessage) => void) : void {
        console.log('Subscribe to', destination);
        if (this.connected && this.client !== null) {
            this.client.subscribe(destination, (message: IMessage) => callback(message));
        }
    }

    getConnected() : boolean {
        // eslint-disable-next-line max-len
        if (this.client === null || this.client.connected === false || this.connected === false) return false;
        return true;
    }

    // static async fetchMeetingDataByID(id: string, password?: string) : Promise<AxiosResponse> {
    //     // TODO HASHOWANIE HASŁA
    //     const url = `adres do meeting endpoint/?id=${id}&access=${password}`;

    //     return axios.get(url);
    // }

    // eslint-disable-next-line class-methods-use-this
    static async requestNewMeeting(name: string, password?: string) : Promise<AxiosResponse> {
        const url = 'http://localhost:8080/api/room/create';

        const data = {
            name,
            password,
        };
        // TODO HASHOWANIE HASŁA
        return axios.post(url, data);
    }
}
