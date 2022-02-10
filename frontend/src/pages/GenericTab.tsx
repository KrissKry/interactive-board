/* eslint-disable react/require-default-props */
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
} from '@ionic/react';
import React from 'react';

interface GenericProps {
    title: string;

    toolbarTitle?: string;

    children?: React.ReactNode;
}

const GenericTab = ({
    title,
    toolbarTitle = undefined,
    children = undefined,
} : GenericProps) => (
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>{title}</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
            {children}
        </IonContent>
    </IonPage>
);

export default GenericTab;
