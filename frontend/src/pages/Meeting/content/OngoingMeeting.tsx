import React, { useEffect, useState } from 'react';
import { IFrame } from '@stomp/stompjs';

import Canvas from '../../../components/Canvas';
import ChatContainer from '../../../components/Chat/ChatContainer';

import { useAppDispatch, useAppSelector } from '../../../hooks';
import { meetingCanvasPopChanges, meetingCanvasPushChanges, meetingChatAddMessage } from '../../../redux/ducks/meeting';

import { MeetingService } from '../../../services';

import type { ChatMessageInterface } from '../../../interfaces/Chat';
import type { PixelChanges } from '../../../interfaces/Canvas';
import { UserList } from '../../../components/RTC';

const OngoingMeeting = () : JSX.Element => {
    const [boardSubbed, setBoardSubbed] = useState<boolean>(false);
    const [chatSubbed, setChatSubbed] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const meetingService = MeetingService.getInstance();

    const meetingState = useAppSelector((state) => ({
        id: state.meeting.id,
        messages: state.meeting.messages,
        title: state.meeting.name,
        boardChanges: state.meeting.currentChanges,
        users: state.meeting.users,
    }));

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
        </div>
    );
};

export default OngoingMeeting;
