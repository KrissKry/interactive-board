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

    connections: PeerConnections[];

    // sendDataCallbackRef: (data: any, type: p2pEvent, receiver?: string) => void;

    // handleReceivedStreamRef: (data: any, sender?: string) => void

    private constructor() {
        this.connections = [];
        // this.sendDataCallbackRef = () => console.log('sendDataRef');
        // this.handleReceivedStreamRef = () => console.log('handleMessageRef');
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
    // setCallbacks(
    //     sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
    //     handleReceivedStreamCallback: (data: any, sender?: string) => void,
    // ) {
    //     this.sendDataCallbackRef = sendDataCallback;
    //     this.handleReceivedStreamRef = handleReceivedStreamCallback;
    // }

    /**
     * Creates new peer connection object
     * @returns created peer connection object
     */
    // eslint-disable-next-line class-methods-use-this
    private preparePeerConnection() {
        const peerConnection = new RTCPeerConnection();

        let dataChannel = peerConnection.createDataChannel('dataChannel');

        // eslint-disable-next-line max-len
        // dataChannel.onmessage = (ev: MessageEvent<any>) => { this.handleReceivedStreamRef(ev.data); };
        dataChannel.onerror = (ev: Event) => { console.error('ERROR', ev.target); };
        dataChannel.onclose = (ev: Event) => { console.warn('Data channel closed'); };

        peerConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
            dataChannel = ev.channel;
        };

        return { peerConnection, dataChannel };
    }

    /**
     * Adds p2p connection with remote to self connections array
     * @param remote username of remote
     * @param con p2pConnection obj
     * @param dataChannel ref to that p2pConnection data channel
     */
    // eslint-disable-next-line max-len
    private addPeerConnection(remote: string, con: RTCPeerConnection, dataChannel: RTCDataChannel) : void {
        const newConnectionObj: PeerConnections = {
            remote,
            connection: con,
            dataChannel,
        };

        this.connections.push(newConnectionObj);
    }

    private findPeerConnection(remote: string) : PeerConnections | undefined {
        return this.connections.find((item) => item.remote === remote);
    }

    /**
     * Adds event listeners to datachannel and peerconnection
     * @param remote remote username
     * @param peerConnection remote peer connection
     * @param dataChannel remote peer datachannel
     * @param sendDataCallback
     * @param handleReceivedStreamCallback
     */
    // eslint-disable-next-line class-methods-use-this
    private setupP2P(
        remote: string,
        peerConnection: RTCPeerConnection,
        dataChannel: RTCDataChannel,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
        ) {
            dataChannel.addEventListener('message', (ev: MessageEvent<any>) => {
                console.log('[P2P] New message event', ev);
                handleReceivedStreamCallback(ev.data);
            });

            peerConnection.addEventListener('track', (ev: RTCTrackEvent) => {
                console.log('[P2P] New track event', ev);
                handleReceivedStreamCallback(ev.streams, remote);
            });

            peerConnection.addEventListener('icecandidate', (ev: RTCPeerConnectionIceEvent) => {
                if (ev.candidate === null) console.log('[P2P] All ICECandidates Sent (got null)');
                if (ev.candidate) {
                    sendDataCallback(ev.candidate, 'ICE', remote);
                }
            });

            peerConnection.addEventListener('connectionstatechange', (ev: Event) => {
                // @ts-ignore
                console.log('[P2P]', remote, 'CONNECTION_STATE CHANGE TO', ev.target?.connectionState);
            });
    }

    /**
     * Creates new P2P object, creates offer and sends it.
     * Adds created p2p object to class's connections[]
     * @param remote username of the remote peer
     */
    initConnectionWith(
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
    ) : void {
        const { peerConnection, dataChannel } = this.preparePeerConnection();

        this.addPeerConnection(remote, peerConnection, dataChannel);

        // eslint-disable-next-line max-len
        this.setupP2P(remote, peerConnection, dataChannel, sendDataCallback, handleReceivedStreamCallback);

        peerConnection.createOffer()
        .then((offer) => {
            peerConnection.setLocalDescription(new RTCSessionDescription(offer));
            sendDataCallback(offer, 'OFFER', remote);
        })
        .catch((err) => console.error(err));
    }

    /**
     * Handles creation of a new p2p connection, sets remoteDescription received from remote
     * Adds created p2p object to class's connections[]
     * @param remote username of remote peer
     * @param offer SessionDescription of remote peer
     */
    handleOffer(
        remote: string,
        // eslint-disable-next-line no-undef
        offer: RTCSessionDescriptionInit,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
    ) {
        const { peerConnection, dataChannel } = this.preparePeerConnection();

        this.addPeerConnection(remote, peerConnection, dataChannel);

        // eslint-disable-next-line max-len
        this.setupP2P(remote, peerConnection, dataChannel, sendDataCallback, handleReceivedStreamCallback);

        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        peerConnection.createAnswer()
            .then((answer) => {
                peerConnection.setLocalDescription(answer);
                sendDataCallback(answer, 'OFFER_ANSWER', remote);
            })
            .catch((err) => console.error(err));
    }

    /**
     * Handles setting remote session for proper peer
     * @param remote username of remote peer
     * @param answer session description of remote peer
     */
    // eslint-disable-next-line no-undef
    handleAnswer(remote: string, answer: RTCSessionDescriptionInit) {
        const peerConnection = this.findPeerConnection(remote);

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
        const peerConnection = this.findPeerConnection(remote);

        if (typeof peerConnection !== 'undefined') {
            peerConnection.connection.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
            console.log('TalkService.handleCandidate(), peer', remote, 'not found in', this.connections);
            throw new ReferenceError('ICE Received before session description');
        }
    }

    addTrack(remote: string, track: MediaStreamTrack) {
        const peerConnection = this.findPeerConnection(remote);

        if (typeof peerConnection !== 'undefined' && typeof track !== 'undefined') {
            console.log('adding track', track, 'to remote', remote, peerConnection);
            // peerConnection.connection.addTrack(track);
            // const transceivers = peerConnection.connection.getTransceivers();
            // if (transceivers.length) transceivers[0]
            peerConnection.connection.addTransceiver(track, {
                direction: 'sendonly',
            });
        } else {
            console.error('TalkService.addTrack(), peer', remote, 'or track', track?.id, 'not found');
        }
    }

    cleanupPrevious() {
        // eslint-disable-next-line no-restricted-syntax
        for (const p2p of this.connections) {
            p2p.dataChannel.close();
            p2p.connection.close();
            p2p.remote = '';
        }
        this.connections = [];
    }

    getTranceivers() {
        const tranceivers = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const p2p of this.connections) {
            const obj = {
                remote: p2p.remote,
                ttt: p2p.connection.getTransceivers(),
            };
            tranceivers.push({ ...obj });
        }

        return tranceivers;
    }

    hasRemote(remote: string) : boolean {
        return this.connections.findIndex((e) => e.remote === remote) !== -1;
    }

    hasEmpty() : boolean {
        return this.connections.findIndex((e) => e.remote === '') !== -1;
    }
}
