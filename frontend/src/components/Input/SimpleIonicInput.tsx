import { IonIcon, IonInput, IonItem } from '@ionic/react';
import { sendSharp } from 'ionicons/icons';
import React, { useState } from 'react';

interface InputProps {
    // eslint-disable-next-line no-unused-vars
    sendCallback: (text: string) => void;
}

const SimpleIonicInput = ({ sendCallback } : InputProps) : JSX.Element => {
    const [text, setText] = useState<string>('');

    const handleSend = () => {
        sendCallback(text);
        setText('');
    };

    return (
        <IonItem>

            <IonInput
                onIonChange={(e) => setText(e.detail.value!)}
                onKeyDown={(e) => (e.key === 'Enter' ? handleSend() : null)}
                placeholder="Aa"
                type="text"
                value={text}
            />

            <IonIcon
                className="ee-generic-pointer ee-send-icon"
                icon={sendSharp}
                onClick={handleSend}
            />

        </IonItem>
    );
};

export default SimpleIonicInput;
