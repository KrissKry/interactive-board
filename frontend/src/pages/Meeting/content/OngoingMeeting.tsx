/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import {
    closeOutline, ellipsisHorizontalOutline, menuOutline, micOffOutline, micOutline, pencilSharp, prismOutline, radioButtonOnOutline, saveOutline, trashOutline, volumeHighOutline, volumeMuteOutline,
} from 'ionicons/icons';
import p5Types from 'p5';

/* redux */
import { IonIcon } from '@ionic/react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
    meetingCanvasChangesFinish,
    meetingCanvasChangesMove,
    // eslint-disable-next-line max-len
    meetingCanvasCleanupInitial, meetingCanvasPopEvent,
} from '../../../redux/ducks/meeting';

import { MeetingService, TalkService } from '../../../services';

/* components */
import Canvas from '../../../components/Canvas';

/* interfaces */
import { ControlButtonPanel } from '../../../interfaces/Buttons';
import {
    CanvasTool, CanvasToolMode, PixelChanges, RGBColor,
} from '../../../interfaces/Canvas';
import { p2p } from '../../../interfaces/Meeting';

/* util */
import {
    addAudio, createAudio, getAudioVideoDevicesId, getUniqueAudioDevices, splitBoardChanges, toggleIncomingAudio, toggleOutgoingAudio,
} from '../../../util/Meeting';
import { BoolPopover, SettingsPopover } from '../../../components/Popover';
import CanvasToolbar from '../../../components/Canvas/CanvasToolbar';
import { initialFillColor, whiteFillColor } from '../../../helpers/initial';
import { getRGBFromHex } from '../../../util/Canvas';
import { createCanvasEventFillMsg, createCanvasEventSave, createCanvasReset } from '../../../util/Canvas/createCanvasEventMsg';
import { CanvasFillEvent } from '../../../interfaces/Canvas/CanvasEvent';
import { ChatMenu, MeetingMenu } from '../../../components/Menu';
import { toggleToolbarMenu } from '../../../redux/ducks/menus';
import { canvasChangeBackground } from '../../../redux/ducks/canvas';

interface MeetingProps {
    ownMediaStream?: MediaStream;

    // eslint-disable-next-line no-unused-vars
    setOwnMediaStreamCallback: (str: MediaStream) => void;

    p2pMessages: p2p.p2pMessage[];

    inDrawingMode: boolean;

    popP2PMessageQ: () => void;

    moveToEndP2PMessageQ: () => void;
}

type CanvasPopoverType = 'SAVE' | 'RESET';

