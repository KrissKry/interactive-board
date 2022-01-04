/* eslint-disable max-len */
import { IonIcon } from '@ionic/react';
import { arrowForward, exitOutline } from 'ionicons/icons';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ControlButtonPanel } from '../../interfaces/Buttons';
import { UserInterface } from '../../interfaces/User';
// import { toggleUtilityMenu } from '../../redux/ducks/menus';
import { ButtonsPanel } from '../ButtonGroup';
import ChatHeader from '../Chat/ChatHeader';
import { UserList } from '../RTC';

interface MenuProps {
    buttons: ControlButtonPanel[];

    title?: string;

    users: UserInterface[];
}

const MeetingMenu = ({
    buttons,
    title = 'ONLINE',
    users,
}: MenuProps) : JSX.Element => {
    const expanded = useAppSelector((state) => state.menus.utilityExpanded);

    return (
        <div className={['ee-menu ee-menu-util', expanded ? 'ee-menu-util-active' : ''].join(' ')}>

            <ChatHeader title={title} />

            <UserList users={users} expanded optionalClassname="ee-menu-util-list" />

            <ButtonsPanel
                buttons={buttons}
                buttonClassName="ee-buttons--settings"
                iconClassName="ee-buttons--settings-icon"
                iconStateClassName="ee-buttons--settings-icon-true"
                groupClassName="ee-flex--row ee-align-main--evenly ee-menu-util-btnpanel"
            />
        </div>
    );
};

export default MeetingMenu;
