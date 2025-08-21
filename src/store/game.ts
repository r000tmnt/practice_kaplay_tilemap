import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: 'game',
    initialState: {
        menuOpen: 0,
        textLabel: [],
    },
    reducers : {
        setMenu: (state, action) => {
            state.menuOpen = action.payload
        },
        setTextLabel: (state, action) => {
            state.textLabel = action.payload
        }
    }
})

export const { 
    setMenu, setTextLabel
} = gameSlice.actions
export default gameSlice.reducer