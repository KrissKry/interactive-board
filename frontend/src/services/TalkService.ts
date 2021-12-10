import { p2pEvent } from '../interfaces/Meeting/p2p';

/* eslint-disable no-unused-vars */
interface PeerConnections {
    /**
     * PeerConnection object to handle messages
     */
    connection: RTCPeerConnection;

    /**
     * PeerConnection data channel
     */
    // channel: RTCDataChannel;
    /**
     * Remote username the connection is with
     */
    remote: string;
}

export class TalkService {
    private static instance: TalkService;

    private connections: PeerConnections[];

    // eslint-disable-next-line no-undef
    private ownOffer: RTCSessionDescriptionInit;

    sendDataCallbackRef: (data: any, type: p2pEvent) => void;

    handleReceivedStreamRef: (data: any) => void

    private constructor() {
        this.connections = [];
        this.sendDataCallbackRef = () => console.log('sendDataRef');
        this.handleReceivedStreamRef = () => console.log('handleMessageRef');
        // eslint-disable-next-line no-undef
        this.ownOffer = {} as RTCSessionDescriptionInit;
    }

    static getInstance(): TalkService {
        if (!TalkService.instance) {
            TalkService.instance = new TalkService();
        }

        return TalkService.instance;
    }

    setCallbacks(
        sendDataCallback: (data: any, type: string) => void,
        handleReceivedStreamCallback: (data: any) => void,
    ) {
        this.sendDataCallbackRef = sendDataCallback;
        this.handleReceivedStreamRef = handleReceivedStreamCallback;
    }

    // eslint-disable-next-line class-methods-use-this
    private preparePeerConnection() : RTCPeerConnection {
        const peerConnection = new RTCPeerConnection();

        let dataChannel = peerConnection.createDataChannel('dataChannel');

        // eslint-disable-next-line max-len
        dataChannel.onmessage = (ev: MessageEvent<any>) => { this.handleReceivedStreamRef(ev.data); };
        dataChannel.onerror = (ev: Event) => { console.error('ERROR', ev.target); };
        dataChannel.onclose = (ev: Event) => { console.warn('Data channel closed'); };

        peerConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
            dataChannel = ev.channel;
        };

        return peerConnection;
    }

    // eslint-disable-next-line no-undef
    handleOffer(from: string, offer: RTCSessionDescriptionInit) {
        const peerConnection = this.preparePeerConnection();

        peerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
            if (ev.candidate) {
                this.sendDataCallbackRef(ev.candidate, 'ICE');
            }
        };

        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        peerConnection.createAnswer()
            .then((answer) => {
                peerConnection.setLocalDescription(answer);
                this.sendDataCallbackRef(answer, 'ANSWER');
            })
            .catch((err) => console.error(err));

        const newConnectionObj: PeerConnections = {
            remote: from,

            connection: peerConnection,
        };

        this.connections.push(newConnectionObj);
    }

    // eslint-disable-next-line no-undef
    handleAnswer(from: string, answer: RTCSessionDescriptionInit) {
        const peerConnection = this.connections.find((item) => item.remote === from);

        peerConnection?.connection.setRemoteDescription(new RTCSessionDescription(answer));
        // if (typeof peerConnection === 'undefined') peerConnection = this.preparePeerConnection();
    }

    // eslint-disable-next-line no-undef
    handleCandidate(from: string, candidate: RTCIceCandidateInit) {
        const peerConnection = this.connections.find((item) => item.remote === from);

        peerConnection?.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    createPeer() {
        const peerConnection = this.preparePeerConnection();
        const remote = '';
        peerConnection.setLocalDescription();
        this.connections.push({
            connection: peerConnection,
            remote,
        });
    }

    hasRemote(remote: string) : boolean {
        return this.connections.findIndex((e) => e.remote === remote) !== -1;
    }

    hasEmpty() : boolean {
        return this.connections.findIndex((e) => e.remote === '') !== -1;
    }
    // createPeerConnection(
    //     sendDataCallback: (data: any, type: 'CANDIDATE' | 'OFFER') => void,
    //     receiveMessageCallback: (data: any) => void,
    // ) {
    //     const peerConnection = new RTCPeerConnection();

    //     peerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
    //         if (ev.candidate) {
    //             sendDataCallback(ev.candidate, 'CANDIDATE');
    //         }
    //     };
    //     const dataChannel = peerConnection.createDataChannel('dataChannel');

    //     dataChannel.onmessage = (ev: MessageEvent<any>) => { receiveMessageCallback(ev.data); };
    //     dataChannel.onerror = (ev: Event) => { console.error('ERROR', ev.target); };
    //     dataChannel.onclose = (ev: Event) => { console.warn('Data channel closed'); };

    //     peerConnection.createOffer()
    //         .then((offer) => {
    //             peerConnection.setLocalDescription(offer);
    //             sendDataCallback(offer, 'OFFER');
    //         })
    //         .catch((err) => console.error(err));
    //     this.connections.push(peerConnection);
    // }

    // answerToConnectionRequest(
    //     // eslint-disable-next-line no-undef
    //     receivedOffer: RTCSessionDescriptionInit,
    //     // eslint-disable-next-line no-undef
    //     answerCallback: (answer: RTCSessionDescriptionInit) => void,
    // ) {
    //     const peerConnection = new RTCPeerConnection();
    //     peerConnection.setRemoteDescription(receivedOffer);
    //     peerConnection.createAnswer()
    //     .then((answer) => {
    //         answerCallback(answer);
    //         this.connections.push(peerConnection);
    //     })
    //     .catch((err) => console.error(err));
    // }

    sendStream(stream: MediaStream) {
        // eslint-disable-next-line no-restricted-syntax
        for (const connection of this.connections) {
            // connection.get
        }
    }
}