const OngoingMeeting = ({
    ownMediaStream,
    setOwnMediaStreamCallback,
    p2pMessages,
    inDrawingMode,
    popP2PMessageQ,
    moveToEndP2PMessageQ,
} : MeetingProps) : JSX.Element => {
    /* communication */
    // use RTC-State to indicate whether user is connecting to P2P (TO-DO)
    const [rtcState, setRTCState] = useState<p2p.rtcStatus>('INIT');
    const [microphoneOn, setMicrophoneOn] = useState<boolean>(false);
    const [volumeOn, setVolumeOn] = useState<boolean>(false);
    const [availableInputs, setAvailableInputs] = useState<p2p.AudioDevice[]>([]);
    const [currentInputDevice, setCurrentInputDevice] = useState<p2p.AudioDevice>();
    const [audioIdentificators, setAudioIdentificators] = useState<p2p.PeerAudioIdentifier[]>([]);
    const [streamStarted, setStreamStarted] = useState<boolean>(false);

    const toggleMicrophone = () : void => { setMicrophoneOn(!microphoneOn); };
    const toggleVolume = () : void => { setVolumeOn(!volumeOn); };
    const updateInputDevice = (device: p2p.AudioDevice) => { setCurrentInputDevice(device); };

    /* settings */
    const [settingsPopover, setSettingsPopover] = useState({
        showPopover: false,
        event: undefined,
    });

    /* state */
    const dispatch = useAppDispatch();
    const meetingService = MeetingService.getInstance();
    const talkService = TalkService.getInstance();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.roomId,
        messages: state.meeting.messages,

        boardInitialChanges: state.meeting.pixels,
        boardChanges: state.meeting.canvasChanges,
        boardChangesWaitingLen: state.meeting.queuedCanvasChanges.length,
        boardChangesLength: state.meeting.canvasChanges.length,
        boardBackground: state.canvas.background,

        boardEvents: state.meeting.canvasEvents,

        users: state.meeting.currentUsers,
        user: state.user.username,

        toolbarToggled: state.menus.toolbarExpanded,
    }));

    /* board section */
    const [p5Instance, setP5Instance] = useState<p5Types>();
    const [brushColor, setBrushColor] = useState<RGBColor>(initialFillColor);
    const [bgColor, setBGColor] = useState<RGBColor>(whiteFillColor);
    const [brushWidth, setBrushWidth] = useState<number>(1);
    const [brushMode, setBrushMode] = useState<CanvasToolMode>('PENCIL');
    const boardSendChangesCallback = (changes: PixelChanges): void => {
        meetingService.sendCanvasChanges(splitBoardChanges(changes));
    };
    const boardCleanupInitialCallback = (): void => { dispatch(meetingCanvasCleanupInitial()); };
    const [canvasPopoverType, setCanvasPopoverType] = useState<CanvasPopoverType>('SAVE');
    const [canvasChangePopover, setCanvasChangePopover] = useState({
        showPopover: false,
        event: undefined,
    });
    const closeCanvasPopover = (): void => setCanvasChangePopover({ showPopover: false, event: undefined });

    const boardSendFillEvent = (): void => {
        meetingService.sendCanvasEvent(createCanvasEventFillMsg(brushColor));
    };
    const boardSendSaveEvent = (): void => {
        meetingService.sendCanvasEvent(createCanvasEventSave(meetingState.user));
        closeCanvasPopover();
    };
    const boardSendResetEvent = (): void => {
        meetingService.sendCanvasClearEvent(createCanvasReset());
        closeCanvasPopover();
    };
    const boardBrushUpdate = (color: string) => {
        try {
            setBrushColor(getRGBFromHex(color));
        } catch (error) {
            setBrushColor(initialFillColor);
        }
    };
    const boardBrushSetWidth = (width: number): void => { setBrushWidth(width); };
    const handleBoardEvent = (): void => {
        if (!meetingState.boardEvents.length) return;

        const msg = meetingState.boardEvents[0];

        if (msg.type === 'FILL') {
            const { color } = (msg.data as CanvasFillEvent);

            const rgb: RGBColor = {
                r: color.red,
                g: color.green,
                b: color.blue,
            };

            setTimeout(() => { dispatch(canvasChangeBackground(rgb)); }, 1);
        } else if (msg.type === 'RESET') {
            // eslint-disable-next-line object-curly-newline
            dispatch(canvasChangeBackground({ r: 254, g: 254, b: 254, a: 255 }));
            setTimeout(() => { dispatch(canvasChangeBackground(whiteFillColor)); }, 1);
        }

        dispatch(meetingCanvasPopEvent());
    };

    /* p2p section */
    const sendP2PCommunication = (data: any, type: p2p.p2pEvent, remote?: string) : void => {
        console.log('[P2P] Sending', type, 'to', remote);

        const message: p2p.p2pMessage = {
            from: meetingState.user,
            to: remote || 'ANY',
            type,
            data,
        };

        meetingService.sendP2PMessage(message);
    };

    const handleReceivedStream = (data: MediaStream, remote?: string) : void => {
        const newAudioEle = createAudio(data, volumeOn);
        addAudio(newAudioEle, 'meetingDiv');

        const newAudioId: p2p.PeerAudioIdentifier = {
            username: remote || '',

            streamId: data.id,
        };
        setAudioIdentificators([...audioIdentificators, newAudioId]);
    };

    const handleP2PCommunication = () : void => {
        if (!p2pMessages.length) return;

        const message = p2pMessages[0];

        /* This app instance is the receiver end */
        if ((message.to === 'ANY' || message.to === meetingState.user) && message.from !== meetingState.user) {
            console.log('[P2P] Received', message.type, 'from', message.from);
        switch (message.type) {
            /* On new user joining, respond with offer, owner is the one sending QUERY */
            case 'QUERY':
                talkService.receiveQuery(message.from, sendP2PCommunication, handleReceivedStream, message.from);
                talkService.addTrackToRemote(message.from, ownMediaStream?.getAudioTracks()[0], ownMediaStream);
                talkService.createOffer(message.from, sendP2PCommunication);
                break;

            /* received offer from remote, sends back answer */
            case 'OFFER':
                talkService.receiveQuery(message.from, sendP2PCommunication, handleReceivedStream, meetingState.user);
                talkService.addTrackToRemote(message.from, ownMediaStream?.getAudioTracks()[0], ownMediaStream);
                talkService.receiveOffer(message.from, message.data, sendP2PCommunication);
                break;

            /* received answer to own offer */
            case 'OFFER_ANSWER':
                talkService.receiveAnswer(message.from, message.data);
                break;

            /* new ice candidate sent by one peer to the other */
            case 'ICE':
                talkService.receiveICE(message.from, message.data)
                .then(() => console.log('[M] Added ICE'))
                .catch((err) => {
                    console.error('[ICE]', err, 'adding to On-Hold');
                    talkService.addICEOnHold(message.from, message.data);
                });
                break;

            /* Negotiation request received from remote (create new offer and send it) */
            case 'NEG_BEGIN':
                talkService.createRenegotiatedOffer(message.from, sendP2PCommunication);
                break;

            /* Negotiation offer received from remote (update remote sdp and create ans) */
            case 'NEG_RECV_OFFER':
                talkService.receiveRenegotiatedOffer(message.from, message.data, sendP2PCommunication);
                break;

            /* Negotiation answer received from remote (update remote sdp) */
            case 'NEG_RECV_ANS':
                talkService.receiveRenegotiatedAns(message.from, message.data);
                break;

            /* unknown message type */
            default:
                console.warn('[P2P] Unknown message type', message);
                break;
        }
    }
        popP2PMessageQ();
    };

    const createStream = (): Promise<void> => navigator
        .mediaDevices
        .getUserMedia({
            audio: currentInputDevice?.deviceId ? { deviceId: { exact: currentInputDevice.deviceId } } : true,
            video: false,
        })
        .then((stream) => setOwnMediaStreamCallback(stream))
        .catch(() => {});

    const handleAvailableDeviceChanges = () : void => {
        if (availableInputs.length) {
            // stream not started previously
            if (!streamStarted) {
                if (typeof currentInputDevice === 'undefined') {
                    setCurrentInputDevice(availableInputs[0]);
                }

                createStream().catch((err: any) => console.error(err));
            // stream started previously
            } else {
                // used a device that is on the new list
                // eslint-disable-next-line no-lonely-if
                if (typeof currentInputDevice !== 'undefined') {
                    // assumption that the device has not been disconnected
                    if (availableInputs.includes(currentInputDevice)) {
                        // do nth
                    // current device is not on the received device list
                    } else {
                        setCurrentInputDevice(undefined);
                    }
                // stream started previously but current device is undefined
                // and devices are found
                // change current input device, replace audio tracks for all connections
                } else {
                    setCurrentInputDevice(availableInputs[0]);
                    talkService.replaceAudioTrack(ownMediaStream?.getAudioTracks()[0]);
                }
            }
        } else {
            setCurrentInputDevice(undefined);
        }
    };

    const handleStreamChange = (): void => {
        if (typeof ownMediaStream === 'undefined') return;

        talkService.addAudioTrackToAll(ownMediaStream?.getAudioTracks()[0], ownMediaStream);
        talkService.replaceAudioTrack(ownMediaStream?.getAudioTracks()[0]);
        setStreamStarted(true);
    };

    const handleAudioDevicesChange = (): void => {
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => getAudioVideoDevicesId(devices, 'audioinput'))
            .then((inputDevices) => getUniqueAudioDevices(inputDevices))
            .then((uniqueInputDevices) => setAvailableInputs(uniqueInputDevices))
            .catch((err) => console.error(err));
    };

    const resetChangesCallback = (): void => {
        dispatch(meetingCanvasChangesFinish());
    };

    useEffect(() => {
        createStream()
        .then(() => sendP2PCommunication({}, 'QUERY'))
        .catch(() => sendP2PCommunication({}, 'QUERY'));

        handleAudioDevicesChange();
        navigator.mediaDevices.addEventListener('devicechange', handleAudioDevicesChange);

        return () => ownMediaStream?.getTracks().forEach((track) => track.stop());
    }, []);

    useEffect(() => { createStream(); }, [currentInputDevice]);
    useEffect(() => { toggleOutgoingAudio(microphoneOn, ownMediaStream); }, [microphoneOn, ownMediaStream]);
    useEffect(() => { toggleIncomingAudio(volumeOn, audioIdentificators); }, [volumeOn]);
    useEffect(() => { handleP2PCommunication(); }, [p2pMessages]);
    useEffect(() => { handleAvailableDeviceChanges(); }, [availableInputs]);
    useEffect(() => { handleStreamChange(); }, [ownMediaStream]);
    useEffect(() => { handleBoardEvent(); }, [meetingState.boardEvents]);
    useEffect(() => {
        if (meetingState.boardChangesLength === 0 && meetingState.boardChangesWaitingLen > 0) dispatch(meetingCanvasChangesMove());
    }, [meetingState.boardChangesLength, meetingState.boardChangesWaitingLen]);

    const controlButtons : ControlButtonPanel[] = [
        {
            id: 'mic',
            icon: micOutline,
            iconFalse: micOffOutline,
            state: microphoneOn,
            callback: toggleMicrophone,
        },
        {
            id: 'vol',
            icon: volumeHighOutline,
            iconFalse: volumeMuteOutline,
            state: volumeOn,
            callback: toggleVolume,
        },
        {
            id: 'settings',
            icon: ellipsisHorizontalOutline,
            callback: (e: any) => {
                e.persist();
                setSettingsPopover({ showPopover: true, event: e });
            },
        },
    ];

    const canvasTools: CanvasTool[] = [
        {
            id: 'PENCIL',
            icon: pencilSharp,
            callback: () => setBrushMode('PENCIL'),
        },
        {
            id: 'ERASER',
            icon: prismOutline,
            callback: () => setBrushMode('ERASER'),
        },
        {
            id: 'RESET',
            icon: trashOutline,
            callback: (e: any) => {
                e.persist();
                setCanvasPopoverType('RESET');
                setCanvasChangePopover({ showPopover: true, event: e });
            },
        },
        {
            id: 'DOWNLOAD',
            icon: saveOutline,
            callback: () => p5Instance?.save(`${meetingState.id}-${(new Date()).toISOString()}.jpg`),
        },
    ];

    const brushTools: CanvasTool[] = [
        {
            customId: '1',
            customClass: 'ee-canvas-toolbar--tool-tiny',
            icon: radioButtonOnOutline,
            callback: () => boardBrushSetWidth(1),
        },
        {
            customId: '2',
            customClass: 'ee-canvas-toolbar--tool-small',
            icon: radioButtonOnOutline,
            callback: () => boardBrushSetWidth(2),
        },
        {
            customId: '3',
            customClass: 'ee-canvas-toolbar--tool-regular',
            icon: radioButtonOnOutline,
            callback: () => boardBrushSetWidth(3),
        },
        // {
        //     customId: '5',
        //     customClass: 'ee-canvas-toolbar--tool-large',
        //     icon: radioButtonOnOutline,
        //     callback: () => boardBrushSetWidth(5),
        // },
    ];
    const resetText = 'Potwierdzenie spowoduje zresetowanie tablicy BEZ zrzutu treści.';
    const saveText = 'Potwierdzenie spowoduje zapisanie stanu tablicy.';

    return (
        <div className="ee-flex--column ee-meeting" id="meetingDiv">

            <MeetingMenu users={meetingState.users} buttons={controlButtons} />

            <div className={['ee-canvas--wrapper ee-flex--row ee-align-main--center', inDrawingMode ? 'ee-canvas--wrapper-blocked' : ''].join(' ')}>
                <Canvas
                    backgroundColor={meetingState.boardBackground}
                    brushColor={brushColor}
                    brushMode={brushMode}
                    brushWidth={brushWidth}
                    changesWaiting={!!meetingState.boardChangesLength}
                    currentChanges={meetingState.boardChanges}
                    inDrawingMode={inDrawingMode}
                    initialChanges={meetingState.boardInitialChanges}
                    p5Instance={p5Instance}
                    cleanupInitialCallback={boardCleanupInitialCallback}
                    sendChangesCallback={boardSendChangesCallback}
                    resetChangesCallback={resetChangesCallback}
                    sendFillEventCallback={boardSendFillEvent}
                    setP5InstanceCallback={(p5: p5Types) => setP5Instance(p5)}
                />

            </div>

            <CanvasToolbar
                activeToolId={brushMode}
                currentColor={brushColor}
                pickColor={boardBrushUpdate}
                tools={canvasTools}
                brushTools={brushTools}
                activeBrushId={brushWidth.toString()}
            />

            <button type="button" className="ee-canvas-toolbar--toggle" onClick={() => dispatch(toggleToolbarMenu())}>
                <IonIcon icon={meetingState.toolbarToggled ? closeOutline : menuOutline} />
            </button>
            <ChatMenu />

            <SettingsPopover
                isOpen={settingsPopover.showPopover}
                popoverEvent={settingsPopover.event}
                setInput={updateInputDevice}
                currentInput={currentInputDevice}
                availableInputs={availableInputs}
                title="Ustawienia"
                closePopup={() => setSettingsPopover({ showPopover: false, event: undefined })}
            />

            <BoolPopover
                isOpen={canvasChangePopover.showPopover}
                popoverEvent={canvasChangePopover.event}
                confirmCallback={canvasPopoverType === 'SAVE' ? boardSendSaveEvent : boardSendResetEvent}
                cancelCallback={closeCanvasPopover}
                title="Czy na pewno?"
                contentText={canvasPopoverType === 'SAVE' ? saveText : resetText}
            />

        </div>
    );
};

export default OngoingMeeting;
