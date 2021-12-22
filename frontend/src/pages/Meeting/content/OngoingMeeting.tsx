/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import {
    ellipsisHorizontalOutline, micOffOutline, micOutline, volumeHighOutline, volumeMuteOutline,
} from 'ionicons/icons';

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
        const message: p2p.p2pMessage = {
            from: meetingState.user,
            to: remote || 'ANY',
            type,
            data,
        };

        meetingService.sendP2PMessage(message);
    };

    const handleReceivedStream = (data: any, sender?: string) : void => {
        console.log('ReceivedStream', data, 'from', sender);
    };

    const handleNewOffer = (from: string, data: any) : void => {
        if (typeof ownMediaStream !== 'undefined' && ownMediaStream.getAudioTracks().length) {
            console.log('handling new Offer');
            talkService.handleOffer(from, data, sendP2PCommunication, handleReceivedStream);
            talkService.addTrack(from, ownMediaStream.getAudioTracks()[0]);
        } else {
            console.log('timeout for offer');
            setTimeout(() => handleNewOffer(from, data), 1000);
        }
    };

    const handleNewAnswer = (from: string, data: any) : void => {
        if (typeof ownMediaStream !== 'undefined' && ownMediaStream.getAudioTracks().length) {
            console.log('handling new answer');
            talkService.handleAnswer(from, data);
            talkService.addTrack(from, ownMediaStream.getAudioTracks()[0]);
        } else {
            console.log('timeout new answer');
            setTimeout(() => handleNewAnswer(from, data), 1000);
        }
    };

    const handleP2PCommunication = () : void => {
        const message = p2pMessages[0];

        /* This app instance is the receiver end */
        if ((message.to === 'ANY' || message.to === meetingState.user) && message.from !== meetingState.user) {
        switch (message.type) {
            /* On new user joining, respond with simple query answer */
            case 'QUERY':
                sendP2PCommunication({}, 'QUERY_ANSWER', message.from);
                break;

            /* initial response from another user in the meeting */
            case 'QUERY_ANSWER':
                talkService.initConnectionWith(message.from, sendP2PCommunication, handleReceivedStream);
                break;

            /* received offer from remote */
            case 'OFFER':
                handleNewOffer(message.from, message.data);
                break;

            /* received answer to own offer */
            case 'OFFER_ANSWER':
                handleNewAnswer(message.from, message.data);
                break;

            /* new ice candidate sent by one peer to the other */
            case 'ICE':
                try {
                    talkService.handleCandidate(message.from, message.data);
                } catch (error) {
                    if (error instanceof ReferenceError) moveToEndP2PMessageQ();
                }
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
            setOwnMediaStreamCallback(str);
        })
        .catch((err) => console.error('media strim fakap', err));

        // cleanup all tracks
        return () => ownMediaStream?.getTracks().forEach((track) => track.stop());
    }, []);

    useEffect(() => {
        if (p2pMessages.length) handleP2PCommunication();
    }, [p2pMessages]);

    useEffect(() => {
        console.log(talkService.getTranceivers());
    }, [talkService.connections]);

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

            <audio id="strimAudio"><track kind="captions" /></audio>
        </div>
    );
};

export default OngoingMeeting;
