/* eslint-disable max-len */
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ControlButtonPanel } from '../../interfaces/Buttons';
import { UserInterface } from '../../interfaces/User';
import { toggleMenuSides } from '../../redux/ducks/menus';
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
    const dispatch = useAppDispatch();

    return (
        <>
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
        <button type="button" className={['ee-menu--wrapper', expanded ? 'ee-menu--wrapper-on' : 'ee-menu--wrapper-off'].join(' ')} onClick={() => dispatch(toggleMenuSides())}> </button>

        </>
    );
};

export default MeetingMenu;
