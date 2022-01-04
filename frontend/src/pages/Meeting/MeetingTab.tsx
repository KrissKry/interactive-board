/* eslint-disable max-len */
import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButton, IonIcon, IonButtons,
} from '@ionic/react';
import { IFrame } from '@stomp/stompjs';

import {
    chatboxOutline, gridOutline, moveOutline, pencilSharp,
} from 'ionicons/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    // eslint-disable-next-line max-len
    meetingCanvasPushChange, meetingCanvasPushEvent, meetingChatAddMessage, meetingUpdateMiddleware, meetingUserAdd, meetingUserRemove,
} from '../../redux/ducks/meeting';

import { MeetingService } from '../../services';
import { ButtonProps } from '../../components/Button/Button';

import GenericTab from '../GenericTab';
import { NoMeeting, OngoingMeeting } from './content';
import { MeetingModal } from '../../components/Modal';
import { meetingModalModes } from '../../interfaces/Modal';
import { SimpleIonicInput } from '../../components/Input';
import { setUsername } from '../../redux/ducks/user';
import type { PixelChanges } from '../../interfaces/Canvas';
import type { ChatMessageInterface } from '../../interfaces/Chat';
import { p2p } from '../../interfaces/Meeting';
import { UserInterface } from '../../interfaces/User/UserInterface';
import { CanvasEventMessage } from '../../interfaces/Canvas/CanvasEvent';
import { toggleChatMenu, toggleUtilityMenu } from '../../redux/ducks/menus';
import { toggleDrawingMode } from '../../redux/ducks/canvas';

type MeetingEndpointSub = 'INIT' | 'USER' | 'BOARD' | 'CHAT' | 'P2P' | 'EVENT';
type MeetingConnectionStatus = 'INIT' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';

interface MeetingSubObject {
    id: string;

    type: MeetingEndpointSub;
}

