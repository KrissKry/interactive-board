import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { whiteFillColor } from '../../helpers/initial';
import { RGBColor } from '../../interfaces/Canvas';

interface userStateInterface {

    drawingMode: boolean;

    background: RGBColor;
}

const initialState : userStateInterface = {

    drawingMode: true,

    background: whiteFillColor,
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        toggleDrawingMode: (state) => ({
            ...state,
            drawingMode: !state.drawingMode,
        }),
        canvasChangeBackground: (state, action: PayloadAction<RGBColor>) => ({
            ...state,
            background: action.payload,
        }),
    },
});

export default canvasSlice.reducer;

const {
    toggleDrawingMode,
    canvasChangeBackground,
} = canvasSlice.actions;

export {
    toggleDrawingMode,
    canvasChangeBackground,
};
