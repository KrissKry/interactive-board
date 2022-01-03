import { IonIcon } from '@ionic/react';
import { arrowForward, exitOutline } from 'ionicons/icons';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { ControlButtonPanel } from '../../interfaces/Buttons';
import { UserInterface } from '../../interfaces/User';
import { toggleUtilityMenu } from '../../redux/ducks/menus';
import { ButtonsPanel } from '../ButtonGroup';
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
    const dispatch = useAppDispatch();
    const expanded = useAppSelector((state) => state.menus.utilityExpanded);

    return (
        <div className={['ee-flex--column', 'ee-menu', expanded ? '' : 'ee-menu--closed ee-align-cross--center'].join(' ')}>

            <button className="ee-menu--xbtn" onClick={() => dispatch(toggleUtilityMenu())} type="button">
                <IonIcon icon={arrowForward} className={expanded ? 'ee-menu--icon-active' : 'ee-menu--icon'} />
            </button>

            <p className="" style={{ display: expanded ? 'block' : 'none' }}>{title}</p>

            <UserList users={users} expanded={expanded} />

            <ButtonsPanel
                buttons={buttons}
                buttonClassName="ee-buttons--settings"
                iconClassName="ee-buttons--settings-icon"
                iconStateClassName="ee-buttons--settings-icon-true"
                groupClassName={expanded ? 'ee-flex--row ee-align-main--evenly' : 'ee-flex-column'}
            />
        </div>
    );
};

export default MeetingMenu;
