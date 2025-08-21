import { createSlice } from "@reduxjs/toolkit";

const dialogueSlice = createSlice({
    name: 'dialogue',
    initialState: {
        dialogue: '',
        name: '',
        index: 0,
        mode: '',
        speed: 0.2, // In seconds
        log: [] as string[],
        flag: {} as Record<string, boolean>,
        point: {} as Record<string, number>,
    },
    reducers: {
        setDialogue: (state, action) => {
            state.dialogue = action.payload
        },
        setName: (state, action) => {
            state.name = action.payload
        },
        setIndex: (state, action) => {
            state.index = action.payload
        },
        setMode: (state, action) => {
            state.mode = action.payload
        },
        setSpeed: (state, action) => {
            state.speed = action.payload
        },
        setLog: (state, action) => {
            state.log.push(action.payload)
        },
        clearLog: (state) => {
            state.log.splice(0)
        },
        setFlag: (state, action) => {
            state.flag[action.payload] = true
        },
        setPoint: (state, action) => {
            state.point[action.payload[0]] += action.payload[1]
        },
    }
})

export const { setDialogue, setName, setIndex, setMode, setSpeed, setLog, clearLog, setFlag, setPoint } = dialogueSlice.actions
export default dialogueSlice.reducer