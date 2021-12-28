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
    <IonItem className="" lines="full">
        <IonLabel className="">{title}</IonLabel>
    </IonItem>
);

export default ChatHeader;
