/* eslint-disable max-len */
import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButton, IonIcon, IonButtons, useIonToast,
} from '@ionic/react';
import { IFrame } from '@stomp/stompjs';

import {
    chatboxOutline, gridOutline, moveOutline, pencilSharp, powerOutline, shareSocial,
} from 'ionicons/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    meetingCanvasChangesAdd,
    // eslint-disable-next-line max-len
    meetingCanvasPushEvent, meetingChatAddMessage, meetingFetchError, meetingFetchRequest, meetingReset, meetingSetDetails, meetingUpdateMiddleware, meetingUserAdd, meetingUserRemove,
} from '../../redux/ducks/meeting';

import { MeetingService, TalkService } from '../../services';

import { NoMeeting, OngoingMeeting } from './content';
import type { PixelChanges } from '../../interfaces/Canvas';
import type { ChatMessageInterface } from '../../interfaces/Chat';
import { p2p } from '../../interfaces/Meeting';
import { UserInterface } from '../../interfaces/User/UserInterface';
import { CanvasEventMessage } from '../../interfaces/Canvas/CanvasEvent';
import { menuReset, toggleChatMenu, toggleUtilityMenu } from '../../redux/ducks/menus';
import { toggleDrawingMode } from '../../redux/ducks/canvas';
import { BoolPopover } from '../../components/Popover';
import { popChat, popUser } from '../../assets/audio';
import MeetingToast from '../../components/Toasts/MeetingToast';

type MeetingEndpointSub = 'INIT' | 'USER' | 'BOARD' | 'CHAT' | 'P2P' | 'EVENT';
type MeetingConnectionStatus = 'INIT' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';

interface MeetingSubObject {
    id: string;

    type: MeetingEndpointSub;
}

