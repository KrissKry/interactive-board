import { createSlice } from '@reduxjs/toolkit';

export interface AppMenus {

    chatExpanded: boolean;

    utilityExpanded: boolean;
}

const initialState: AppMenus = {
    chatExpanded: false,

    utilityExpanded: false,
};

const menuSlice = createSlice({
    name: 'menus',
    initialState,
    reducers: {
        toggleChatMenu: (state) => ({
            ...state,
            chatExpanded: !state.chatExpanded,
        }),
        toggleUtilityMenu: (state) => ({
            ...state,
            utilityExpanded: !state.utilityExpanded,
        }),
    },
});

export default menuSlice.reducer;

const {
    toggleChatMenu,
    toggleUtilityMenu,
} = menuSlice.actions;

export {
    toggleChatMenu,
    toggleUtilityMenu,
};