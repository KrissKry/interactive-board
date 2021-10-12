import { createSlice } from '@reduxjs/toolkit';
import { BrushLine } from '../../interfaces/Canvas';
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
}

const initialState : meetingState = {

    messages: [],

    canvas: [],

};

const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        meetingCanvasUpdate: (state, action) => ({
            ...state,
            canvas: action.payload,
        }),
        meetingAddMessage: (state, action) => ({
            ...state,
            messages: [...state.messages, action.payload],
        }),
    },
});

export default meetingSlice.reducer;

const {
    meetingCanvasUpdate,
    meetingAddMessage,
} = meetingSlice.actions;

export const meetingCanvasChange = (
    values: number[],
    brush: BrushLine,

) => (dispatch: any) => {
    // const canvas = realCanvas.slice(); // shallow copy
};

// export meetingCanvasSetup = ()
// 1. zapisz koordynaty
// 2. stwórz małą p5 z uwzględnieniem grubości
// 3. narysuj na niej linie
// 4. spisz piksele zmienione
// 5. do x,y dodaj położenie ich globalne
// 6. prześlij do API
