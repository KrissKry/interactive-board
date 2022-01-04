import { createSlice } from '@reduxjs/toolkit';

export interface AppMenus {

    chatExpanded: boolean;

    utilityExpanded: boolean;

    toolbarExpanded: boolean;
}

const initialState: AppMenus = {
    chatExpanded: false,

    utilityExpanded: false,

    toolbarExpanded: false,
};

const menuSlice = createSlice({
    name: 'menus',
    initialState,
    reducers: {
        toggleChatMenu: (state) => ({
            ...state,
            chatExpanded: !state.chatExpanded,
            utilityExpanded: false,
        }),
        toggleUtilityMenu: (state) => ({
            ...state,
            utilityExpanded: !state.utilityExpanded,
            chatExpanded: false,
        }),
        toggleToolbarMenu: (state) => ({
            ...state,
            toolbarExpanded: !state.toolbarExpanded,
        }),
    },
});

export default menuSlice.reducer;

const {
    toggleChatMenu,
    toggleUtilityMenu,
    toggleToolbarMenu,
} = menuSlice.actions;

export {
    toggleChatMenu,
    toggleUtilityMenu,
    toggleToolbarMenu,
};
