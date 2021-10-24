import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PixelChanges } from '../../interfaces/Canvas';
import { ChatMessageInterface } from '../../interfaces/Chat';

export interface meetingState {

    /**
     * Name of the meeting
     */
    name: string;

    /**
     * User lists
     */
    activeUsers: string[];
    invitedUsers: string[];

    /**
     * Chat messages unique to the meeting
     */
    messages: ChatMessageInterface[];

    /**
     * Pixel array unique to the last canvas drawn
     */
    canvas: number[];

    /**
     * currently received changes from backend
     */
    currentChanges: PixelChanges[];
}

const initialState : meetingState = {

    name: 'Spotkanie',

    activeUsers: [],

    invitedUsers: [],

    messages: [],

    canvas: [],

    currentChanges: [],

};

const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        meetingCanvasUpdate: (state, action) => ({
            ...state,
            canvas: action.payload,
        }),
        // meetingCanvasChange: (state, action) => ({
        //     ...state,
        //     currentChanges: action.payload,
        // }),
        meetingAddMessage: (state, action: PayloadAction<ChatMessageInterface>) => ({
            ...state,
            messages: [...state.messages, action.payload],
        }),
        meetingPushChanges: (state, action: PayloadAction<PixelChanges>) => ({
            ...state,
            currentChanges: [...state.currentChanges, action.payload],
        }),
        meetingPopChanges: (state) => ({
            ...state,
            currentChanges: [],
        }),
    },
});

export default meetingSlice.reducer;

export const {
    meetingCanvasUpdate,
    // meetingCanvasChange,
    meetingAddMessage,
    meetingPushChanges,
    meetingPopChanges,
} = meetingSlice.actions;
