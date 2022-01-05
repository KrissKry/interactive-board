import { createSlice } from '@reduxjs/toolkit';

interface userStateInterface {

    drawingMode: boolean;
}

const initialState : userStateInterface = {

    drawingMode: true,
};

const canvasSlice = createSlice({
    name: 'canvas',
    initialState,
    reducers: {
        toggleDrawingMode: (state) => ({
            drawingMode: !state.drawingMode,
        }),
    },
});

export default canvasSlice.reducer;

const {
    toggleDrawingMode,
} = canvasSlice.actions;

export {
    toggleDrawingMode,
};
