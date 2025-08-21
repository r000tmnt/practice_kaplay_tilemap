import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './game';
import settingReducer from './setting';
import dialogueReducer from './dialogue';

const store = configureStore({
    reducer: {
        game: gameReducer,
        setting: settingReducer,
        dialogue: dialogueReducer
    }
})

export default store;