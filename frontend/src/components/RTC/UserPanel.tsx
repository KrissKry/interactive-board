/* eslint-disable react/require-default-props */
import { IonAvatar, IonItem, IonLabel } from '@ionic/react';
import React from 'react';
import Avatar from '../../assets/avatar.svg';

interface UserPanelProps {
    /**
     * If user is speaking,
     * @default false
     */
    active?: boolean;

    /**
     * src to user avatar (.jpg, .png or sth)
     * @default ''
    */
    avatar?: string;

    /**
     * If user name should be visible instead of just an avatar
     * @default true
     */
    expand?: boolean;

    /**
     * user name
     * @default User
     */
    name?: string;

}

const UserPanel = ({
    active = false,
    expand = true,
    avatar = '',
    name = 'User',
} : UserPanelProps) : JSX.Element => (
    <IonItem className="ee-user-panel ion-no-padding ion-no-margin">
        <IonAvatar className={[active ? 'ee-user-panel--active' : '', 'ee-margin--auto'].join(' ')}>
            <img src={avatar !== '' ? avatar : Avatar} alt={name} />
        </IonAvatar>
        {expand && (
            <IonLabel className="ee-margin--vertical">
                {name}
            </IonLabel>
        )}
    </IonItem>
);

export default UserPanel;
