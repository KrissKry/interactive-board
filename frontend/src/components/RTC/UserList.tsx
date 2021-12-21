import { IonList } from '@ionic/react';
import React from 'react';
import { UserPanel } from '.';
import { UserInterface } from '../../interfaces/User';

interface UserListProps {

    users: UserInterface[];

}
const UserList = ({ users }: UserListProps) : JSX.Element => (
    <IonList className="ee-user-list">
        {users.map((item) => (
            <UserPanel
                active={item.status === 'CONNECTED'}
                // avatar={item.}
                expand
                key={item.name}
                name={item.name}
            />
        ))}
    </IonList>
);

export default UserList;