const MeetingTab = () => {
    const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
    const [meetingModalMode, setMeetingModalMode] = useState<meetingModalModes>('JOIN');
    const [meetingSubs, setMeetingSubs] = useState<MeetingSubObject[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<MeetingConnectionStatus>('INIT');
    const [ownMediaStream, setOwnMediaStream] = useState<MediaStream>();
    const [p2pMessagesQ, setP2PMessageQ] = useState<p2p.p2pMessage[]>([]);

    const dispatch = useAppDispatch();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.roomId,
        loading: state.meeting.loading,
        loadingError: state.meeting.loadingError,
        errorMessage: state.meeting.errorMessage,
        user: state.user.username,
        inDrawingMode: state.canvas.drawingMode && !state.menus.chatExpanded && !state.menus.utilityExpanded,
    }));

    const meetingService = MeetingService.getInstance();

    const showModalCallback = (mode: meetingModalModes) : void => {
        setShowMeetingModal(true);
        setMeetingModalMode(mode);
    };

    const hideModalCallback = () : void => {
        setShowMeetingModal(false);
        setMeetingModalMode('JOIN');
    };

    const updateMediaStream = (newMediaStream: MediaStream) : void => { setOwnMediaStream(newMediaStream); };

    const buttons: ButtonProps[] = [
        {
            color: 'primary',
            customOnClick: () => showModalCallback('JOIN'),
            fill: 'solid',
            text: 'Dołącz teraz',
            expand: true,
        },
        {
            color: 'secondary',
            customOnClick: () => showModalCallback('CREATE'),
            fill: 'solid',
            text: 'Stwórz nowe',
            expand: true,
        },
    ];

    const boardUpdateCallback = (message: IFrame) : void => {
        const resp: PixelChanges = JSON.parse(message.body);
        dispatch(meetingCanvasPushChange(resp));
    };

    const meetingUpdateCallback = (message: IFrame) : void => {
        const resp = JSON.parse(message.body);
        dispatch(meetingUpdateMiddleware(resp));
    };

    const newUserUpdateCallback = (message: IFrame) : void => {
        const payload: UserInterface = JSON.parse(message.body);
        if (payload.name === meetingState.user) return;
        if (payload.status === 'CONNECTED') dispatch(meetingUserAdd(payload));
        else dispatch(meetingUserRemove(payload));
    };

    const chatUpdateCallback = (message: IFrame) => {
        const recvMessage: ChatMessageInterface = JSON.parse(message.body);
        dispatch(meetingChatAddMessage(recvMessage));
    };

    const p2pUpdateCallback = (message: IFrame) => {
        const msg: p2p.p2pMessage = JSON.parse(message.body);
        setP2PMessageQ([...p2pMessagesQ, msg]);
    };

    const popP2PMessageQ = () => {
        if (p2pMessagesQ.length > 1) setP2PMessageQ(p2pMessagesQ.slice(1));
        else setP2PMessageQ([]);
    };

    /**
     *     on rare occurence ICE Candidate is received before remote description
     *     that message must be moved to the end of the Q as ICE can't be set without remote description
     *     as per WebRTC standard
     */
    const moveToEndP2PMessageQ = () => {
        const msg = p2pMessagesQ[0];
        if (p2pMessagesQ.length > 1) setP2PMessageQ([...p2pMessagesQ.slice(1), msg]);
        else {
            setP2PMessageQ([]);
            setP2PMessageQ([msg]);
        }
    };

    const boardEventUpdateCallback = (message: IFrame) => {
        const msg: CanvasEventMessage = JSON.parse(message.body);
        dispatch(meetingCanvasPushEvent(msg));
    };

    // eslint-disable-next-line max-len
    const newMeetingSub = (id: string, type: MeetingEndpointSub) : MeetingSubObject => ({ id, type });

    const subscribeToEndpoints = (id: string) : void => {
        meetingService.addSubscription(`/api/room/connect/${id}`, meetingUpdateCallback)
        .then((subId) => {
            setMeetingSubs([...meetingSubs, newMeetingSub(subId, 'INIT')]);
            return meetingService.addSubscription(`/topic/room.connected.${id}`, newUserUpdateCallback);
        })
        .then((subId) => {
            setMeetingSubs([...meetingSubs, newMeetingSub(subId, 'USER')]);
            return meetingService.addSubscription(`/topic/board.listen.${id}`, boardUpdateCallback);
        })
        .then((subId) => {
            setMeetingSubs([...meetingSubs, newMeetingSub(subId, 'BOARD')]);
            return meetingService.addSubscription(`/topic/chat.listen.${id}`, chatUpdateCallback);
        })
        .then((subId) => {
            setMeetingSubs([...meetingSubs, newMeetingSub(subId, 'CHAT')]);
            return meetingService.addSubscription(`/topic/p2p.listen.${id}`, p2pUpdateCallback);
        })
        .then((subId) => {
            setMeetingSubs([...meetingSubs, newMeetingSub(subId, 'P2P')]);
            return meetingService.addSubscription(`/topic/board.event.listen${id}`, boardEventUpdateCallback);
        })
        .then((subId) => {
            setMeetingSubs([...meetingSubs, newMeetingSub(subId, 'EVENT')]);

            // smieszny timeout aka optymalizacyjny punkt XD
            setTimeout(() => {
                setConnectionStatus('CONNECTED');
            }, 2000);
        })
        .catch((err) => {
            console.error(err);
            setConnectionStatus('ERROR');
        });
    };

    const joinMeetingCallback = (id: string, pass?: string) : void => {
        setConnectionStatus('CONNECTING');

        meetingService.createClient(subscribeToEndpoints, meetingState.user, id, pass)
        .then(() => meetingService.activateClient())
        .catch((err) => {
            meetingService.deactivateClient();
            console.error(err);
            setConnectionStatus('ERROR');
        });
    };

    const createMeetingCallback = (name: string, pass?: string) : void => {
        MeetingService.requestNewMeeting(name, pass)
        .then((response) => {
            const { data } = response;
            joinMeetingCallback(data as string, pass);
        })
        .catch((err) => {
            meetingService.deactivateClient();
            console.error(err);
            setConnectionStatus('ERROR');
        });
    };

    const updateUser = (newUser: string) => { dispatch(setUsername(newUser)); };

    const defaultReturn = () : JSX.Element => (
        <>
            <NoMeeting buttons={buttons} />
            <div className="ee-flex--column ee-align-cross--center">

                <div className="ee-width--50p">
                    <SimpleIonicInput sendCallback={updateUser} placeholder="Uzytkownik :D" />
                    <p>{meetingState.user}</p>
                </div>

                <MeetingModal
                    isOpen={showMeetingModal}
                    closeCallback={hideModalCallback}
                    // eslint-disable-next-line no-nested-ternary
                    callback={meetingModalMode === 'JOIN' ? joinMeetingCallback : createMeetingCallback}
                    mode={meetingModalMode}
                />
            </div>
        </>
    );

    const getMeetingContent = () : JSX.Element => {
        if (connectionStatus === 'CONNECTED') {
            return (
            <OngoingMeeting
                ownMediaStream={ownMediaStream}
                setOwnMediaStreamCallback={updateMediaStream}
                p2pMessages={p2pMessagesQ}
                inDrawingMode={meetingState.inDrawingMode}
                popP2PMessageQ={popP2PMessageQ}
                moveToEndP2PMessageQ={moveToEndP2PMessageQ}
            />
            );
        // eslint-disable-next-line no-else-return
        } else if (connectionStatus === 'CONNECTING') return (<IonSpinner />);
        else return defaultReturn();
    };

    return (
    <IonPage>

        <IonHeader>
            <IonToolbar>
                <IonTitle>{meetingState.id}</IonTitle>
                <IonButton slot="start" fill="clear" onClick={() => dispatch(toggleUtilityMenu())}>
                    <IonIcon icon={gridOutline} className="" />
                </IonButton>

                <IonButtons slot="end">
                    <IonButton fill="clear" onClick={() => dispatch(toggleDrawingMode())}>
                        <p>{meetingState.inDrawingMode ? 'RYSOWANIE' : 'RUCH'}</p>
                        <IonIcon icon={meetingState.inDrawingMode ? pencilSharp : moveOutline} />
                    </IonButton>
                    <IonButton fill="clear" onClick={() => dispatch(toggleChatMenu())}>
                        <IonIcon icon={chatboxOutline} className="" />
                    </IonButton>
                </IonButtons>

                {/* <IonMenuButton menu="CHATMENUXD" color="danger" autoHide={false} onClick={() => dispatch(toggleChatMenu())}>
                    <IonIcon icon={chatboxOutline} className="" />
                </IonMenuButton> */}
            </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
            {getMeetingContent()}
        </IonContent>

    </IonPage>
    );
};

export default MeetingTab;
