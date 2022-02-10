import type { meetingState } from '../reducers/meeting';

export const selectCanvasFromMeeting = (state: meetingState) => state.canvas;
