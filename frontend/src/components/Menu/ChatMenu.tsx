/* eslint-disable max-len */
import React from 'react';

import { useAppSelector } from '../../hooks';
import { MeetingService } from '../../services';
import { ChatContainer } from '../Chat';

import type { ChatMessageInterface } from '../../interfaces/Chat';

const ChatMenu = () : JSX.Element => {
    const meetingService = MeetingService.getInstance();
    const appState = useAppSelector((state) => ({
        messages: state.meeting.messages,
        user: state.user.username,
        menuExpanded: state.menus.chatExpanded,
    }));

    /* chat */
    const chatSendMessageCallback = (text: string) => {
        const newMessage: ChatMessageInterface = {
            text,
            username: `${appState.user}`,
        };

        meetingService.sendChatMessage(newMessage);
    };

    return (
        <div className={['ee-menu ee-menu-chat', appState.menuExpanded ? 'ee-menu-chat-active' : ''].join(' ')}>
            <ChatContainer
                messages={appState.messages}
                sendMessageCallback={chatSendMessageCallback}
                title="Czat spotkania"
            />
        </div>
    );
};

export default ChatMenu;
