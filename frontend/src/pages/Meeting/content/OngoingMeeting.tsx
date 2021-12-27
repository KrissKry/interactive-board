/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import {
    ellipsisHorizontalOutline, micOffOutline, micOutline, volumeHighOutline, volumeMuteOutline,
} from 'ionicons/icons';
import { IonButton } from '@ionic/react';

/* redux */
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
    // eslint-disable-next-line max-len
    meetingCanvasCleanupInitial, meetingCanvasPopChange,
} from '../../../redux/ducks/meeting';

import { MeetingService, TalkService } from '../../../services';

/* components */
import { UserList } from '../../../components/RTC';
import { ButtonsPanel } from '../../../components/ButtonGroup';
import Canvas from '../../../components/Canvas';
import ChatContainer from '../../../components/Chat/ChatContainer';

/* interfaces */
import { ControlButtonPanel } from '../../../interfaces/Buttons';
import type { PixelChanges } from '../../../interfaces/Canvas';
import type { ChatMessageInterface } from '../../../interfaces/Chat';
import { p2p } from '../../../interfaces/Meeting';

interface MeetingProps {
    ownMediaStream?: MediaStream;

    // eslint-disable-next-line no-unused-vars
    setOwnMediaStreamCallback: (str: MediaStream) => void;

    p2pMessages: p2p.p2pMessage[];

    popP2PMessageQ: () => void;

    moveToEndP2PMessageQ: () => void;
}

