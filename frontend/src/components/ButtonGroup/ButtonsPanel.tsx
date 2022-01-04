import { IonIcon } from '@ionic/react';
import React from 'react';
import { ControlButtonPanel } from '../../interfaces/Buttons';

interface PanelProps {
    buttons: ControlButtonPanel[];

    buttonClassName?: string;

    groupClassName?: string;

    iconClassName?: string;

    iconStateClassName?: string;
}

export const ButtonsPanel = ({
    buttons,
    groupClassName = '',
    buttonClassName = '',
    iconClassName = '',
    iconStateClassName = '',
} : PanelProps) : JSX.Element => (
    <div className={groupClassName}>
        {buttons.map((item) => (
            <button key={item.id} type="button" className={buttonClassName} onClick={item.callback}>
                {/* eslint-disable-next-line max-len */}
                <IonIcon className={item.state ? iconStateClassName : iconClassName} icon={typeof item.state !== 'undefined' && item.state === false ? item.iconFalse : item.icon} />
            </button>
        ))}
    </div>
);
