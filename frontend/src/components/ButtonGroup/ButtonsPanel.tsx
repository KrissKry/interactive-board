import { IonButton, IonIcon, IonItemGroup } from '@ionic/react';
import React from 'react';
import { ControlButtonPanel } from '../../interfaces/Buttons';

interface PanelProps {
    buttons: ControlButtonPanel[];

    buttonClassName?: string;

    groupClassName?: string;

    iconClassName?: string;
}

export const ButtonsPanel = ({
    buttons,
    groupClassName = '',
    buttonClassName = '',
    iconClassName = '',
} : PanelProps) : JSX.Element => (
    <IonItemGroup className={groupClassName}>
        {buttons.map((item) => (
            <IonButton key={item.id} className={buttonClassName} onClick={item.callback} fill="clear" size="small">
                {/* eslint-disable-next-line max-len */}
                <IonIcon className={iconClassName} icon={typeof item.state !== 'undefined' && item.state === false ? item.iconFalse : item.icon} />
            </IonButton>
        ))}
    </IonItemGroup>
);
