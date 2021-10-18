import { IonItem, IonLabel, IonText } from '@ionic/react';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ChatMessageInterface } from '../../interfaces/Meeting';

const VirtualChatMessage = ({ username, message } : ChatMessageInterface) : JSX.Element => {
    const [ref, inView] = useInView();

    return (
        <IonItem ref={ref} lines="none" button>
            {inView ? (
                <>
                    <IonLabel>{username}</IonLabel>
                    <IonText>{message}</IonText>
                </>
            )
            : null}
        </IonItem>
    );
};

export default VirtualChatMessage;
