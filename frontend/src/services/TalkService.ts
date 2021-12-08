interface PeerConnections {
    /**
     * PeerConnection object to handle messages
     */
    connection: RTCPeerConnection;

    /**
     * Remote username the connection is with
     */
    with: string;
}

export class TalkService {
    private static instance: TalkService;

    private connections: PeerConnections[];

    private constructor() {
        this.connections = [];
    }

    static getInstance(): TalkService {
        if (!TalkService.instance) {
            TalkService.instance = new TalkService();
        }

        return TalkService.instance;
    }

    // eslint-disable-next-line class-methods-use-this
    preparePeerConnection(
        sendDataCallback: (data: any, type: 'ICE') => void,
        handleReceivedMessage: (data: any) => void,
    ) {
        const peerConnection = new RTCPeerConnection();

        peerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
            if (ev.candidate) {
                sendDataCallback(ev.candidate, 'ICE');
            }
        };

        let dataChannel = peerConnection.createDataChannel('dataChannel');

        dataChannel.onmessage = (ev: MessageEvent<any>) => { handleReceivedMessage(ev.data); };
        dataChannel.onerror = (ev: Event) => { console.error('ERROR', ev.target); };
        dataChannel.onclose = (ev: Event) => { console.warn('Data channel closed'); };

        peerConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
            dataChannel = ev.channel;
        };
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
