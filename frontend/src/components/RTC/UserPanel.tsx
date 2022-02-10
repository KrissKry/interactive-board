/* eslint-disable react/require-default-props */
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
    <div className="ee-user--panel ee-flex--row ee-align-cross--center">

        <img
            title={name}
            src={avatar || Avatar}
            alt={name}
            className={['ee-user--panel-avatar', expand ? 'ee-margin--right1' : '', active ? 'ee-user--panel-active' : ''].join(' ')}
        />

        {expand && (
            <p className="ee-margin--vertical0 ee-user--panel-name">{name}</p>
        )}

    </div>
);

export default UserPanel;
