import { IonItem, IonLabel, IonText } from '@ionic/react';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ChatMessageInterface } from '../../interfaces/Chat';

const VirtualChatMessage = ({ username, text } : ChatMessageInterface) : JSX.Element => {
    const [ref, inView] = useInView();

    return (
        <IonItem ref={ref} lines="none" button>
            {inView ? (
                <>
                    <IonLabel style={{ fontSize: 10 }}>{username}</IonLabel>
                    <IonText>{text}</IonText>
                </>
            )
            : null}
        </IonItem>
    );
};

export default VirtualChatMessage;
