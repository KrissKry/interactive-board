import React from 'react';
import { ButtonProps } from '../../../components/Button/Button';
import { ButtonGroup } from '../../../components/ButtonGroup';

interface NoMeetingProps {
    buttons: ButtonProps[],
}
const NoMeeting = ({ buttons } : NoMeetingProps) : JSX.Element => {
    const noMeeting = 'Brak trwającego spotkania';

    return (
        <div className="ee-flex--row ee-align-main--center ee-align-cross--center ee-width--100p">

            <div className="ee-meeting-panel--dims ee-flex--column ee-align-main--center">
                <p className="title">{noMeeting}</p>

                <ButtonGroup
                    buttons={buttons}
                    groupClassname="ee-flex--column"
                />

            </div>
        </div>
    );
};

export default NoMeeting;
