import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: 'game',
    initialState: {
        menuOpen: 0,
        textLabel: [],
        units: [],
        inventory: [
            { id: 1, amount: 5 },
            { id: 2, amount: 5 },
            { id: 3, amount: 5 },
        ] as { id: number, amount: number }[],        
    },
    reducers : {
        setMenu: (state, action) => {
            state.menuOpen = action.payload
        },
        setTextLabel: (state, action) => {
            state.textLabel = action.payload
        },
        setUnits: (state, action) => {
            state.units = action.payload
        },
        setInventory: (state, action) => {
            state.inventory = action.payload
        },        
    }
})

export const { 
    setMenu, setTextLabel, setUnits,
    setInventory,
} = gameSlice.actions
export default gameSlice.reducer