import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import soilReducer from './slices/soilSlice'
import recommendationReducer from './slices/recommendationSlice'
import languageReducer from './slices/languageSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        soil: soilReducer,
        recommendation: recommendationReducer,
        language: languageReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
