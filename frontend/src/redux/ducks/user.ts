import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface userStateInterface {

    username: string;
}

const initialState : userStateInterface = {

    username: '',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUsername: (state, action: PayloadAction<string>) => ({
            ...state,
            username: action.payload,
        }),
    },
});

export default userSlice.reducer;

const {
    setUsername,
} = userSlice.actions;

export {
    setUsername,
};
