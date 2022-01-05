/* eslint-disable react/require-default-props */
import { IonItem, IonLabel } from '@ionic/react';
import React from 'react';

interface HeaderProps {
    title: string;

    activeUsers?: string[];

    invitedUsers?: string[];

    contact?: string;
}

const ChatHeader = ({
    title,
    activeUsers = [],
    invitedUsers = [],
    contact = '',
} : HeaderProps) : JSX.Element => (
    <div className="ee-flex--row ee-align-cross--center ee-chat-container--header">
        <p className="">{title}</p>
    </div>
);

export default ChatHeader;
