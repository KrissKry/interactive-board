import React, { useEffect, useState } from 'react';
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

import { MeetingService } from '../../../services';

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
    const toggleMicrophone = () : void => { setMicrophoneOn(!microphoneOn); };
    const toggleVolume = () : void => { setVolumeOn(!volumeOn); };

    /* settings */
    const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
    const settingsCallback = () : void => { setSettingsVisible(!settingsVisible); };

    /* state */
    const dispatch = useAppDispatch();
    const meetingService = MeetingService.getInstance();

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

    // const stream = navigator.mediaDevices.getUserMedia({ audio: true, video: false });

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

        switch (message.type) {
            case 'OFFER':
                break;
            default:
                break;
        }
    };

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
            }
        }, 1000);
    }, [meetingService.connected]);

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
        </div>
    );
};

export default OngoingMeeting;
