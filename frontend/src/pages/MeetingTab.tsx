import React, { useEffect, useState } from 'react';
import { IFrame } from '@stomp/stompjs';

import Canvas from '../components/Canvas';
import { useAppDispatch, useAppSelector } from '../hooks';
import { MeetingService } from '../services';
import { meetingCanvasPopChanges, meetingCanvasPushChanges, meetingChatAddMessage } from '../redux/ducks/meeting';
import ChatContainer from '../components/Chat/ChatContainer';

import type { ChatMessageInterface } from '../interfaces/Chat';
import type { PixelChanges } from '../interfaces/Canvas';
import GenericTab from './GenericTab';

const MeetingTab = () => {
    const [boardSubbed, setBoardSubbed] = useState<boolean>(false);
    const [chatSubbed, setChatSubbed] = useState<boolean>(false);

    const dispatch = useAppDispatch();
    const meetingService = MeetingService.getInstance();

    const meetingMessages = useAppSelector((state) => state.meeting.messages);
    const meetingTitle = useAppSelector((state) => state.meeting.name);
    const meetingBoardChanges = useAppSelector((state) => state.meeting.currentChanges);

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
        <GenericTab title="Spotkanie">
            <div className="ee-generic-row">
                <Canvas
                    brushWidth={1}
                    clearChangesCallback={boardClearChangesCallback}
                    currentChanges={meetingBoardChanges}
                    sendChangesCallback={boardSendChangesCallback}
                />
                <ChatContainer
                    messages={meetingMessages}
                    sendMessageCallback={chatSendMessageCallback}
                    title={meetingTitle}
                />
            </div>
        </GenericTab>
    );
};

export default MeetingTab;
