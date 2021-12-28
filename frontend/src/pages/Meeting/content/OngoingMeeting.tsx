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

/* util */
import {
    addAudio, createAudio, toggleIncomingAudio, toggleOutgoingAudio,
} from '../../../util/Meeting';

interface MeetingProps {
    ownMediaStream?: MediaStream;

    // eslint-disable-next-line no-unused-vars
    setOwnMediaStreamCallback: (str: MediaStream) => void;

    p2pMessages: p2p.p2pMessage[];

    popP2PMessageQ: () => void;

}

const OngoingMeeting = ({
    ownMediaStream,
    setOwnMediaStreamCallback,
    p2pMessages,
    popP2PMessageQ,
} : MeetingProps) : JSX.Element => {
    /* communication */
    // use RTC-State to indicate whether user is connecting to P2P (TO-DO)
    const [rtcState, setRTCState] = useState<p2p.rtcStatus>('INIT');
    const [microphoneOn, setMicrophoneOn] = useState<boolean>(false);
    const [volumeOn, setVolumeOn] = useState<boolean>(false);
    const [audioIdentificators, setAudioIdentificators] = useState<p2p.PeerAudioIdentifier[]>([]);

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

        const message: p2p.p2pMessage = {
            from: meetingState.user,
            to: remote || 'ANY',
            type,
            data,
        };

        meetingService.sendP2PMessage(message);
    };

    const handleReceivedStream = (data: MediaStream, remote?: string) : void => {
        const newAudioEle = createAudio(data);
        addAudio(newAudioEle, 'meetingDiv');

        const newAudioId: p2p.PeerAudioIdentifier = {
            username: remote || '',

            streamId: data.id,
        };
        setAudioIdentificators([...audioIdentificators, newAudioId]);
    };

    const handleP2PCommunication = () : void => {
        const message = p2pMessages[0];

        /* This app instance is the receiver end */
        if ((message.to === 'ANY' || message.to === meetingState.user) && message.from !== meetingState.user && typeof ownMediaStream !== 'undefined') {
            console.log('[P2P] Received', message.type, 'from', message.from);
        switch (message.type) {
            /* On new user joining, respond with offer */
            case 'QUERY':
                talkService.receiveQuery(message.from, sendP2PCommunication, handleReceivedStream);
                talkService.addTrackToRemote(message.from, ownMediaStream.getAudioTracks()[0], ownMediaStream);
                talkService.createOffer(message.from, sendP2PCommunication);
                break;

            /* received offer from remote, sends back answer */
            case 'OFFER':
                talkService.receiveQuery(message.from, sendP2PCommunication, handleReceivedStream);
                talkService.addTrackToRemote(message.from, ownMediaStream.getAudioTracks()[0], ownMediaStream);
                talkService.receiveOffer(message.from, message.data, sendP2PCommunication);
                break;

            /* received answer to own offer */
            case 'OFFER_ANSWER':
                talkService.receiveAnswer(message.from, message.data);
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
    }
        popP2PMessageQ();
    };

    useEffect(() => {
        toggleOutgoingAudio(microphoneOn, ownMediaStream);
    }, [microphoneOn]);

    useEffect(() => {
        toggleIncomingAudio(volumeOn, audioIdentificators);
    }, [volumeOn]);

    // opem media stream on meeting join & send p2p query
    useEffect(() => {
        setRTCState('CONNECTING');
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((str) => {
            console.log('NOWY STRUMIEŃ', str);
            setOwnMediaStreamCallback(str);
        })
        .then(() => {
            sendP2PCommunication({}, 'QUERY');
            setRTCState('CONNECTED');
        })
        .catch((err) => {
            setRTCState('ERROR');
            console.error(err);
            alert('W celu połączenia z mikrofonem, odśwież stronę');
        });

        // cleanup all tracks
        return () => ownMediaStream?.getTracks().forEach((track) => track.stop());
    }, []);

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

    return (
        <div className="ee-flex--row" id="meetingDiv">
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

        </div>
    );
};

export default OngoingMeeting;
