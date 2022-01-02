import React, { useEffect, useRef } from 'react';
import { ChatMessageInterface } from '../../interfaces/Chat';
import ChatMessage from './ChatMessage';

interface ChatMessagesProps {
    messages: ChatMessageInterface[];
}
const ChatMessages = ({ messages } : ChatMessagesProps) : JSX.Element => {
    const msgEndRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line no-undef
    const listRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (listRef.current === null || typeof listRef.current === 'undefined') return;

        const maxHiddenPixels = listRef.current?.scrollHeight - listRef.current?.offsetHeight;

        // if messages were scrolled less than 300px up, scroll down cha-cha real smooth
        if (listRef.current?.scrollTop + 300 > maxHiddenPixels) {
            msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="ee-chat-container-messages" ref={listRef}>
            {messages.map((item, index) => (
                <ChatMessage
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    message={item}
                />
            ))}
            <div ref={msgEndRef} />
        </div>
    );
};

export default ChatMessages;
