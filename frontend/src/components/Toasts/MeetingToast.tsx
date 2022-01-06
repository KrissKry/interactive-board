import { IonToast } from '@ionic/react';
import React from 'react';

interface ToastProps {
    isOpen: boolean;

    message: string;

    // icon: string;
}

const MeetingToast = ({ isOpen, message }: ToastProps) : JSX.Element => (
    <IonToast
        isOpen={isOpen}
        message={message}
        // icon={icon}
        position="bottom"
        buttons={[]}
        cssClass="ee-toast"
    />
);

export default MeetingToast;
