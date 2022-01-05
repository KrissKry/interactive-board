import { IonIcon, IonInput } from '@ionic/react';
// eslint-disable-next-line object-curly-newline
import { lockClosedOutline, lockOpenOutline, personOutline, textOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { validate } from 'uuid';
import { BasicInput } from '../../../components/Input';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { setUsername } from '../../../redux/ducks/user';

type MeetingSegment = 'JOIN' | 'CREATE';

interface MeetingProps {
    createCallback: (pass?: string) => void;

    joinCallback: (id: string, pass?: string) => void;
}

const NoMeeting = ({ createCallback, joinCallback }: MeetingProps) : JSX.Element => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.username);
    // eslint-disable-next-line no-undef
    const inputRef = useRef() as React.MutableRefObject<HTMLIonInputElement>;
    // eslint-disable-next-line no-undef
    const idRef = useRef() as React.MutableRefObject<HTMLIonInputElement>;
    // eslint-disable-next-line no-undef
    const passRef = useRef() as React.MutableRefObject<HTMLIonInputElement>;
    const [segment, setSegment] = useState<MeetingSegment>('CREATE');

    const welcome = 'Witaj, ';
    const userText = ` ${user || 'nieznajomy'}`;
    const setUserText = ['Ustaw nazwę', 'użytkownika', 'zanim zaczniesz.'];
    const helpText = 'Dołącz do spotkania lub załóż nowe poniżej';

    const verifyUsername = (name: string): void => {
        try {
            if (!name.length) return;

            dispatch(setUsername(name));
        } catch (error) {
            //
        }
    };

    const handleSubmit = (): void => {
        if (segment === 'CREATE') createCallback(passRef.current.value as string);
        else if (validate(idRef.current.value as string)) {
            joinCallback(idRef.current.value as string, passRef.current.value as string);
        }
    };

    const InputUsername = () : JSX.Element => (
        <div className="ee-flex--column ee-align-cross--center">

            {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
            <p>{setUserText[0]} <b>{setUserText[1]}</b> {setUserText[2]}</p>

            <IonInput
                className="ee-nomeeting--input"
                placeholder="Nazwa użytkownika"
                type="text"
                onKeyDown={(e) => (e.key === 'Enter' ? verifyUsername(e.currentTarget.value as string) : null)}
                ref={inputRef}
            >
                <IonIcon icon={personOutline} className="ee-nomeeting--input-icon" />
            </IonInput>

            <button type="button" className="ee-nomeeting--btn-continue" onClick={() => verifyUsername(inputRef.current?.value as string)}>KONTYNUUJ</button>

        </div>
    );

    const InputMeeting = () : JSX.Element => (
        <div className="ee-flex--column ee-align-cross--center">
            <p>{helpText}</p>

            <div>
                <button type="button" className={['ee-nomeeting--btn-segment', segment === 'CREATE' ? 'ee-nomeeting--btn-segment-active' : 'ee-nomeeting--btn-segment-inactive'].join(' ')} onClick={() => setSegment('CREATE')}>STWÓRZ</button>
                <button type="button" className={['ee-nomeeting--btn-segment', segment === 'JOIN' ? 'ee-nomeeting--btn-segment-active' : 'ee-nomeeting--btn-segment-inactive'].join(' ')} onClick={() => setSegment('JOIN')}>DOŁĄCZ</button>
            </div>

            <BasicInput placeholder="ID Spotkania" icon={textOutline} ref={idRef} disabled={segment === 'CREATE'} />
            <BasicInput placeholder="Hasło (opcjonalne)" icon={lockClosedOutline} ref={passRef} />

            <button type="button" className="ee-nomeeting--btn-continue ee-margin--vertical1" onClick={() => handleSubmit()}>KONTYNUUJ</button>

            <button type="button" className="ee-nomeeting--btn-reset" onClick={() => dispatch(setUsername(''))}>Nie ty?</button>
        </div>
    );

    return (
        <div className="ee-flex--column ee-align-main--center ee-align-cross--center">

            <div className="ee-flex--row">
                <p className="ee-nomeeting--title ee-margin--right05">{welcome}</p>
                <p className="ee-nomeeting--title ee-nomeeting--title-bold">{userText}</p>
                <p className="ee-nomeeting--title">!</p>
            </div>

            {user ? (<InputMeeting />) : (<InputUsername />)}

        </div>
    );
};

export default NoMeeting;
