import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import recommendationService from '../../services/recommendationService'

const initialState = {
    recommendations: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
}

export const getRecommendations = createAsyncThunk(
    'recommendation/get',
    async (reportId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await recommendationService.getRecommendations(reportId, token)
        } catch (error) {
            const message = error.response?.data?.message || error.message
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const recommendationSlice = createSlice({
    name: 'recommendation',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false
            state.isSuccess = false
            state.isError = false
            state.message = ''
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getRecommendations.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getRecommendations.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.recommendations = action.payload
            })
            .addCase(getRecommendations.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = recommendationSlice.actions
export default recommendationSlice.reducer
