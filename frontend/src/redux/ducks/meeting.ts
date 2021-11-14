import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
 * Used for meeting data update, id is ommited, as it's already set
 */
type meetingStateUpdateInterface = Omit<meetingStateInterface, 'id'|'loading'|'loadingError'|'errorMessage'>;

const initialState : meetingStateInterface = {

    id: '',

    name: 'Spotkanie',

    activeUsers: [],

    invitedUsers: [],

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
} = meetingSlice.actions;

export {
    meetingChatAddMessage,
    meetingCanvasSet,
    meetingCanvasPushChanges,
    meetingCanvasPopChanges,
    meetingSetID,
};

/**
 * Validates if received json is actually meeting state update
 * @param data possible meeting state update data
 * @returns asserted data
 */
const assertMeetingStateUpdate = (data: unknown): data is meetingStateUpdateInterface => (typeof data === 'object')
        && ('messages' in (data as any) && Array.isArray((data as any).messages))
        && ('canvas' in (data as any) && Array.isArray((data as any).canvas));

/**
 * Fetches and updates internal app state when meeting is created or joined
 * @param id meeting id sent to API
 * @returns void
 */
export const meetingUpdate = (id: string) => (dispatch: any) : void => {
    dispatch(meetingFetchRequest());
    const service = MeetingService.getInstance();

    service.fetchMeetingDataByID(id)
        .then((resp) => {
            /* if data is meeting state update type, dispatches update action */
            if (resp.status === 200 && assertMeetingStateUpdate(resp.data)) {
                dispatch(meetingFetchSuccess(resp.data));
            /* couldnt assert meeting update or status isnt HTTP.OK */
            } else {
                // eslint-disable-next-line no-console
                console.error('Response', resp.data);
                dispatch(meetingFetchError('Unknown fetch error'));
            }
        })
        .catch((error) => {
            dispatch(meetingFetchError(error));
        });
};
