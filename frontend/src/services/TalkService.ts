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
    dataChannel: RTCDataChannel;
    /**
     * Remote username the connection is with
     */
    remote: string;
}

export class TalkService {
    private static instance: TalkService;

    private connections: PeerConnections[];

    sendDataCallbackRef: (data: any, type: p2pEvent, receiver?: string) => void;

    handleReceivedStreamRef: (data: any) => void

    private constructor() {
        this.connections = [];
        this.sendDataCallbackRef = () => console.log('sendDataRef');
        this.handleReceivedStreamRef = () => console.log('handleMessageRef');
    }

    /**
     * Creates new or returns P2PService to be used by the app
     */
    static getInstance(): TalkService {
        if (!TalkService.instance) {
            TalkService.instance = new TalkService();
        }

        return TalkService.instance;
    }

    /**
     * Sets data streams callbacks
     * @param sendDataCallback callback function which handles connecting between peers
     * @param handleReceivedStreamCallback callback function
     */
    setCallbacks(
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any) => void,
    ) {
        this.sendDataCallbackRef = sendDataCallback;
        this.handleReceivedStreamRef = handleReceivedStreamCallback;
    }

    /**
     * Creates new peer connection object
     * @returns created peer connection object
     */
    private preparePeerConnection() {
        const peerConnection = new RTCPeerConnection();

        let dataChannel = peerConnection.createDataChannel('dataChannel');

        // eslint-disable-next-line max-len
        dataChannel.onmessage = (ev: MessageEvent<any>) => { this.handleReceivedStreamRef(ev.data); };
        dataChannel.onerror = (ev: Event) => { console.error('ERROR', ev.target); };
        dataChannel.onclose = (ev: Event) => { console.warn('Data channel closed'); };

        peerConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
            dataChannel = ev.channel;
        };

        // eslint-disable-next-line max-len
        peerConnection.ontrack = (ev: RTCTrackEvent) => { this.handleReceivedStreamRef(ev.streams); };

        return { peerConnection, dataChannel };
    }

    /**
     * Creates new P2P object, creates offer and sends it.
     * Adds created p2p object to class's connections[]
     * @param remote username of the remote peer
     */
    initConnectionWith(remote: string) : void {
        const { peerConnection, dataChannel } = this.preparePeerConnection();

        peerConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
            if (ev.candidate) {
                this.sendDataCallbackRef(ev.candidate, 'ICE', remote);
            }
        };

        peerConnection.createOffer()
        .then((offer) => {
            peerConnection.setLocalDescription(new RTCSessionDescription(offer));
            this.sendDataCallbackRef(offer, 'OFFER');
        })
        .catch((err) => console.error(err));

        const newConnectionObj: PeerConnections = {
            remote,
            connection: peerConnection,
            dataChannel,
        };

        this.connections.push(newConnectionObj);
    }

    /**
     * Handles creation of a new p2p connection, sets remoteDescription received from remote
     * Adds created p2p object to class's connections[]
     * @param remote username of remote peer
     * @param offer SessionDescription of remote peer
     */
    // eslint-disable-next-line no-undef
    handleOffer(remote: string, offer: RTCSessionDescriptionInit) {
        const { peerConnection, dataChannel } = this.preparePeerConnection();

        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        peerConnection.createAnswer()
            .then((answer) => {
                peerConnection.setLocalDescription(answer);
                this.sendDataCallbackRef(answer, 'OFFER_ANSWER');
            })
            .catch((err) => console.error(err));

        const newConnectionObj: PeerConnections = {
            remote,
            connection: peerConnection,
            dataChannel,
        };

        this.connections.push(newConnectionObj);
    }

    /**
     * Handles setting remote session for proper peer
     * @param remote username of remote peer
     * @param answer session description of remote peer
     */
    // eslint-disable-next-line no-undef
    handleAnswer(remote: string, answer: RTCSessionDescriptionInit) {
        const peerConnection = this.connections.find((item) => item.remote === remote);

        if (typeof peerConnection !== 'undefined') {
            peerConnection.connection.setRemoteDescription(new RTCSessionDescription(answer));
        } else {
            console.error('TalkService.handleAnswer(), peer', remote, 'not found');
        }
    }

    /**
     * Handles ICE Candidates from remote
     * @param remote username of remote peer
     * @param candidate remote ICECandidate to be added
     */
    // eslint-disable-next-line no-undef
    handleCandidate(remote: string, candidate: RTCIceCandidateInit) {
        const peerConnection = this.connections.find((item) => item.remote === remote);

        if (typeof peerConnection !== 'undefined') {
            peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            console.error('TalkService.handleCandidate(), peer', remote, 'not found');
        }
    }

    addTrack(remote: string, track?: MediaStreamTrack) {
        const peerConnection = this.connections.find((item) => item.remote === remote);

        if (typeof peerConnection !== 'undefined' && typeof track !== 'undefined') {
            peerConnection.connection.addTrack(track);
        } else {
            console.error('TalkService.handleCandidate(), peer', remote, 'not found');
        }
    }

    hasRemote(remote: string) : boolean {
        return this.connections.findIndex((e) => e.remote === remote) !== -1;
    }

    hasEmpty() : boolean {
        return this.connections.findIndex((e) => e.remote === '') !== -1;
    }

    sendStream(stream: MediaStream) {
        // eslint-disable-next-line no-restricted-syntax
        for (const connection of this.connections) {
            // connection.get
        }
    }
}
