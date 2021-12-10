/* eslint-disable no-undef */
// eslint-disable-next-line object-curly-newline
import { IonInput, IonItem, IonModal, IonText } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { meetingModalModes } from '../../interfaces/Modal';
import { Button } from '../Button';

interface ModalProps {
    isOpen: boolean;

    // eslint-disable-next-line no-unused-vars
    callback: (id: string, password?: string) => void;

    closeCallback: () => void;

    mode: meetingModalModes;
}

const MeetingModal = ({
    isOpen,
    callback,
    closeCallback,
    mode,
} : ModalProps) : JSX.Element => {
    const [idOrName, setIDOrName] = useState<string>('');
    // TODO PASSWORD HASHING REALTIME
    const [pass, setPass] = useState<string>('');

    const insertText: string = mode === 'JOIN' ? 'Identyfikator (id) spotkania' : 'Nazwa spotkania';

    const allowedLength: number = mode === 'JOIN' ? 100 : 100;

    useEffect(() => {
        setIDOrName('');
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
                <IonInput
                    autofocus
                    maxlength={allowedLength}
                    onIonChange={(e) => setIDOrName(e.detail.value!)}
                    placeholder={insertText}
                    required
                    value={idOrName}
                />
                {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
                <IonText style={{ fontSize: 12 }}>{idOrName.length} / {allowedLength}</IonText>
            </IonItem>

            <IonItem>
                <IonInput
                    onIonChange={(e) => setPass(e.detail.value!)}
                    placeholder="Hasło (opcjonalne)"
                    type="password"
                    value={pass}
                />
            </IonItem>

            <Button
                text="DALEJ"
                onClick={() => callback(idOrName, pass)}
            />

            <Button
                text="COFNIJ"
                onClick={closeCallback}
            />

        </IonModal>
    );
};

export default MeetingModal;
