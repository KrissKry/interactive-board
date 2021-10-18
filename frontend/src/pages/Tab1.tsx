import React from 'react';
import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar,
} from '@ionic/react';
import './Tab1.css';
import Canvas from '../components/Canvas';
import ChatContainer from '../components/Chat/ChatContainer';

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

            <div className="ee-generic-row">
                <Canvas brushWidth={1} />
                <ChatContainer />
            </div>
        </IonContent>
    </IonPage>
);

export default Tab1;
