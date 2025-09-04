import { createSlice } from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: 'game',
    initialState: {
        menuOpen: 0,
        innerMenuOpen: 0,
        textLabel: [],
        units: [],
        items: [],
        skills: [],
        inventory: [
            { id: 1, amount: 5 },
            { id: 2, amount: 5 },
            { id: 3, amount: 5 },
        ] as { id: number, amount: number }[],
        encounter: false,
        lastKnownPosition: {} as { x: number, y: number }
    },
    reducers : {
        setMenu: (state, action) => {
            switch(action.payload.type){
                case 1:
                    state.menuOpen = action.payload.value
                break;
                case 2:
                    state.innerMenuOpen = action.payload.value
                break;
            }
        },
        setTextLabel: (state, action) => {
            state.textLabel = action.payload
        },
        setList: (state, action) => {
            switch(action.payload.type){
                case 1:
                    state.units = action.payload.data
                break;
                case 2:
                    state.items = action.payload.data
                break;
                case 3:
                    state.skills = action.payload.data
                break;                
            }
        },
        setInventory: (state, action) => {
            state.inventory = action.payload
        },
        setEncounter: (state, action) => {
            state.encounter = action.payload
        },
        setLastKnownPosition: (state, action) => {
            state.lastKnownPosition = action.payload
        }
    }
})

export const { 
    setMenu, setTextLabel, setList,
    setInventory, setEncounter, setLastKnownPosition
} = gameSlice.actions
export default gameSlice.reducer