/* eslint-disable no-undef */
// eslint-disable-next-line object-curly-newline
import { IonButton, IonInput, IonItem, IonModal, IonText } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { Button } from '../Button';

interface ModalProps {
    isOpen: boolean;

    callback: (id: string, password?: string) => void;

    closeCallback: () => void;
}

const MeetingModal = ({ isOpen, callback, closeCallback } : ModalProps) : JSX.Element => {
    const [id, setID] = useState<string>('');
    // TODO PASSWORD HASHING REALTIME
    const [pass, setPass] = useState<string>('');

    useEffect(() => {
        setID('');
        setPass('');
    }, [isOpen]);

    return (
        <IonModal
            isOpen={isOpen}
            backdropDismiss={false}
            showBackdrop
            cssClass="ee-c-modal-meet"
        >
            <p>WPISZ DANE SPOTKANIA</p>
            <IonItem>
                <IonInput value={id} placeholder="Identyfikator spotkania" autofocus maxlength={6} required onIonChange={(e) => setID(e.detail.value!)} />
                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                <IonText style={{ fontSize: 12 }}>{id.length} / 6</IonText>
            </IonItem>
            <IonItem>
                <IonInput value={pass} placeholder="Hasło" type="password" onIonChange={(e) => setPass(e.detail.value!)} />
            </IonItem>
            <Button
                text="DALEJ"
                onClick={() => callback(id, pass)}
            />

            <Button
                text="COFNIJ"
                onClick={closeCallback}
            />
        </IonModal>
    );
};

export default MeetingModal;
