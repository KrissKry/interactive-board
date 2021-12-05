import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Axios, AxiosResponse } from 'axios';
import { PixelChanges } from '../../interfaces/Canvas';
import { ChatMessageInterface } from '../../interfaces/Chat';
import { MeetingService } from '../../services';

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
            errorMessage: '',
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
        testMeetingUpdateId: (state, action: PayloadAction<string>) => ({
            ...state,
            id: action.payload,
            name: `Spotkanie ${action.payload}`,
            messages: [],
            canvas: [],
            currentChanges: [],
            loading: false,
            loadingError: false,
            errorMessage: '',
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
    testMeetingUpdateId,
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
    testMeetingUpdateId,
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
export const meetingRequestValidation = (apiResponse: Promise<AxiosResponse>) => (dispatch: any) : void => {
    dispatch(meetingFetchRequest());

    apiResponse
        .then((response) => {
            if (assertMeetingStateUpdate(response.data)) {
                dispatch(meetingFetchSuccess(response.data));
            } else {
                console.log(response.data);
                dispatch(meetingFetchError('NOT_MEETING_STATE_UPDATE'));
            }
        })
        .catch((error: any) => {
            // STATUS_CODE !== (200, 299)
            if (error.response) {
                dispatch(meetingFetchError('STATUS_CODE_ERROR'));
                console.warn(error.response.data);
                console.warn(error.response.status);
                console.warn(error.response.headers);

            // NO RESPONSE
            } else if (error.request) {
                dispatch(meetingFetchError('NO_RESPONSE'));
                console.warn(error.request);

            // STH HAPPENED XD
            } else {
                dispatch(meetingFetchError('UNKNOWN_ERROR'));
                console.warn('Error', error.message);
            }

            console.warn(error.config);
        });
};

interface testMeetingUpdate {
    id: number;
}

const responseHasStringId = (data: unknown) : data is testMeetingUpdate => (typeof data === 'object') && ('id' in (data as any));

// eslint-disable-next-line max-len
export const testMeetingRequestValidation = (apiResponse: Promise<AxiosResponse>) => (dispatch: any) : void => {
    dispatch(meetingFetchRequest());

    apiResponse
        .then((response) => {
            if (response.status === 200) {
                // const body = response.data.id as string;
                // if (response.data && response.data.id && typeof response.data.id === 'string') {
                if (responseHasStringId(response.data)) {
                    dispatch(testMeetingUpdateId(response.data.id.toString()));
                } else {
                    console.log('[UPS] Bez dispatcha z nowym spotkaniem: ', response.data);
                    dispatch(meetingFetchError('STATUS_ERROR'));
                }
            }
        })
        .catch((error: any) => {
            console.error('[UPS] EEERROR', error);
            dispatch(meetingFetchError('FATAL_ERROR'));
        });
};
