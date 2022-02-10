import { IonSpinner } from '@ionic/react';
// eslint-disable-next-line object-curly-newline
import { lockClosedOutline, personOutline, textOutline } from 'ionicons/icons';
import React, { useRef, useState } from 'react';
import { validate } from 'uuid';
import { BasicInput } from '../../../components/Input';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { meetingInitError, meetingInitSuccess } from '../../../redux/ducks/meeting';
import { setUsername } from '../../../redux/ducks/user';

type MeetingSegment = 'JOIN' | 'CREATE';

interface MeetingProps {
    // eslint-disable-next-line no-unused-vars
    createCallback: (pass?: string) => void;

    // eslint-disable-next-line no-unused-vars
    joinCallback: (id: string, pass?: string) => void;
}

const NoMeeting = ({ createCallback, joinCallback }: MeetingProps) : JSX.Element => {
    const dispatch = useAppDispatch();
    const appState = useAppSelector((state) => ({
        user: state.user.username,
        loading: state.meeting.loading,
        error: state.meeting.loadingError,
        errorMessage: state.meeting.errorMessage,
    }));

    // eslint-disable-next-line no-undef
    const userRef = useRef() as React.MutableRefObject<HTMLIonInputElement>;
    // eslint-disable-next-line no-undef
    const idRef = useRef() as React.MutableRefObject<HTMLIonInputElement>;
    // eslint-disable-next-line no-undef
    const passRef = useRef() as React.MutableRefObject<HTMLIonInputElement>;
    const [segment, setSegment] = useState<MeetingSegment>('CREATE');

    const welcome = 'Witaj, ';
    const userText = ` ${appState.user || 'nieznajomy'}`;
    const setUserText = ['Ustaw nazwę', 'użytkownika', 'zanim zaczniesz.'];
    const helpText = 'Dołącz do spotkania lub załóż nowe poniżej';

    const verifyUsername = (): void => {
        try {
            const name = userRef.current?.value as string;
            const matchedName = name.match(/[a-zA-Z0-9]+/g);

            if (!name || !name.length) {
                dispatch(meetingInitError('Za krótka nazwa użytkownika!'));
                throw new Error('');
            }
            if (name.split(' ').length > 1) {
                dispatch(meetingInitError('Nazwa użytkownika zawiera spacje!'));
                throw new Error('');
            }

            if (!matchedName?.toString() || !matchedName.length) {
                dispatch(meetingInitError('Niedozwolone znaki w nazwie użytkownika!'));
                throw new Error('');
            }

            dispatch(setUsername(matchedName[0].toString()));
            dispatch(meetingInitSuccess());
        } catch (error) {
            //
        }
    };

    const handleSubmit = (): void => {
        if (!(passRef.current.value as string)) {
            dispatch(meetingInitError('Wpisz hasło!'));
            return;
        }

        if (segment === 'CREATE') createCallback(passRef.current.value as string);
        else if (validate(idRef.current.value as string)) {
            joinCallback(idRef.current.value as string, passRef.current.value as string);
        } else {
            dispatch(meetingInitError('Niepoprawne ID!'));
        }
    };

    const InputUsername = () : JSX.Element => (
        <div className="ee-flex--column ee-align-cross--center">

            {/* eslint-disable-next-line react/jsx-one-expression-per-line */}
            <p>{setUserText[0]} <b>{setUserText[1]}</b> {setUserText[2]}</p>

            <BasicInput placeholder="Nazwa użytkownika" icon={personOutline} ref={userRef} maxLength={20} keyType="Enter" onKeydown={verifyUsername} />
            {appState.error ? (<p style={{ color: 'crimson' }}>{appState.errorMessage}</p>) : null}

            <button type="button" className="ee-nomeeting--btn-continue" onClick={() => verifyUsername()}>KONTYNUUJ</button>

        </div>
    );

    const InputMeeting = () : JSX.Element => (
        <div className="ee-flex--column ee-align-cross--center">
            <p>{helpText}</p>

            <div>
                <button type="button" className={['ee-nomeeting--btn-segment', segment === 'CREATE' ? 'ee-nomeeting--btn-segment-active' : 'ee-nomeeting--btn-segment-inactive'].join(' ')} onClick={() => setSegment('CREATE')}>STWÓRZ</button>
                <button type="button" className={['ee-nomeeting--btn-segment', segment === 'JOIN' ? 'ee-nomeeting--btn-segment-active' : 'ee-nomeeting--btn-segment-inactive'].join(' ')} onClick={() => setSegment('JOIN')}>DOŁĄCZ</button>
            </div>

            <BasicInput placeholder="ID Spotkania" icon={textOutline} ref={idRef} disabled={segment === 'CREATE' || appState.loading} maxLength={36} />
            <BasicInput placeholder="Hasło" icon={lockClosedOutline} ref={passRef} disabled={appState.loading} />

            {appState.loading ? (<IonSpinner />) : null}
            {appState.error ? (<p style={{ color: 'crimson' }}>{appState.errorMessage}</p>) : null}
            <button type="button" className="ee-nomeeting--btn-continue ee-margin--vertical1" onClick={() => handleSubmit()} disabled={appState.loading}>KONTYNUUJ</button>

            <button type="button" className="ee-nomeeting--btn-reset" onClick={() => dispatch(setUsername(''))} disabled={appState.loading}>Nie ty?</button>
        </div>
    );

    return (
        <div className="ee-flex--column ee-align-main--center ee-align-cross--center">

            <div className="ee-flex--row ee-flex--wrap ee-nomeeting--title-wrapper">
                <p className="ee-nomeeting--title ee-margin--right05">{welcome}</p>
                <p className="ee-nomeeting--title ee-nomeeting--title-bold">{userText}</p>
                <p className="ee-nomeeting--title">!</p>
            </div>

            {appState.user ? (<InputMeeting />) : (<InputUsername />)}

        </div>
    );
};

export default NoMeeting;
