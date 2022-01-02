import { IonList } from '@ionic/react';
import React from 'react';
import { ChatMessageInterface } from '../../interfaces/Chat';
import { VirtualChatMessage } from '../VirtualItems';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
    messages: ChatMessageInterface[];
}
const ChatMessages = ({ messages } : ChatMessagesProps) : JSX.Element => (
    <IonList className="ee-chat-container-messages">
        {messages.map((item, index) => (
            // <VirtualChatMessage
            //     // eslint-disable-next-line react/no-array-index-key
            //     key={index}
            //     username={item.username}
            //     text={item.text}
            // />
            <ChatMessage
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                message={item}
            />
        ))}
    </IonList>
);

export default ChatMessages;
