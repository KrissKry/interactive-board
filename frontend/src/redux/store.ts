import { configureStore } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import meeting from './ducks/meeting';
import user from './ducks/user';
import menus from './ducks/menus';
import canvas from './ducks/canvas';

const store = configureStore({
    reducer: {
        meeting,
        user,
        menus,
        canvas,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch | Dispatch<any>;
