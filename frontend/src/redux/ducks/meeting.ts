import { createSlice } from '@reduxjs/toolkit';
import { PixelChanges } from '../../interfaces/Canvas';
/**
 * @username string representing user who sent the message
 * @message string with the message
 */
interface messageInterface {
    username: string;
    message: string;
}

export interface meetingState {
    /**
     * Chat messages unique to the meeting
     */
    messages: messageInterface[];

    /**
     * Pixel array unique to the last canvas drawn
     */
    canvas: number[];

    /**
     * currently received changes from backend
     */
    currentChanges: PixelChanges;
}

const initialState : meetingState = {

    messages: [],

    canvas: [],

    currentChanges: {
        color: {
            red: 0,
            green: 0,
            blue: 0,
        },
        pixels: [],
    },

};

const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        meetingCanvasUpdate: (state, action) => ({
            ...state,
            canvas: action.payload,
        }),
        meetingCanvasChange: (state, action) => ({
            ...state,
            currentChanges: action.payload,
        }),
        meetingAddMessage: (state, action) => ({
            ...state,
            messages: [...state.messages, action.payload],
        }),
    },
});

export default meetingSlice.reducer;

export const {
    meetingCanvasUpdate,
    meetingCanvasChange,
    meetingAddMessage,
} = meetingSlice.actions;

// jedna funkcja na wysylanie, otrzymanie odpowiedzi
// druga na odbieranie
// export meetingCanvasSetup = ()
// 1. zapisz koordynaty
// 2. stwórz małą p5 z uwzględnieniem grubości
// 3. narysuj na niej linie
// 4. spisz piksele zmienione
// 5. do x,y dodaj położenie ich globalne
// 6. prześlij do API

// nowy plan
// zapisz aktualny stan
// narysuj u siebie
// porownaj z poprzednim
// wyslij do backendu