const MeetingTab = () => {
    const [meetingSubs, setMeetingSubs] = useState<MeetingSubObject[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<MeetingConnectionStatus>('INIT');
    const [ownMediaStream, setOwnMediaStream] = useState<MediaStream>();
    const [p2pMessagesQ, setP2PMessageQ] = useState<p2p.p2pMessage[]>([]);
    const [present, dismiss] = useIonToast();
    const [chatPopSignal] = useState(new Audio(popChat));
    const [userPopSignal] = useState(new Audio(popUser));
    const [toastState, setToastState] = useState({
        message: '',
        timeout: 0,
        visible: false,
    });

    const hideToast = (time?: number): number => window.setTimeout(() => setToastState({ message: '', timeout: 0, visible: false }), time || 1000);

    const showToastMessage = (text: string, time?: number): void => {
        if (toastState.timeout) clearTimeout(toastState.timeout);

        setToastState({
            visible: true,
            timeout: hideToast(time),
            message: text,
        });
    };

    const [exitPopover, setExitPopover] = useState({
        showPopover: false,
        event: undefined,
    });

    const closeExitPopover = (): void => setExitPopover({ showPopover: false, event: undefined });

    const dispatch = useAppDispatch();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.roomId,
        pass: state.meeting.pass,
        loading: state.meeting.loading,
        loadingError: state.meeting.loadingError,
        errorMessage: state.meeting.errorMessage,
        user: state.user.username,
        inDrawingMode: state.canvas.drawingMode && !state.menus.chatExpanded && !state.menus.utilityExpanded,
        toastsEnabled: state.meeting.chatToasts,
    }));
    const meetingService = MeetingService.getInstance();

    const updateMediaStream = (newMediaStream: MediaStream) : void => { setOwnMediaStream(newMediaStream); };

    const boardUpdateCallback = (message: IFrame) : void => {
        const resp: PixelChanges = JSON.parse(message.body);
        // dispatch(meetingCanvasPushChange(resp));
        dispatch(meetingCanvasChangesAdd(resp));
    };

    const meetingUpdateCallback = (message: IFrame) : void => {
        const resp = JSON.parse(message.body);
        dispatch(meetingUpdateMiddleware(resp));
    };

    const newUserUpdateCallback = (message: IFrame) : void => {
        const payload: UserInterface = JSON.parse(message.body);
        if (payload.name === meetingState.user) return;

        userPopSignal.play();

        if (payload.status === 'CONNECTED') {
            dispatch(meetingUserAdd(payload));
            showToastMessage(`${payload.name} dołączył do spotkania`, 2000);
        } else {
            dispatch(meetingUserRemove(payload));
            showToastMessage(`${payload.name} opuścił spotkanie`, 2000);
        }
    };

    const chatUpdateCallback = (message: IFrame) => {
        const recvMessage: ChatMessageInterface = JSON.parse(message.body);
        dispatch(meetingChatAddMessage(recvMessage));

        if (recvMessage.username !== meetingState.user) chatPopSignal.play();

        showToastMessage(`${recvMessage.username}: ${recvMessage.text}`);
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
            return meetingService.addSubscription(`/topic/board.cleared.${id}`, boardEventUpdateCallback);
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
        dispatch(meetingFetchRequest());
        setConnectionStatus('CONNECTING');

        meetingService.createClient(subscribeToEndpoints, meetingState.user, id, pass)
        .then(() => {
            meetingService.activateClient();
            dispatch(meetingSetDetails([id, pass ?? '']));
        })
        .catch((err) => {
            meetingService.deactivateClient();
            console.error(err);
            setConnectionStatus('ERROR');
            dispatch(meetingSetDetails(['', '']));
            dispatch(meetingFetchError(err.message));
        });
    };

    const createMeetingCallback = (pass?: string) : void => {
        dispatch(meetingFetchRequest());
        MeetingService.requestNewMeeting(pass)
        .then((response) => {
            const { data } = response;
            joinMeetingCallback(data as string, pass);
        })
        .catch((err) => {
            meetingService.deactivateClient();
            console.error(err);
            setConnectionStatus('ERROR');
            dispatch(meetingFetchError(err.message));
        });
    };

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
        else return (<NoMeeting createCallback={createMeetingCallback} joinCallback={joinMeetingCallback} />);
    };

    const copyMeetingToClipboard = async () => {
        try {
            // im sorry
            // i really am XD
            if (!meetingState.id) throw new Error('');
            await navigator.clipboard.writeText(`Spotkanie: ${meetingState.id}\nHasło: ${meetingState.pass}`);
            present({
                buttons: [{ text: 'Ukryj', handler: () => dismiss() }],
                message: 'Skopiowano dane spotkania',
                duration: 1000,
                position: 'bottom',
                cssClass: '',
            });
        } catch (error) {
            present({
                message: 'Nie jesteś w spotkaniu!',
                duration: 1000,
                position: 'bottom',
                cssClass: '',
            });
        }
    };

    const leaveMeeting = (): void => {
        closeExitPopover();
        setConnectionStatus('INIT');
        meetingService.deactivateClient();
        const talkService = TalkService.getInstance();
        talkService.endCalls();
        dispatch(meetingReset());
        dispatch(menuReset());
    };
    return (
    <IonPage>

        {!!meetingState.id && (
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{meetingState.id}</IonTitle>

                    {/* open utility menu // copy meeting invitation */}
                    <IonButtons slot="start" color="danger">
                        <IonButton fill="clear" onClick={() => dispatch(toggleUtilityMenu())}>
                            <IonIcon icon={gridOutline} className="" />
                        </IonButton>
                        <IonButton fill="clear" onClick={() => copyMeetingToClipboard()}>
                            <IonIcon icon={shareSocial} />
                        </IonButton>
                    </IonButtons>

                    {/* leave meeting */}
                    <IonButton slot="start" fill="clear" onClick={(e: any) => { e.persist(); setExitPopover({ showPopover: true, event: e }); }}>
                        <IonIcon color="danger" icon={powerOutline} />
                    </IonButton>

                    {/* drawing/move mode, open chat menu */}
                    <IonButtons slot="end">
                        <IonButton fill="clear" onClick={() => dispatch(toggleDrawingMode())}>
                            <p>{meetingState.inDrawingMode ? 'RYSOWANIE' : 'RUCH'}</p>
                            <IonIcon icon={meetingState.inDrawingMode ? pencilSharp : moveOutline} />
                        </IonButton>
                        <IonButton fill="clear" onClick={() => dispatch(toggleChatMenu())}>
                            <IonIcon icon={chatboxOutline} className="" />
                        </IonButton>
                    </IonButtons>

                    {/* confirmation of meeting leave */}
                    <BoolPopover
                        isOpen={exitPopover.showPopover}
                        popoverEvent={exitPopover.event}
                        cancelCallback={closeExitPopover}
                        confirmCallback={leaveMeeting}
                        title="Opuszczanie spotkania"
                        contentText="Będziesz mógł ponownie dołączyć jeśli nie jesteś ostatnią osobą w tym spotkaniu."
                    />
                </IonToolbar>
            </IonHeader>
        )}

        <IonContent fullscreen>
            <MeetingToast isOpen={toastState.visible && (meetingState.toastsEnabled)} message={toastState.message} />
            {getMeetingContent()}
        </IonContent>

    </IonPage>
    );
};

export default MeetingTab;
