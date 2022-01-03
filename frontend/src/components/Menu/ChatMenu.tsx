import { IonIcon } from '@ionic/react';
import React from 'react';
import { arrowBack } from 'ionicons/icons';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { toggleChatMenu } from '../../redux/ducks/menus';

import { MeetingService } from '../../services';

import { ChatContainer } from '../Chat';
import type { ChatMessageInterface } from '../../interfaces/Chat';

const ChatMenu = () : JSX.Element => {
    const dispatch = useAppDispatch();
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
        <div className={['ee-flex--column', 'ee-menu', appState.menuExpanded ? '' : 'ee-menu--closed ee-align-cross--center'].join(' ')}>
            <button className="ee-menu--xbtn" onClick={() => dispatch(toggleChatMenu())} type="button">
                <IonIcon icon={arrowBack} className={appState.menuExpanded ? 'ee-menu--icon-active' : 'ee-menu--icon'} />
            </button>

            <ChatContainer
                expanded={appState.menuExpanded}
                messages={appState.messages}
                sendMessageCallback={chatSendMessageCallback}
                title="Czat spotkania"
            />
        </div>
    );
};

export default ChatMenu;
