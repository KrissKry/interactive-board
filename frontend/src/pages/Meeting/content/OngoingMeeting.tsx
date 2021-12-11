import React, { useEffect, useState } from 'react';
import { IFrame } from '@stomp/stompjs';
import {
    ellipsisHorizontalOutline, micOffOutline, micOutline, volumeHighOutline, volumeMuteOutline,
} from 'ionicons/icons';

import Canvas from '../../../components/Canvas';
import ChatContainer from '../../../components/Chat/ChatContainer';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
    meetingCanvasPopChanges,
    meetingCanvasPushChanges,
    meetingChatAddMessage,
    meetingRequestValidation,
    meetingUpdateTestUsers,
} from '../../../redux/ducks/meeting';

import { MeetingService } from '../../../services';

import type { ChatMessageInterface } from '../../../interfaces/Chat';
import type { PixelChanges } from '../../../interfaces/Canvas';
import { UserList } from '../../../components/RTC';
import { ButtonsPanel } from '../../../components/ButtonGroup';
import { ControlButtonPanel } from '../../../interfaces/Buttons';
import { p2p } from '../../../interfaces/Meeting';

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
        id: state.meeting.id,
        messages: state.meeting.messages,
        title: state.meeting.name,
        boardChanges: state.meeting.currentChanges,
        users: state.meeting.users,
        user: state.user.username,
    }));

    // const stream = navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    // this gon be replaced by useAppSelector => state.user.userID when ready
    // const user = 1234;

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
    const boardClearChangesCallback = () => { dispatch(meetingCanvasPopChanges()); };
    // eslint-disable-next-line max-len
    const boardSendChangesCallback = (changes: PixelChanges) => { meetingService.sendCanvasChanges(changes); };

    const boardUpdateCallback = (message: IFrame) => {
        const resp: PixelChanges = JSON.parse(message.body);
        const byteFix = 128;
        resp.color.red += byteFix;
        resp.color.green += byteFix;
        resp.color.blue += byteFix;

        console.log(resp);

        dispatch(meetingCanvasPushChanges(resp));
    };

    const meetingUpdateCallback = (message: IFrame) : void => {
        const resp = JSON.parse(message.body);
        dispatch(meetingRequestValidation(resp));
    };

    const newUserUpdateCallback = (message: IFrame) : void => {
        const newUser = JSON.parse(message.body);
        dispatch(meetingUpdateTestUsers(newUser));
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
                clearChangesCallback={boardClearChangesCallback}
                currentChanges={meetingState.boardChanges}
                sendChangesCallback={boardSendChangesCallback}
            />
            <ChatContainer
                messages={meetingState.messages}
                sendMessageCallback={chatSendMessageCallback}
                title={meetingState.title}
            />

            <UserList users={meetingState.users} />

            <ButtonsPanel buttons={controlButtons} />
        </div>
    );
};

export default OngoingMeeting;
