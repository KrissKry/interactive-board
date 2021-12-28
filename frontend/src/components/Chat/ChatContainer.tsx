import React from 'react';
import { ChatMessageInterface } from '../../interfaces/Chat';
import { SimpleIonicInput } from '../Input';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';

interface ChatProps {
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

const ChatContainer = ({ title, messages, sendMessageCallback } : ChatProps) : JSX.Element => (
    <div className="ee-chat-container">
        <ChatHeader title={title} />

        <ChatMessages messages={messages} />

        <SimpleIonicInput sendCallback={sendMessageCallback} />
    </div>
);

export default ChatContainer;
