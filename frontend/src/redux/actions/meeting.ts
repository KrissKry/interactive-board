import { useDispatch } from 'react-redux';
import { selectCanvasFromMeeting } from '../selectors';
import { meetingTypes } from '../types/meeting';

interface newValuesType {
    color: {
        r: number;
        g: number;
        b: number;
    },
    changes: {
        x: number;
        y: number;
    }[],
}

const R_OFFSET = 0;
const G_OFFSET = 1;
const B_OFFSET = 2;

const changeCanvas = (newCanvas: number[]) => ({
    type: meetingTypes.MEETING_CANVAS_UPDATE,
    payload: newCanvas,
});

export const synchroniseMeetingCanvas = (newValues: newValuesType) => {
    // const store = getStore()
    // let canvas = selectCanvasFromMeeting(store.meetingReducer.getState())
    const canvas : number[] = [1, 2, 3, 4];

    for (let i = 0; i < newValues.changes.length; i += 1) {
        const pixelAccessIndex = newValues.changes[i].x * newValues.changes[i].y;

        canvas[pixelAccessIndex + R_OFFSET] = newValues.color.r;
        canvas[pixelAccessIndex + G_OFFSET] = newValues.color.g;
        canvas[pixelAccessIndex + B_OFFSET] = newValues.color.b;
    }

    // dispatch(changeCanvas(canvas));
};
