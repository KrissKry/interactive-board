import { IonList } from '@ionic/react';
import React from 'react';
import { UserPanel } from '.';

interface UserInterface {
    avatar: string;

    name: string;

    active: boolean;
}

interface UserListProps {

    users: UserInterface[];

}
const UserList = ({
    users,
}: UserListProps) : JSX.Element => (
    <IonList className="ee-user-list">
        {users.map((item) => (
            <UserPanel
                active={item.active}
                avatar={item.avatar}
                expand
                key={item.name}
                name={item.name}
            />
        ))}
    </IonList>
);

export default UserList;
