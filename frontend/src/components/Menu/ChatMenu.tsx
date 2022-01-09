/* eslint-disable max-len */
import React from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { MeetingService } from '../../services';
import { ChatContainer } from '../Chat';

import type { ChatMessageInterface } from '../../interfaces/Chat';
import { toggleMenuSides } from '../../redux/ducks/menus';

const ChatMenu = () : JSX.Element => {
    const meetingService = MeetingService.getInstance();
    const dispatch = useAppDispatch();

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
        <>
        <div className={['ee-menu ee-menu-chat', appState.menuExpanded ? 'ee-menu-chat-active' : ''].join(' ')}>
            <ChatContainer
                messages={appState.messages}
                sendMessageCallback={chatSendMessageCallback}
                title="Czat spotkania"
            />
        </div>
        <button type="button" className={['ee-menu--wrapper', appState.menuExpanded ? 'ee-menu--wrapper-on' : 'ee-menu--wrapper-off'].join(' ')} onClick={() => dispatch(toggleMenuSides())}> </button>

        </>
    );
};

export default ChatMenu;
