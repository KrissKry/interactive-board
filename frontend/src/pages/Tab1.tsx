import React from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
} from '@ionic/react';
import './Tab1.css';
import Canvas from '../components/Canvas';

const Tab1: React.FC = () => (
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Tab 1</IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
            <IonHeader collapse="condense">
                <IonToolbar>
                    <IonTitle size="large">Tab 1</IonTitle>
                </IonToolbar>
            </IonHeader>
            <Canvas />
        </IonContent>
    </IonPage>
);

export default Tab1;
