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
     * Username of the peer that can begin negotiation event
     */
    owner: string;

    // eslint-disable-next-line no-undef
    waitingICE: RTCIceCandidateInit[];
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

    /**
     * Adds correct event handlers to peer connection events
     * @param pc PeerConnection obj that needs event handlers set
     * @param remote username of remote peer
     * @param sendDataCallback signaling handler
     * @param handleReceivedStreamCallback on stream received handler
     */
    private setupConnectionObj(
        pc: RTCPeerConnection,
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
    ): void {
        pc.addEventListener('track', (ev: RTCTrackEvent) => this.handleNewStream(ev, remote, handleReceivedStreamCallback));

        pc.addEventListener('icecandidate', (ev: RTCPeerConnectionIceEvent) => (ev.candidate ? sendDataCallback(ev.candidate, 'ICE', remote) : console.log('[P2P] All ICE Candidates sent (created null candidate).')));

        pc.addEventListener('icecandidateerror', (ev: Event) => console.error('[P2P] ICE Candidate Error', remote));

        pc.addEventListener('connectionstatechange', (ev: Event) => {
            // @ts-ignore
            console.log('[P2P] Connection state with', remote, 'changed to', ev.target.connectionState);

            // @ts-expect-error
            if (ev.target.connectionState === 'failed') {
                // if owner of the connection is self
                if (this.findRemoteP2P(remote).owner !== remote) {
                    // create another offer
                    this.createOffer(remote, sendDataCallback);
                }
            }
        });

        pc.addEventListener('negotiationneeded', (ev: Event) => {
            // if not null, then was set at least once
            if (pc.currentRemoteDescription !== null && pc.currentLocalDescription !== null) {
                try {
                    if (this.findRemoteP2P(remote).owner !== remote) {
                        console.warn('[P2P] Connection with', remote, 'needs negotiation, sending NEG_BEGIN', pc);
                        sendDataCallback({}, 'NEG_BEGIN', remote);
                    } else {
                        console.log('[P2P] Reneg needed but not owner of the connection', this.findRemoteP2P(remote).owner, remote);
                    }
                } catch (error) {
                    console.error('[P2P] Couldnt find remote, no negotiation sent');
                }
            } else {
                console.warn('[P2P] Connection with', remote, 'needs negotiation, but remoteSdp is null');
            }
        });
    }

    /**
     * Finds remote connection object for given remote user.
     * @param remote username of remote peer
     * @returns Either found Peer Connection or throws Error
     */
    private findRemoteP2P(remote: string): PeerConnection {
        const p2p = this.connections.find((pc) => pc.remote === remote);

        if (typeof p2p === 'undefined') throw new Error('[P2P] Remote peer does not exist');

        return p2p;
    }

    /**
     * Local remote stream handler, calls callback after some operations
     * @param e new track added event
     * @param remote username of remote peer
     * @param handleReceivedStreamCallback calls some other class / component method to handle the stream
     */
    private handleNewStream(e: RTCTrackEvent, remote: string, handleReceivedStreamCallback: (data: any, sender?: string) => void): void {
        try {
            const p2p = this.findRemoteP2P(remote);
            // eslint-disable-next-line prefer-destructuring
            // p2p.remoteStreamSrc = e.streams[0];

            handleReceivedStreamCallback(e.streams[0], remote);
        } catch (err) {
            console.error(err, remote);
        }
    }

    /**
     * Removes old peer connection with remote (if exists) and creates new local PeerConnection obj with ref.
     * Stores the object in this.connections
     * @param pc fresh PeerConnection created for remote
     * @param remote username of remote peer
     */
    private addNewPeer(pc: RTCPeerConnection, remote: string, owner: string): void {
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
            owner,
            waitingICE: [],
        };

        this.connections.push(newP2P);
    }

    private flushICEQueue(remote: string): void {
        const p2p = this.findRemoteP2P(remote);
        // eslint-disable-next-line no-restricted-syntax
        for (const iceCandidate of p2p.waitingICE) {
            p2p.connection.addIceCandidate(new RTCIceCandidate(iceCandidate));
        }

        p2p.waitingICE = [];
    }

    /**
     * Creates new RTCPeerConnection.
     * Then sets proper event handlers for it.
     * Then pushes reference to local this.connections for later use
     * @param remote username of remote peer
     * @param sendDataCallback signaling handler
     * @param handleReceivedStreamCallback calls some other class / component method to handle the stream
     */
    public receiveQuery(
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
        handleReceivedStreamCallback: (data: any, sender?: string) => void,
        owner: string,
    ): void {
        try {
            // if remote already exist, don't create a new object;
            this.findRemoteP2P(remote);
            return;
        } catch (error) {
            const pc = this.createConnectionObj();
            this.setupConnectionObj(pc, remote, sendDataCallback, handleReceivedStreamCallback);
            this.addNewPeer(pc, remote, owner);
        }
    }

    /**
     * Finds P2P object for remote peer. Then creates offer descriptor, sets as local and calls signaling method to handle the rest
     * @param remote username of remote peer
     * @param sendDataCallback signaling handler
     */
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

    /**
     * Finds P2P object for remote peer. Then sets remote SDP for it. Then creates an answer SDP to that offer,
     * stores it as local and calls signaling method to handle the rest
     * @param remote username of remote peer
     * @param offer Peer offer SDP
     * @param sendDataCallback signaling handler
     */
    public receiveOffer(
        remote: string,
        // eslint-disable-next-line no-undef
        offer: RTCSessionDescriptionInit,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
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
            this.flushICEQueue(remote);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Finds P2P object for remote peer. Then sets remote SDP for it.
     * @param remote username of remote peer
     * @param answer Peer answer SDP
     */
    public receiveAnswer(
        remote: string,
        // eslint-disable-next-line no-undef
        answer: RTCSessionDescriptionInit,
    ): void {
        try {
            const p2p = this.findRemoteP2P(remote);

            p2p.connection.setRemoteDescription(new RTCSessionDescription(answer));

            this.flushICEQueue(remote);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Finds P2P object for remote peer, then adds ICE candidate to it
     * @param remote username of remote peer
     * @param candidate ICE Candidate SDP
     * @returns promise to handle in some HOC
     */
    public receiveICE(
        remote: string,
        // eslint-disable-next-line no-undef
        candidate: RTCIceCandidateInit,
    ): Promise<void> {
        const p2p = this.findRemoteP2P(remote);

        return p2p.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    public createRenegotiatedOffer(
        remote: string,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
    ): void {
        const p2p = this.findRemoteP2P(remote);

        p2p.connection.createOffer()
        .then(
            (sdp) => {
                p2p.connection.setLocalDescription(new RTCSessionDescription(sdp));
                sendDataCallback(sdp, 'NEG_RECV_OFFER', remote);
            },
            (err) => console.error('[P2P] Failed to create negotiation offer'),
        );
    }

    public receiveRenegotiatedOffer(
        remote: string,
        // eslint-disable-next-line no-undef
        offer: RTCSessionDescriptionInit,
        sendDataCallback: (data: any, type: p2pEvent, receiver?: string) => void,
    ): void {
        const p2p = this.findRemoteP2P(remote);

        p2p.connection.setRemoteDescription(new RTCSessionDescription(offer))
        .then(() => p2p.connection.createAnswer())
        .then(
            (sdp) => {
                p2p.connection.setLocalDescription(new RTCSessionDescription(sdp));
                sendDataCallback(sdp, 'NEG_RECV_ANS', remote);
            },
            (err) => console.error('[P2P] Couldn`t create answer', err),
        )
        .catch((err) => console.error('[P2P] Failed on receiving new offer', err));
    }

    public receiveRenegotiatedAns(
        remote: string,
        // eslint-disable-next-line no-undef
        answer: RTCSessionDescriptionInit,
    ): void {
        const p2p = this.findRemoteP2P(remote);

        p2p.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    /**
     * Finds P2P object for remote peer, then adds track to that RTCPeerConnection
     * @param remote username of remote peer
     * @param track MediaStreamTrack (audio input)
     * @param stream MediaStream that the audio is inserted from
     * @returns whether track add was successful
     */
    public addTrackToRemote(
        remote: string,
        track?: MediaStreamTrack,
        stream?: MediaStream,
    ): boolean {
        try {
            if (typeof track === 'undefined' || typeof stream === 'undefined') throw new Error('Undefined track or stream');
            const p2p = this.findRemoteP2P(remote);

            const sender = p2p.connection.addTrack(track, stream);
            console.log('[P2P] Added track', track.id, 'to remote', remote, '\nsender is', sender);
            return true;
        } catch (err) {
            console.error('[P2P] Failed adding track', track?.id, 'to remote', remote, err);
            return false;
        }
    }

    /**
     * Get all P2P Objects stored in class
     */
    public get peers(): PeerConnection[] { return this.connections; }

    /**
     * Get a single RTCPeerConnection for requested remote peer
     * @param remote username of remote peer
     * @returns Either RTCPeerConnection or throws error
     */
    public getRemote(remote: string): RTCPeerConnection { return this.findRemoteP2P(remote).connection; }

    public replaceAudioTrack(track?: MediaStreamTrack): void {
        if (typeof track === 'undefined') {
            console.error('Track undefined');
            return;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const peer of this.connections) {
            const sender = peer.connection.getSenders().find((s) => s.track?.kind === 'audio');
            console.log('REPLACING TRACK', peer, sender);
            sender?.replaceTrack(track);
        }
    }

    public addAudioTrackToAll(track?: MediaStreamTrack, stream?: MediaStream): void {
        if (typeof track === 'undefined' || typeof stream === 'undefined') {
            console.error('Track or Stream undefined');
            return;
        }

        // eslint-disable-next-line no-restricted-syntax
        for (const peer of this.connections) {
            try {
                peer.connection.addTrack(track, stream);
            } catch (err) {
                console.error('[P2P] Couldnt add audio track to', peer.remote, err);
            }
        }
    }

    // eslint-disable-next-line no-undef
    public addICEOnHold(remote: string, descriptor: RTCIceCandidateInit): void {
        const p2p = this.findRemoteP2P(remote);
        p2p.waitingICE.push(descriptor);
    }
}
