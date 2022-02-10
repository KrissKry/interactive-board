import React from 'react';
import { UserPanel } from '.';
import { UserInterface } from '../../interfaces/User';

interface UserListProps {

    expanded: boolean;

    users: UserInterface[];

    optionalClassname?: string;
}
const UserList = ({ expanded, users, optionalClassname }: UserListProps) : JSX.Element => (
    <div className={`ee-user--list ${optionalClassname}`}>
        {users.map((item) => (
            <UserPanel
                active={item.status === 'CONNECTED'}
                // avatar={item.}
                expand={expanded}
                key={item.name}
                name={item.name}
            />
        ))}
    </div>
);

export default UserList;
