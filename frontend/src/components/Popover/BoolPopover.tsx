// eslint-disable-next-line object-curly-newline
import { IonButton, IonItem, IonList, IonListHeader, IonPopover } from '@ionic/react';
import React from 'react';

interface PopoverProps {

    cancelText?: string;

    confirmText?: string;

    contentText?: string;

    isOpen: boolean;

    popoverEvent: any;

    title?: string;

    cancelCallback: () => void;

    confirmCallback: () => void;
}

const BoolPopover = ({
    cancelText = 'Anuluj',
    confirmText = 'Potwierdź',
    contentText = 'Jesteś pewien?',
    isOpen,
    popoverEvent,
    title = 'Potwierdzenie',
    cancelCallback,
    confirmCallback,
}: PopoverProps): JSX.Element => (
    <IonPopover
        isOpen={isOpen}
        event={popoverEvent}
        cssClass="ee-c-popover"
        onDidDismiss={cancelCallback}
    >
        <IonList>
            <IonListHeader style={{ fontWeight: 'bold' }}>{title}</IonListHeader>

            <IonItem>{contentText}</IonItem>

            <IonItem lines="none">

                <IonButton onClick={cancelCallback} color="danger" size="default" slot="start">{cancelText}</IonButton>

                <IonButton onClick={confirmCallback} fill="clear" color="dark" size="default" slot="end">{confirmText}</IonButton>

            </IonItem>

        </IonList>
    </IonPopover>
);

export default BoolPopover;
