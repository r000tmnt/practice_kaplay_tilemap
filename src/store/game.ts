import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: 'game',
    initialState: {
        menuOpen: 0
    },
    reducers : {
        setMenu: (state, action) => {
            state.menuOpen = action.payload
        }
    }
})

export const { 
    setMenu
} = gameSlice.actions
export default gameSlice.reducer