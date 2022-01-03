import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* main css */
import './styles/main.scss';
import { MeetingTab } from './pages';

const App: React.FC = () => (
    <IonApp>
        <IonReactRouter>
                <IonRouterOutlet>
                    <Route exact path="/tab1">
                        <MeetingTab />
                    </Route>
                    <Route exact path="/">
                        <Redirect to="/tab1" />
                    </Route>
                </IonRouterOutlet>

        </IonReactRouter>
    </IonApp>
);

export default App;
