import React, { useEffect, useRef, useState } from 'react';
import { IFrame } from '@stomp/stompjs';
import {
    ellipsisHorizontalOutline, micOffOutline, micOutline, volumeHighOutline, volumeMuteOutline,
} from 'ionicons/icons';

/* redux */
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
    meetingCanvasCleanupInitial,
    // eslint-disable-next-line max-len
    meetingCanvasPopChange, meetingCanvasPushChange, meetingChatAddMessage, meetingUpdateMiddleware, meetingUserUpdate,
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
import { UserInterface } from '../../../interfaces/User/UserInterface';

const OngoingMeeting = () : JSX.Element => {
    const [connectSubbed, setConnectSubbed] = useState<boolean>(false);
    const [usersSubbed, setUsersSubbed] = useState<boolean>(false);
    const [boardSubbed, setBoardSubbed] = useState<boolean>(false);
    const [chatSubbed, setChatSubbed] = useState<boolean>(false);
    const [p2pSubbed, setP2PSubbed] = useState<boolean>(false);

    /* communication */
    const [microphoneOn, setMicrophoneOn] = useState<boolean>(false);
    const [volumeOn, setVolumeOn] = useState<boolean>(false);
    const [ownMediaStream, setOwnMediaStream] = useState<MediaStream>();
    const toggleMicrophone = () : void => { setMicrophoneOn(!microphoneOn); };
    const toggleVolume = () : void => { setVolumeOn(!volumeOn); };

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

    const mappedUsers: UserInterface[] = meetingState.users.map((u) => ({
        avatar: '',
        name: u.name,
        active: u.status === 'CONNECTED',
    }));

    const stream = navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((str) => { setOwnMediaStream(str); })
        .catch((err) => console.error('media strim fakap', err));

    const chatUpdateCallback = (message: IFrame) => {
        const recvMessage: ChatMessageInterface = JSON.parse(message.body);
        dispatch(meetingChatAddMessage(recvMessage));
    };

    const chatSendMessageCallback = (text: string) => {
        const newMessage: ChatMessageInterface = {
            text,
            username: `${meetingState.user}`,
        };

        meetingService.sendChatMessage(newMessage);
    };

    /* board section */
    // eslint-disable-next-line max-len
    const boardSendChangesCallback = (changes: PixelChanges) => { meetingService.sendCanvasChanges(changes); };
    const boardPopChange = () : void => { dispatch(meetingCanvasPopChange()); };
    const boardCleanupInitialCallback = () : void => { dispatch(meetingCanvasCleanupInitial()); };

    const boardUpdateCallback = (message: IFrame) : void => {
        const resp: PixelChanges = JSON.parse(message.body);
        dispatch(meetingCanvasPushChange(resp));
    };

    const meetingUpdateCallback = (message: IFrame) : void => {
        const resp = JSON.parse(message.body);
        dispatch(meetingUpdateMiddleware(resp));
    };

    const newUserUpdateCallback = (message: IFrame) : void => {
        const newUser = JSON.parse(message.body);
        dispatch(meetingUserUpdate(newUser));
    };

    const sendP2PCommunication = (data: any, type: p2p.p2pEvent, receiver?: string) : void => {
        const message: p2p.p2pMessage = {
            from: meetingState.user,
            to: receiver || 'ANY',
            type,
            data,
        };

        meetingService.sendP2PMessage(message);
    };

    const handleP2PCommunication = (frame: IFrame) : void => {
        const message: p2p.p2pMessage = JSON.parse(frame.body);

        console.log('[P2P] Received message', message.type, 'from', message.from, 'to', message.to);

        /* This app instance is the receiver end */
        if ((message.to === 'ANY' || message.to === meetingState.user) && message.from !== meetingState.user) {
        switch (message.type) {
            /* On new user joining, respond with simple query answer */
            case 'QUERY':
                sendP2PCommunication({}, 'QUERY_ANSWER', message.from);
                break;

            /* initial response from another user in the meeting */
            case 'QUERY_ANSWER':
                // create peer in TalkService
                // send OFFER back to the responding client
                talkService.initConnectionWith(message.from);
                break;

            /* received offer from remote */
            case 'OFFER':
                talkService.handleOffer(message.from, message.data);
                talkService.addTrack(message.from, ownMediaStream?.getAudioTracks()[0]);
                break;

            /* received answer to own offer */
            case 'OFFER_ANSWER':
                talkService.handleAnswer(message.from, message.data);
                talkService.addTrack(message.from, ownMediaStream?.getAudioTracks()[0]);
                break;

            /* new ice candidate sent by one peer to the other */
            case 'ICE':
                talkService.handleCandidate(message.from, message.data);
                break;

            /* unknown message type */
            default:
                console.warn('[P2P] Unknown message type', message);
                break;
        }
    } else {
        console.warn('[P2P] omitting query message from self'); // , message.type, message.from, meetingState.user);
    }
    };

    const handleReceivedStream = (data: MediaStream, sender?: string) : void => {
        console.log('ReceivedStream', data, 'from', sender);
    };

    talkService.setCallbacks(sendP2PCommunication, handleReceivedStream);

    useEffect(() => {
        setTimeout(() => {
            if (meetingService.connected) {
                if (!connectSubbed) {
                    meetingService.addSubscription(`/api/room/connect/${meetingState.id}`, meetingUpdateCallback);
                    setConnectSubbed(true);
                }
                if (!usersSubbed) {
                    meetingService.addSubscription(`/topic/room.connected.${meetingState.id}`, newUserUpdateCallback);
                    setUsersSubbed(true);
                }
                if (!boardSubbed) {
                    meetingService.addSubscription(`/topic/board.listen.${meetingState.id}`, boardUpdateCallback);
                    setBoardSubbed(true);
                }
                if (!chatSubbed) {
                    meetingService.addSubscription(`/topic/chat.listen.${meetingState.id}`, chatUpdateCallback);
                    setChatSubbed(true);
                }
                if (!p2pSubbed) {
                    meetingService.addSubscription(`/topic/p2p.listen.${meetingState.id}`, handleP2PCommunication);
                    setP2PSubbed(true);
                }
                // TO-DO HANDLE DISCONNECT & RECONNECT p2p RESET
                sendP2PCommunication({}, 'QUERY');
            }
        }, 1000);
    }, [meetingService.connected]);

    useEffect(() => {
        if (typeof ownMediaStream !== 'undefined') {
            // eslint-disable-next-line no-restricted-syntax
            for (const track of ownMediaStream?.getAudioTracks()) {
                track.enabled = microphoneOn;
                console.log(track.kind, track.id, track.enabled);
            }
        }
    }, [microphoneOn]);

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

            <UserList users={mappedUsers} />

            <ButtonsPanel buttons={controlButtons} />

            <audio id="strimAudio"><track kind="captions" /></audio>
        </div>
    );
};

export default OngoingMeeting;
