import React from 'react';
import { ChatMessageInterface } from '../../interfaces/Chat';
import { SimpleIonicInput } from '../Input';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';

interface ChatProps {
    expanded: boolean;

    /**
     * Display name of the chat in the header
     */
    title: string;

    /**
     * Current messages to display
     */
    messages: ChatMessageInterface[];

    /**
     * Called on 'Send Button' click or 'Enter' pressed
     */
    // eslint-disable-next-line no-unused-vars
    sendMessageCallback: (text: string) => void;
}

const ChatContainer = ({
    expanded,
    title,
    messages,
    sendMessageCallback,
} : ChatProps) : JSX.Element => (
    <div className="ee-chat-container-2" style={{ display: expanded ? 'block' : 'none' }}>
        <ChatHeader title={title} />

        <ChatMessages messages={messages} />

        <SimpleIonicInput sendCallback={sendMessageCallback} allowEmpty={false} />
    </div>
);

export default ChatContainer;
