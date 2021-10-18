import { IonList } from '@ionic/react';
import React from 'react';
import { ChatMessageInterface } from '../../interfaces/Meeting';
import { VirtualChatMessage } from '../VirtualItems';

interface ChatMessagesProps {
    messages: ChatMessageInterface[];
}
const ChatMessages = ({ messages } : ChatMessagesProps) : JSX.Element => (
    <IonList className="ee-chat-container-messages">
        {messages.map((item, index) => (
            <VirtualChatMessage
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                username={item.username}
                message={item.message}
            />
        ))}
    </IonList>
);

export default ChatMessages;
