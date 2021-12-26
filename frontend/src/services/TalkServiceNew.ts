/* eslint-disable max-len */
import { p2pEvent } from '../interfaces/Meeting/p2p';

/* eslint-disable no-unused-vars */
interface PeerConnection {
    /**
     * PeerConnection object to handle messages
     */
    connection: RTCPeerConnection;

    /**
     * Remote username the connection is with
     */
    remote: string;

    /**
     * Stream source (tracks) from remote
     */
    remoteStreamSrc?: MediaStream;
}

export class TalkService {
    private static instance: TalkService;

    private connections: PeerConnection[];

    private constructor() {
        this.connections = [];
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

    // eslint-disable-next-line class-methods-use-this
    private createConnectionObj(): RTCPeerConnection {
        return new RTCPeerConnection();
    }

    private setupConnectionObj(
        pc: RTCPeerConnection,
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
    ): void {
        pc.addEventListener('track', (ev: RTCTrackEvent) => this.handleNewStream(ev, remote, handleReceivedStreamCallback));

        pc.addEventListener('icecandidate', (ev: RTCPeerConnectionIceEvent) => sendDataCallback(ev.candidate, 'ICE', remote));

        pc.addEventListener('icecandidateerror', (ev: Event) => console.error('[P2P] ICE Candidate Error', remote));

        // @ts-ignore
        pc.addEventListener('connectionstatechange', (ev: Event) => console.log('[P2P] Connection state with', remote, 'changed to', ev.target.connectionState));

        pc.addEventListener('negotiationneeded', (ev: Event) => console.warn('[P2P] Connection with', remote, 'needs negotiation'));
    }

    private findRemoteP2P(remote: string): PeerConnection {
        const p2p = this.connections.find((pc) => pc.remote === remote);

        if (typeof p2p === 'undefined') throw new Error('[P2P] Remote peer does not exist');

        return p2p;
    }

    private handleNewStream(e: RTCTrackEvent, remote: string, handleReceivedStreamCallback: (data: any, sender?: string) => void): void {
        try {
            const p2p = this.findRemoteP2P(remote);
            // eslint-disable-next-line prefer-destructuring
            p2p.remoteStreamSrc = e.streams[0];

            handleReceivedStreamCallback(e.streams[0], remote);
        } catch (err) {
            console.error(err, remote);
        }
    }

    private addNewPeer(pc: RTCPeerConnection, remote: string): void {
        const prevIndex = this.connections.findIndex((connection) => connection.remote === remote);

        if (prevIndex > -1) {
            console.warn('Peer', remote, 'already declared previously. Shutting it down');

            const p2p = this.connections[prevIndex];
            // eslint-disable-next-line no-restricted-syntax
            for (const tr of p2p.connection.getTransceivers()) {
                tr.stop();
            }

            this.connections.splice(prevIndex, 1);
        }

        const newP2P: PeerConnection = {
            remote,
            connection: pc,
        };

        this.connections.push(newP2P);
    }

    public receiveQuery(
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
    ): void {
        const pc = this.createConnectionObj();
        this.setupConnectionObj(pc, remote, sendDataCallback, handleReceivedStreamCallback);
        this.addNewPeer(pc, remote);
    }

    public createOffer(
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
    ): void {
        try {
            const p2p = this.findRemoteP2P(remote);

            p2p.connection.createOffer()
            .then(
                (sdp) => {
                    p2p.connection.setLocalDescription(new RTCSessionDescription(sdp));
                    sendDataCallback(sdp, 'OFFER', remote);
                },
                (err) => console.error('[P2P]', err),
            );
        } catch (err) {
            console.error(err);
        }
    }

    public receiveOffer(
        remote: string,
        // eslint-disable-next-line no-undef
        offer: RTCSessionDescriptionInit,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
    ): void {
        try {
            const p2p = this.findRemoteP2P(remote);

            p2p.connection.setRemoteDescription(new RTCSessionDescription(offer));

            p2p.connection.createAnswer()
            .then(
                (sdp) => {
                    p2p.connection.setLocalDescription(new RTCSessionDescription(sdp));
                    sendDataCallback(sdp, 'OFFER_ANSWER', remote);
                },
                (err) => console.error('[P2P]', err),
            );
        } catch (err) {
            console.error(err);
        }
    }

    public receiveAnswer(
        remote: string,
        // eslint-disable-next-line no-undef
        answer: RTCSessionDescriptionInit,
    ): void {
        try {
            const p2p = this.findRemoteP2P(remote);

            p2p.connection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error(err);
        }
    }

    public receiveICE(
        remote: string,
        // eslint-disable-next-line no-undef
        candidate: RTCIceCandidateInit,
    ): Promise<void> {
        const p2p = this.findRemoteP2P(remote);

        return p2p.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    public addTrackToRemote(
        remote: string,
        track: MediaStreamTrack,
        stream: MediaStream,
    ): boolean {
        try {
            const p2p = this.findRemoteP2P(remote);

            const sender = p2p.connection.addTrack(track, stream);
            console.log('[P2P] Added track', track.id, 'to remote', remote, '\nsender is', sender);
            return true;
        } catch (err) {
            console.error('[P2P] Failed adding track', track.id, 'to remote', remote, err);
            return false;
        }
    }

    public get peers(): PeerConnection[] { return this.connections; }
}
