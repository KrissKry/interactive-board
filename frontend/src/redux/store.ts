import { configureStore } from '@reduxjs/toolkit';
import { Dispatch } from 'react';
import meeting from './ducks/meeting';

const store = configureStore({
    reducer: {
        meeting,
    },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch | Dispatch<any>;
