/* eslint-disable max-len */
import React, { useState } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonSpinner, IonButton, IonIcon, IonButtons, useIonToast,
} from '@ionic/react';
import { IFrame } from '@stomp/stompjs';

import {
    chatboxOutline, exitOutline, gridOutline, moveOutline, pencilSharp, powerOutline, shareSocial,
} from 'ionicons/icons';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
    // eslint-disable-next-line max-len
    meetingCanvasPushChange, meetingCanvasPushEvent, meetingChatAddMessage, meetingReset, meetingSetDetails, meetingUpdateMiddleware, meetingUserAdd, meetingUserRemove,
} from '../../redux/ducks/meeting';

import { MeetingService, TalkService } from '../../services';
import { ButtonProps } from '../../components/Button/Button';

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
import { menuReset, toggleChatMenu, toggleUtilityMenu } from '../../redux/ducks/menus';
import { toggleDrawingMode } from '../../redux/ducks/canvas';
import { BoolPopover } from '../../components/Popover';

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
    const [present, dismiss] = useIonToast();
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
        .then(() => {
            meetingService.activateClient();
            dispatch(meetingSetDetails([id, pass ?? '']));
        })
        .catch((err) => {
            meetingService.deactivateClient();
            console.error(err);
            setConnectionStatus('ERROR');
            dispatch(meetingSetDetails(['', '']));
        });
    };

    const createMeetingCallback = (pass?: string) : void => {
        MeetingService.requestNewMeeting(pass)
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
            {getMeetingContent()}
        </IonContent>

    </IonPage>
    );
};

export default MeetingTab;
