import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { PixelChanges } from '../../interfaces/Canvas';
import { ChatMessageInterface } from '../../interfaces/Chat';
import { UserInterface } from '../../interfaces/User/UserInterface';
import { MeetingService } from '../../services';

interface meetingUsers {
    name: string,
    status: string,
}

export interface meetingStateInterface {

    /**
     * meeting ID
     */
    id: string;

    /**
     * Name of the meeting
     */
    name: string;

    /**
     * User lists
     */
    // activeUsers: string[];
    // invitedUsers: string[];
    allMeetingUsers: meetingUsers[];
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

    users: UserInterface[],

    /**
     * Meeting data fetch in progress
     */
    loading: boolean;

    /**
     * Meeting data fetch failed
     */
    loadingError: boolean;

    /**
     * Meeting fetch failed message
     */
    errorMessage: string;
}

/**
 * Used for meeting data update, loading/error data is ommited, as it's already set
 */
type meetingStateUpdateInterface = Omit<meetingStateInterface, 'loading'|'loadingError'|'errorMessage'|'currentChanges'>;

const initialState : meetingStateInterface = {

    id: '',

    name: 'Spotkanie',

    // activeUsers: [],

    // invitedUsers: [],
    users: [],

    allMeetingUsers: [],

    messages: [],

    canvas: [],

    currentChanges: [],

    loading: false,

    loadingError: false,

    errorMessage: '',

};

const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
        meetingSetID: (state, action: PayloadAction<string>) => ({
            ...state,
            id: action.payload,
        }),
        meetingFetchRequest: (state) => ({
            ...state,
            loading: true,
            loadingError: false,
        }),
        // eslint-disable-next-line max-len
        meetingFetchSuccess: (state, action: PayloadAction<meetingStateUpdateInterface>) => ({
            ...state,
            ...action.payload,
            loading: false,
            loadingError: false,
            errorMessage: '',
        }),
        meetingFetchError: (state, action: PayloadAction<string>) => ({
            ...state,
            loading: false,
            loadingError: true,
            errorMessage: action.payload,
        }),
        meetingChatAddMessage: (state, action: PayloadAction<ChatMessageInterface>) => ({
            ...state,
            messages: [...state.messages, action.payload],
        }),
        meetingCanvasSet: (state, action) => ({
            ...state,
            canvas: action.payload,
        }),
        meetingCanvasPushChanges: (state, action: PayloadAction<PixelChanges>) => ({
            ...state,
            currentChanges: [...state.currentChanges, action.payload],
        }),
        meetingCanvasPopChanges: (state) => ({
            ...state,
            currentChanges: [],
        }),
        meetingUpdateTestUsers: (state, action: PayloadAction<meetingUsers>) => ({
            ...state,
            allMeetingUsers: [...state.allMeetingUsers, action.payload],
        }),
    },
});

export default meetingSlice.reducer;

const {
    meetingChatAddMessage,
    meetingCanvasSet,
    meetingCanvasPushChanges,
    meetingCanvasPopChanges,
    meetingSetID,
    meetingFetchRequest,
    meetingFetchSuccess,
    meetingFetchError,
    meetingUpdateTestUsers,
} = meetingSlice.actions;

export {
    meetingChatAddMessage,
    meetingCanvasSet,
    meetingCanvasPushChanges,
    meetingCanvasPopChanges,
    meetingSetID,
    meetingFetchRequest,
    meetingFetchSuccess,
    meetingFetchError,
    meetingUpdateTestUsers,
};

/**
 * Validates if received json is actually meeting state update
 * @param data possible meeting state update data
 * @returns asserted data
 */
const assertMeetingStateUpdate = (data: unknown): data is meetingStateUpdateInterface => (typeof data === 'object')
        && ('messages' in (data as any) && Array.isArray((data as any).messages))
        && ('canvas' in (data as any) && Array.isArray((data as any).canvas));

// eslint-disable-next-line max-len
export const meetingRequestValidation = (apiResponse: JSON) => (dispatch: any) : void => {
    dispatch(meetingFetchRequest());
        if (assertMeetingStateUpdate(apiResponse)) {
            dispatch(meetingFetchSuccess(apiResponse));
        } else {
            console.log(apiResponse);
            dispatch(meetingFetchError('NOT_MEETING_STATE_UPDATE'));
        }
};

export const meetingDataUpdateValidation = (response: any) => (dispatch: any) : void => {
    dispatch(meetingFetchRequest());

    if (assertMeetingStateUpdate(response)) {
        dispatch(meetingFetchSuccess(response));
    } else {
        console.log(response);
        dispatch(meetingFetchError('NOT_MEETING_STATE_UPDATE'));
    }
};
