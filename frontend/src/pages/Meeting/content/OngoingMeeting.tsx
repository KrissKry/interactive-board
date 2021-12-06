import React, { useEffect, useState } from 'react';
import { IFrame } from '@stomp/stompjs';
import {
    ellipsisHorizontalOutline, micOffOutline, micOutline, volumeHighOutline, volumeMuteOutline,
} from 'ionicons/icons';

import Canvas from '../../../components/Canvas';
import ChatContainer from '../../../components/Chat/ChatContainer';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { meetingCanvasPopChanges, meetingCanvasPushChanges, meetingChatAddMessage } from '../../../redux/ducks/meeting';

import { MeetingService } from '../../../services';

import type { ChatMessageInterface } from '../../../interfaces/Chat';
import type { PixelChanges } from '../../../interfaces/Canvas';
import { UserList } from '../../../components/RTC';
import { ButtonsPanel } from '../../../components/ButtonGroup';
import { ControlButtonPanel } from '../../../interfaces/Buttons';

const OngoingMeeting = () : JSX.Element => {
    const [boardSubbed, setBoardSubbed] = useState<boolean>(false);
    const [chatSubbed, setChatSubbed] = useState<boolean>(false);

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
    }));

    // const stream = navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    // this gon be replaced by useAppSelector => state.user.userID when ready
    const user = 1234;

    const chatUpdateCallback = (message: IFrame) => {
        const recvMessage: ChatMessageInterface = JSON.parse(message.body);
        dispatch(meetingChatAddMessage(recvMessage));
    };

    const chatSendMessageCallback = (text: string) => {
        const newMessage: ChatMessageInterface = {
            message: text,
            username: `${user}`,
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

        dispatch(meetingCanvasPushChanges(resp));
    };

    useEffect(() => {
        setTimeout(() => {
            if (meetingService.client.connected && !boardSubbed) {
                meetingService.addSubscription('/board/listen', boardUpdateCallback);
                setBoardSubbed(true);
            }
            if (meetingService.client.connected && !chatSubbed) {
                meetingService.addSubscription('/chat/listen', chatUpdateCallback);
                setChatSubbed(true);
            }
        }, 1000);
    }, [meetingService.client.connected]);

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
