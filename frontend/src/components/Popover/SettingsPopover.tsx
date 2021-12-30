// eslint-disable-next-line object-curly-newline
import { IonList, IonListHeader, IonItem, IonSelect, IonSelectOption } from '@ionic/react';
import React from 'react';
import { AudioDevice } from '../../interfaces/Meeting/p2p';

interface PopoverProps {

    availableInputs: AudioDevice[];

    currentInput?: AudioDevice;

    title?: string;

    closePopup: () => void;

    // eslint-disable-next-line no-unused-vars
    setInput: (device: AudioDevice) => void;
}

const SettingsPopover = ({
    availableInputs,
    currentInput,
    title = 'Ustawienia',
    closePopup,
    setInput,
}: PopoverProps) : JSX.Element => (
    <IonList>
        <IonListHeader style={{ fontWeight: 'bold' }}>{title}</IonListHeader>

        <IonSelect
            value={currentInput}
            placeholder={currentInput?.label ?? 'Brak mikrofonów'}
            disabled={!availableInputs.length}
            onIonChange={(e) => setInput(e.detail.value)}
            cancelText="Anuluj"
            okText="OK"
            interface="action-sheet"
        >
            {availableInputs.map((device) => (
            <IonSelectOption
                key={device.deviceId}
                value={device}
                style={{ width: 100 }}
            >
                {device.label}
            </IonSelectOption>
            ))}
        </IonSelect>

        <IonItem lines="none" button onClick={closePopup}>Zamknij</IonItem>
    </IonList>
);

export default SettingsPopover;
