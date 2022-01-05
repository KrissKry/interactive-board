import { IonIcon, IonInput } from '@ionic/react';
import React from 'react';

interface InputProps {
    placeholder: string;
    icon: string;
    ref: any;
    disabled?: boolean;
    maxLength?: number;

    onKeydown?: (e?: any) => void;
    keyType?: string
}

// eslint-disable-next-line no-undef
const BasicInput = React.forwardRef<HTMLIonInputElement, InputProps>((props, ref) => (
    <IonInput
        className="ee-nomeeting--input"
        placeholder={props.placeholder}
        type="text"
        ref={ref}
        disabled={props.disabled}
        maxlength={props.maxLength}
        // eslint-disable-next-line no-nested-ternary
        onKeyDown={(e) => (e.key === props.keyType ? typeof props.onKeydown !== 'undefined' ? props.onKeydown() : null : null)}
    >
        <IonIcon icon={props.icon} className="ee-nomeeting--input-icon" />
    </IonInput>
));

export default BasicInput;
