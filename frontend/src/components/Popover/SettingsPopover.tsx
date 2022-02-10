// eslint-disable-next-line object-curly-newline
import { IonList, IonListHeader, IonItem, IonSelect, IonSelectOption, IonLabel, IonPopover, IonButton } from '@ionic/react';
import React, { useMemo } from 'react';
import { AudioDevice } from '../../interfaces/Meeting/p2p';

interface PopoverProps {

    availableInputs: AudioDevice[];

    currentInput?: AudioDevice;

    isOpen: boolean;

    title?: string;

    popoverEvent: any,

    closePopup: () => void;

    // eslint-disable-next-line no-unused-vars
    setInput: (device: AudioDevice) => void;
}

const SettingsPopover = ({
    availableInputs,
    currentInput,
    isOpen,
    title = 'Ustawienia',
    popoverEvent,
    closePopup,
    setInput,
}: PopoverProps) : JSX.Element => (
    <IonPopover
        isOpen={isOpen}
        event={popoverEvent}
        cssClass="ee-c-popover"
        onDidDismiss={closePopup}
    >
        <IonList>
            <IonListHeader style={{ fontWeight: 'bold' }}>{title}</IonListHeader>

            <IonItem>
                <p>Mikrofon</p>
            <IonSelect
                value={currentInput?.deviceId}
                placeholder={availableInputs.length ? 'Mikrofon niewybrany' : 'Brak mikrofonów'}
                disabled={!availableInputs.length}
                // eslint-disable-next-line max-len
                onIonChange={(e) => setInput(availableInputs.find((item) => item.deviceId === e.detail.value) || availableInputs[0])}
                cancelText="Anuluj"
                okText="OK"
                interface="action-sheet"
                className="ee-c-popover--select"
            >
                {availableInputs.map((device) => (
                <IonSelectOption
                    key={device.deviceId}
                    value={device.deviceId}
                    style={{ width: 100, color: '#123123' }}
                >
                    {device.label}
                </IonSelectOption>
                ))}
            </IonSelect>
            </IonItem>
            <IonItem lines="none">
            <IonButton onClick={closePopup} color="danger" size="default" slot="end">Zamknij</IonButton>
            </IonItem>
        </IonList>
    </IonPopover>
);

export default SettingsPopover;
