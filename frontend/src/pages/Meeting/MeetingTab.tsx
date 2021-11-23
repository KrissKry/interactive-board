import React, { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../hooks';
import { meetingRequestValidation } from '../../redux/ducks/meeting';
import { MeetingService } from '../../services';
import { ButtonProps } from '../../components/Button/Button';

import GenericTab from '../GenericTab';
import { NoMeeting, OngoingMeeting } from './content';
import { MeetingModal } from '../../components/Modal';

type meetingModalModes = 'CREATE' | 'JOIN' | 'NONE';

const MeetingTab = () => {
    const service = MeetingService.getInstance();
    const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
    const [meetingModalMode, setMeetingModalMode] = useState<meetingModalModes>('NONE');

    const dispatch = useAppDispatch();
    const meetingState = useAppSelector((state) => ({
        id: state.meeting.id,
        loading: state.meeting.loading,
        loadingError: state.meeting.loadingError,
        errorMessage: state.meeting.errorMessage,
    }));

    const showModalCallback = (mode: meetingModalModes) : void => {
        setShowMeetingModal(true);
        setMeetingModalMode(mode);
    };

    const hideModalCallback = () : void => {
        setShowMeetingModal(false);
        setMeetingModalMode('NONE');
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

    const createMeetingCallback = (id: string, pass?: string) : void => {
        // promise for new meeting endpoint
        const promise = service.requestNewMeeting(id, pass);
        dispatch(meetingRequestValidation(promise));
    };

    const joinMeetingCallback = (id: string, pass?: string) : void => {
        // promise for meeting already in progress endpoint
        const promise = service.fetchMeetingDataByID(id, pass);
        dispatch(meetingRequestValidation(promise));
    };

    useEffect(() => {
        console.log(meetingState.loading, meetingState.loadingError, meetingState.errorMessage);
    }, [meetingState]);

    return (
        <GenericTab title="Spotkanie">
            {getMeetingContent()}

            <MeetingModal
                isOpen={showMeetingModal}
                closeCallback={hideModalCallback}
                // eslint-disable-next-line no-nested-ternary
                callback={meetingModalMode === 'JOIN'
                    ? joinMeetingCallback : meetingModalMode === 'CREATE'
                        ? createMeetingCallback : () => console.warn('[EE] Incorrect meeting modal mode')}
            />
        </GenericTab>
    );
};

export default MeetingTab;
