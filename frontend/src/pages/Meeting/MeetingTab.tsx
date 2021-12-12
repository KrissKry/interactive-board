import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { meetingSetID } from '../../redux/ducks/meeting';
import { MeetingService } from '../../services';
import { ButtonProps } from '../../components/Button/Button';

import GenericTab from '../GenericTab';
import { NoMeeting, OngoingMeeting } from './content';
import { MeetingModal } from '../../components/Modal';
import { meetingModalModes } from '../../interfaces/Modal';
import { SimpleIonicInput } from '../../components/Input';
import { setUsername } from '../../redux/ducks/user';

const MeetingTab = () => {
    const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
    const [meetingModalMode, setMeetingModalMode] = useState<meetingModalModes>('JOIN');
    // const [user, setUser] = useState<string>('');
    const [potentialId, setPotentialId] = useState<string>('');

    const dispatch = useAppDispatch();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.roomId,
        loading: state.meeting.loading,
        loadingError: state.meeting.loadingError,
        errorMessage: state.meeting.errorMessage,
        user: state.user.username,
    }));

    const [noMeetingState, setNoMeetingState] = useState<boolean>(parseInt(meetingState.id, 10) === -1 || meetingState.id === '');
    const meetingService = MeetingService.getInstance();

    const showModalCallback = (mode: meetingModalModes) : void => {
        setShowMeetingModal(true);
        setMeetingModalMode(mode);
    };

    const hideModalCallback = () : void => {
        setShowMeetingModal(false);
        setMeetingModalMode('JOIN');
    };

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

    const getMeetingContent = () : JSX.Element => {
        if (noMeetingState) {
            return (
                <NoMeeting buttons={buttons} />
            );
        }

        /* if meeting is active */
        return (
            <OngoingMeeting />
        );
    };

    const dispatchMeetingUpdate = () : void => { dispatch(meetingSetID(potentialId)); };
    const updateid = (id: string) : void => { setPotentialId(id); };

    const createMeetingCallback = (name: string, pass?: string) : void => {
        // promise for new meeting endpoint
        MeetingService.requestNewMeeting(name, pass)
        .then((response) => {
            console.log('createMeetingCallback', response);
            const { data } = response;

            // eslint-disable-next-line max-len
            meetingService.createClient(() => updateid(data as string), meetingState.user, data as string, pass);
        })
        .catch((err) => {
            console.warn('FAKAP Żądania');
            console.error(err);
        });
    };

    useEffect(() => {
        dispatchMeetingUpdate();
    }, [potentialId]);

    const joinMeetingCallback = (id: string, pass?: string) : void => {
        // promise for meeting already in progress endpoint
        // const promise = MeetingService.fetchMeetingDataByID(id, pass);
        // dispatch(meetingRequestValidation(promise));
        meetingService.createClient(() => updateid(id), meetingState.user, id, pass);
    };

    const updateUser = (newUser: string) => { dispatch(setUsername(newUser)); };

    useEffect(() => {
        setNoMeetingState(parseInt(meetingState.id, 10) === -1 || meetingState.id === '');
    }, [meetingState.id]);

    useEffect(() => {
        console.log('STAN', meetingState);
    }, [meetingState]);

    return (
        <GenericTab title={meetingState.id}>
            {getMeetingContent()}

            {noMeetingState && (
                <div className="ee-flex--column ee-align-cross--center">

                    <div className="ee-width--50p">
                        <SimpleIonicInput sendCallback={updateUser} placeholder="Uzytkownik :D" />
                        <p>{meetingState.user}</p>
                    </div>

                    <MeetingModal
                        isOpen={showMeetingModal}
                        closeCallback={hideModalCallback}
                        // eslint-disable-next-line no-nested-ternary
                        callback={meetingModalMode === 'JOIN'
                            ? joinMeetingCallback : meetingModalMode === 'CREATE'
                                ? createMeetingCallback : () => console.warn('[EE] Incorrect meeting modal mode')}
                        mode={meetingModalMode}
                    />
                </div>
            )}
        </GenericTab>
    );
};

export default MeetingTab;
