import { IonIcon, IonInput, IonItem } from '@ionic/react';
import { sendSharp } from 'ionicons/icons';
import React, { useState } from 'react';

interface InputProps {
    // eslint-disable-next-line no-unused-vars
    sendCallback: (text: string) => void;

    placeholder?: string;

    resetOnCallback?: boolean;

    allowEmpty?: boolean;
}

const SimpleIonicInput = ({
    sendCallback,
    placeholder,
    resetOnCallback = true,
    allowEmpty = true,
} : InputProps) : JSX.Element => {
    const [text, setText] = useState<string>('');

    const handleSend = () => {
        if (!text.length && !allowEmpty) return;

        sendCallback(text);
        if (resetOnCallback) setText('');
    };

    return (
        <IonItem>

            <IonInput
                onIonChange={(e) => setText(e.detail.value!)}
                onKeyDown={(e) => (e.key === 'Enter' ? handleSend() : null)}
                placeholder={placeholder || 'Aa'}
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
