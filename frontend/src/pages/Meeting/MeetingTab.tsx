import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { meetingRequestValidation, meetingSetID } from '../../redux/ducks/meeting';
import { MeetingService } from '../../services';
import { ButtonProps } from '../../components/Button/Button';

import GenericTab from '../GenericTab';
import { NoMeeting, OngoingMeeting } from './content';
import { MeetingModal } from '../../components/Modal';
import { meetingModalModes } from '../../interfaces/Modal';
import { SimpleIonicInput } from '../../components/Input';

const MeetingTab = () => {
    const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
    const [meetingModalMode, setMeetingModalMode] = useState<meetingModalModes>('JOIN');
    const [user, setUser] = useState<string>('');
    const [potentialId, setPotentialId] = useState<string>('');

    const dispatch = useAppDispatch();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.id,
        loading: state.meeting.loading,
        loadingError: state.meeting.loadingError,
        errorMessage: state.meeting.errorMessage,
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
        if (parseInt(meetingState.id, 10) === -1 || meetingState.id === '') {
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

    const createMeetingCallback = (name: string, pass?: string) : void => {
        // promise for new meeting endpoint
        MeetingService.requestNewMeeting(name, pass)
        .then((response) => {
            setPotentialId(response.data as string);
            meetingService.createClient(dispatchMeetingUpdate, user, response.data as string, pass);
        });
    };

    const joinMeetingCallback = (id: string, pass?: string) : void => {
        // promise for meeting already in progress endpoint
        // const promise = MeetingService.fetchMeetingDataByID(id, pass);
        // dispatch(meetingRequestValidation(promise));

    };

    const updateUser = (newUser: string) => { setUser(newUser); };

    useEffect(() => {
        console.log(meetingState);
    }, [meetingState]);

    return (
        <GenericTab title="Spotkanie">
            {getMeetingContent()}

            <SimpleIonicInput sendCallback={updateUser} />

            <MeetingModal
                isOpen={showMeetingModal}
                closeCallback={hideModalCallback}
                // eslint-disable-next-line no-nested-ternary
                callback={meetingModalMode === 'JOIN'
                    ? joinMeetingCallback : meetingModalMode === 'CREATE'
                        ? createMeetingCallback : () => console.warn('[EE] Incorrect meeting modal mode')}
                mode={meetingModalMode}
            />
        </GenericTab>
    );
};

export default MeetingTab;
