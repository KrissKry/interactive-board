import React from 'react';
import { useAppSelector } from '../../hooks';
import { ChatMessageInterface } from '../../interfaces/Chat';

interface MessageProps {
    message: ChatMessageInterface;
}

const ChatMessage = ({ message }: MessageProps) : JSX.Element => {
    const user = useAppSelector((state) => state.user.username);

    if (!message.text.length) return (<></>);

    return (
        <div className="ee-flex--row" style={{ justifyContent: message.username === user ? 'flex-end' : 'flex-start' }}>

            <div className="ee-message--container">
                <p className="ee-text-size--tiny ee-text-color--grey ee-message--username" style={{ display: message.username === user ? 'none' : 'block' }}>{message.username}</p>

                <div className={[message.username === user ? 'ee-message--self' : 'ee-message--foreign', ' ee-message--content'].join(' ')}>

                    <div className="ee-padding--035">
                        <p className="ee-text-size--regular ee-text-color--white ee-message--message">{message.text}</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChatMessage;
