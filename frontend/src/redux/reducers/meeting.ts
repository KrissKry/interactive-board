import { AnyAction } from 'redux';
import { meetingTypes } from '../types/meeting';

export interface meetingState {
    /**
     * Chat messages unique to the meeting
     */
    messages: string[];

    /**
     * Pixel array unique to the last canvas drawn
     */
    canvas: number[];
}

const initialState = {

    messages: [],

    canvas: [],

} as meetingState;

export const meetingReducer = (state = initialState, action: AnyAction) => {
    switch (action.type) {
        case meetingTypes.MEETING_CHAT_RECEIVE:
            return {
                ...state,
                messages: [...state.messages, action.payload],
            };
        case meetingTypes.MEETING_CANVAS_UPDATE:
            return {
                ...state,
                canvas: action.payload,
            };
        default:
            return {
                ...state,
            };
    }
};