const OngoingMeeting = ({
    ownMediaStream,
    setOwnMediaStreamCallback,
    p2pMessages,
    popP2PMessageQ,
    moveToEndP2PMessageQ,
} : MeetingProps) : JSX.Element => {
    /* communication */
    const [microphoneOn, setMicrophoneOn] = useState<boolean>(false);
    const [volumeOn, setVolumeOn] = useState<boolean>(false);
    const [remotesWOTrack, setRemotesWOTrack] = useState<string[]>([]);

    // const [ownMediaStream, setOwnMediaStream] = useState<MediaStream>();
    const toggleMicrophone = () : void => { setMicrophoneOn(!microphoneOn); };
    const toggleVolume = () : void => { setVolumeOn(!volumeOn); };
    // const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

    /* settings */
    const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
    const settingsCallback = () : void => { setSettingsVisible(!settingsVisible); };

    /* state */
    const dispatch = useAppDispatch();
    const meetingService = MeetingService.getInstance();
    const talkService = TalkService.getInstance();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.roomId,
        messages: state.meeting.messages,

        boardInitialChanges: state.meeting.pixels,
        boardChanges: state.meeting.updatingPixels,
        boardChangesWaiting: state.meeting.updatingPixels.length,

        users: state.meeting.currentUsers,
        user: state.user.username,
    }));

    // const mappedUsers: UserInterface[] = meetingState.users.map((u) => ({
    //     name: u.name,
    //     status: u.status,
    // }));

    /* chat */
    const chatSendMessageCallback = (text: string) => {
        const newMessage: ChatMessageInterface = {
            text,
            username: `${meetingState.user}`,
        };

        meetingService.sendChatMessage(newMessage);
    };

    /* board section */
    const boardSendChangesCallback = (changes: PixelChanges) => { meetingService.sendCanvasChanges(changes); };
    const boardPopChange = () : void => { dispatch(meetingCanvasPopChange()); };
    const boardCleanupInitialCallback = () : void => { dispatch(meetingCanvasCleanupInitial()); };

    /* p2p section */
    const sendP2PCommunication = (data: any, type: p2p.p2pEvent, remote?: string) : void => {
        console.log('[P2P] Sending', type, 'to', remote);
        if (type !== 'ICE' && type !== 'QUERY' && type !== 'NEG_BEGIN') console.warn('SENDING DESCRIPTOR:', data);

        // https://github.com/webrtc/samples/blob/55fc14e1e978eb48dcc97e840c0d2dfa1c6e12a0/src/content/peerconnection/webaudio-input/js/main.js
        // https://webrtc.github.io/samples/src/content/peerconnection/upgrade/
        const message: p2p.p2pMessage = {
            from: meetingState.user,
            to: remote || 'ANY',
            type,
            data,
        };

        meetingService.sendP2PMessage(message);
    };

    const handleReceivedStream = (data: RTCTrackEvent, remote?: string) : void => {
        console.log('ReceivedStream', data, 'from', remote);
    };

    const updateTrackForRemote = () : void => {
        if (!remotesWOTrack.length) return;

        const remote = remotesWOTrack[0];

        if (typeof ownMediaStream !== 'undefined') {
            // get first audio track
            const track = ownMediaStream.getAudioTracks()[0];

            // if track exists
            if (track !== null && typeof track !== 'undefined') {
                // if adding track to remote fails
                if (talkService.addTrackToRemote(remote, track, ownMediaStream) === true) {
                    // remove from remotes without track
                    setRemotesWOTrack([...remotesWOTrack.filter((item, index) => index !== 0)]);
                }
            }
        } else {
            console.warn('[P2P] No tracks can be added as stream is', typeof ownMediaStream);
        }
    };

    const addRemoteWithoutTrack = (remote: string): void => { setRemotesWOTrack([...remotesWOTrack, remote]); };

    const handleP2PCommunication = () : void => {
        const message = p2pMessages[0];

        /* This app instance is the receiver end */
        if ((message.to === 'ANY' || message.to === meetingState.user) && message.from !== meetingState.user) {
        switch (message.type) {
            /* On new user joining, respond with offer */
            case 'QUERY':
                talkService.receiveQuery(message.from, sendP2PCommunication, handleReceivedStream);
                talkService.createOffer(message.from, sendP2PCommunication);
                break;

            /* received offer from remote, sends back answer */
            case 'OFFER':
                talkService.receiveOffer(message.from, message.data, sendP2PCommunication, handleReceivedStream);
                addRemoteWithoutTrack(message.from);
                break;

            /* received answer to own offer */
            case 'OFFER_ANSWER':
                talkService.receiveAnswer(message.from, message.data);
                addRemoteWithoutTrack(message.from);
                break;

            /* new ice candidate sent by one peer to the other */
            case 'ICE':
                talkService.receiveICE(message.from, message.data)
                .then(
                    () => console.log('[M] Added ICE'),
                    (err) => console.error('[M]', err),
                );
                break;

            /* Negotiation request received from remote (create new offer and send it) */
            case 'NEG_BEGIN':
                talkService.createRenegotiatedOffer(message.from, sendP2PCommunication);
                break;

            /* Negotiation offer received from remote (update remote sdp and create ans) */
            case 'NEG_RECV_OFFER':
                talkService.receiveRenegotiatedOffer(message.from, message.data, sendP2PCommunication);
                break;

            /* Negotiation answer received from remote (update remote sdp) */
            case 'NEG_RECV_ANS':
                talkService.receiveRenegotiatedAns(message.from, message.data);
                break;

            /* unknown message type */
            default:
                console.warn('[P2P] Unknown message type', message);
                break;
        }
    } else {
        const isSender = message.from === meetingState.user;
        const isReceiver = message.to === 'ANY' || message.to === meetingState.user;
        // console.log('[P2P] omitting', message.type, 'IS_SENDER', isSender, 'IS_RECV', isReceiver);
    }
        popP2PMessageQ();
    };

    useEffect(() => {
        if (typeof ownMediaStream !== 'undefined') {
            // eslint-disable-next-line no-restricted-syntax
            for (const track of ownMediaStream.getAudioTracks()) {
                track.enabled = microphoneOn;
                console.log(track.kind, track.id, track.enabled);
            }
        }
    }, [microphoneOn]);

    // opem media stream on meeting join & send p2p query
    useEffect(() => {
        sendP2PCommunication({}, 'QUERY');

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((str) => {
            console.log('NOWY STRUMIEŃ', str);
            // str.getAudioTracks().forEach((track) => talkService.add)
            setOwnMediaStreamCallback(str);
        })
        .catch((err) => alert('W celu połączenia z mikrofonem, odśwież stronę'));

        // cleanup all tracks
        return () => ownMediaStream?.getTracks().forEach((track) => track.stop());
    }, []);

    useEffect(() => {
        updateTrackForRemote();
    }, [remotesWOTrack]);

    useEffect(() => {
        if (p2pMessages.length) handleP2PCommunication();
    }, [p2pMessages]);

    const controlButtons : ControlButtonPanel[] = [
        {
            id: 'mic',
            icon: micOutline,
            iconFalse: micOffOutline,
            state: microphoneOn,
            callback: toggleMicrophone,
        },
        {
            id: 'vol',
            icon: volumeHighOutline,
            iconFalse: volumeMuteOutline,
            state: volumeOn,
            callback: toggleVolume,
        },
        {
            id: 'settings',
            icon: ellipsisHorizontalOutline,
            callback: settingsCallback,
        },
    ];

    const printTransceivers = () : void => {
        const tt = talkService.peers;
        console.log(tt);
    };

    return (
        <div className="ee-flex--row">
            <Canvas
                brushWidth={1}
                changesWaiting={!!meetingState.boardChangesWaiting}
                currentChanges={meetingState.boardChanges}
                initialChanges={meetingState.boardInitialChanges}
                cleanupInitialCallback={boardCleanupInitialCallback}
                popChangeCallback={boardPopChange}
                sendChangesCallback={boardSendChangesCallback}
            />
            <ChatContainer
                messages={meetingState.messages}
                sendMessageCallback={chatSendMessageCallback}
                title=""
            />

            <UserList users={meetingState.users} />

            <ButtonsPanel buttons={controlButtons} />

            <IonButton onClick={() => printTransceivers()}>pika</IonButton>
            <audio id="strimAudio"><track kind="captions" /></audio>
        </div>
    );
};

export default OngoingMeeting;
