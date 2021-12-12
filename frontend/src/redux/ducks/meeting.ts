import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AxiosResponse } from 'axios';
import { PixelChanges } from '../../interfaces/Canvas';
import { PixelUpdate } from '../../interfaces/Canvas/PixelChanges';
import { ChatMessageInterface } from '../../interfaces/Chat';
import { UserInterface } from '../../interfaces/User/UserInterface';
import { MeetingService } from '../../services';

interface meetingUser {
    name: string,
    status: 'CONNECTED' | 'DISCONNECTED',
}

type fetchErrorTypes = 'NOT_STATE_UPDATE' | 'UNKNOWN';

export interface meetingStateInterface {

    /**
     * meeting ID
     */
    roomId: string;

    /**
     * Chat messages unique to the meeting
     */
    messages: ChatMessageInterface[];

    /**
     * Room creation timestamp
     */
    created: string;

    /**
     * Room update timestamp
     */
    lastUpdated: string;

    /**
     * Users that joined the room at least once with current status
     */
    currentUsers: meetingUser[];

    /**
     * currently drawn changes
     */
    // currentChanges: PixelChanges[];

    /**
     * received initial changes from backend
     */
    pixels: PixelUpdate[];

    /**
     * Received on websocket draw event
     */
    updatingPixels: PixelChanges[];

    /**
     * if drawing changes is in progress, then redux should not update currentChanges
     */
    // drawingChangesInProgress: boolean;

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
type meetingStateUpdateInterface = Omit<meetingStateInterface, 'loading'|'loadingError'|'errorMessage'|'currentChanges'|'drawingChangesInProgress'>;

const initialState : meetingStateInterface = {

    roomId: '',

    created: '',

    lastUpdated: '',

    currentUsers: [],

    messages: [],

    // currentChanges: [],

    pixels: [],

    updatingPixels: [],

    // drawingChangesInProgress: false,

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
            roomId: action.payload,
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
        meetingFetchError: (state, action: PayloadAction<fetchErrorTypes>) => ({
            ...state,
            loading: false,
            loadingError: true,
            errorMessage: action.payload,
        }),
        meetingChatAddMessage: (state, action: PayloadAction<ChatMessageInterface>) => ({
            ...state,
            messages: [...state.messages, action.payload],
        }),
        // meetingCanvasAddChanges: (state, action: PayloadAction<PixelChanges>) => ({
        //     ...state,
        //     pixels: [...state.pixels, action.payload],
        // }),
        // meetingCanvasActivateChanges: (state) => ({
        //     ...state,
        //     currentChanges: state.pixels,
        //     pixels: [],
        //     drawingChangesInProgress: true,
        // }),
        meetingCanvasPushChange: (state, action: PayloadAction<PixelChanges>) => ({
            ...state,
            updatingPixels: [...state.updatingPixels, action.payload],
        }),
        meetingCanvasPopChange: (state) => {
            const hasChanges = state.pixels.length > 1;
            let newPixels: PixelChanges[];

            if (hasChanges) newPixels = state.updatingPixels.slice(1);
            else newPixels = [];

            return {
                ...state,
                updatingPixels: newPixels,
            };
        },
        // meetingCanvasFinishChanges: (state) => ({
        //     ...state,
        //     currentChanges: [],
        //     drawingChangesInProgress: false,
        // }),
        meetingUserUpdate: (state, action: PayloadAction<meetingUser>) => {
            const users: meetingUser[] = JSON.parse(JSON.stringify(state.currentUsers));
            const userIndex = users.findIndex((u) => u.name === action.payload.name);

            if (userIndex !== -1) {
                users[userIndex].status = action.payload.status;
                return {
                    ...state,
                    currentUsers: users,
                };
            }

            return {
                ...state,
                currentUsers: [...users, action.payload],
            };
        },
        meetingCanvasCleanupInitial: (state) => ({
            ...state,
            pixels: [],
        }),
    },
});

export default meetingSlice.reducer;

const {
    meetingSetID,
    meetingFetchRequest,
    meetingFetchSuccess,
    meetingFetchError,
    meetingChatAddMessage,
    // meetingCanvasAddChanges,
    // meetingCanvasActivateChanges,
    // meetingCanvasFinishChanges,
    meetingCanvasPushChange,
    meetingCanvasPopChange,
    meetingCanvasCleanupInitial,
    meetingUserUpdate,
} = meetingSlice.actions;

export {
    meetingSetID,
    meetingFetchRequest,
    meetingFetchSuccess,
    meetingFetchError,
    meetingChatAddMessage,
    // meetingCanvasAddChanges,
    // meetingCanvasActivateChanges,
    // meetingCanvasFinishChanges,
    meetingCanvasPushChange,
    meetingCanvasPopChange,
    meetingCanvasCleanupInitial,
    meetingUserUpdate,
};

/**
 * Validates if received json is actually meeting state update
 * @param data possible meeting state update data
 * @returns asserted data
 */
const assertMeetingStateUpdate = (data: unknown): data is meetingStateUpdateInterface => (typeof data === 'object')
        && 'roomId' in (data as any)
        && ('created' in (data as any) && typeof (data as any).created === 'number')
        && ('messages' in (data as any) && Array.isArray((data as any).messages))
        && ('pixels' in (data as any) && Array.isArray((data as any).pixels));

/**
 * Validates meeting update object
 * @param data potential state object
 * @dispatch fetchSuccess on object validation. fetchError otherwise.
 */
export const meetingUpdateMiddleware = (data: any) => (dispatch: any) : void => {
    dispatch(meetingFetchRequest());

    console.log('meetingUpdateMiddleware', data);

    if (assertMeetingStateUpdate(data)) dispatch(meetingFetchSuccess(data));
    else dispatch(meetingFetchError('NOT_STATE_UPDATE'));
};
