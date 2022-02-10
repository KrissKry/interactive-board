/* eslint-disable react/require-default-props */
import { IonItem, IonLabel, IonToggle } from '@ionic/react';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { meetingSetChatToasts } from '../../redux/ducks/meeting';

interface HeaderProps {
    title: string;

}

const ChatHeader = ({
    title,
} : HeaderProps) : JSX.Element => {
    const toastsEnabled = useAppSelector((state) => state.meeting.chatToasts);
    const dispatch = useAppDispatch();

    return (
        <div className="ee-flex--row ee-align-cross--center ee-align-main--between ee-chat-container--header">
            <p className="">{title}</p>

            <div className="ee-flex--row ee-align-cross--center">
            <p>Tosty</p>
            <IonToggle
                checked={toastsEnabled}
                onIonChange={(e) => dispatch(meetingSetChatToasts(e.detail.checked))}
            />
            </div>
        </div>
    );
};

export default ChatHeader;
