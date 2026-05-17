import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import soilService from '../../services/soilService'

const initialState = {
    reports: [],
    currentReport: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
}

export const uploadSoilReport = createAsyncThunk(
    'soil/upload',
    async (formData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await soilService.uploadReport(formData, token)
        } catch (error) {
            const message = error.response?.data?.message || error.message
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const getSoilReports = createAsyncThunk(
    'soil/getAll',
    async (_, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await soilService.getReports(token)
        } catch (error) {
            const message = error.response?.data?.message || error.message
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const getSoilReportById = createAsyncThunk(
    'soil/getById',
    async (id, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.user.token
            return await soilService.getReportById(id, token)
        } catch (error) {
            const message = error.response?.data?.message || error.message
            return thunkAPI.rejectWithValue(message)
        }
    }
)

export const soilSlice = createSlice({
    name: 'soil',
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
            .addCase(uploadSoilReport.pending, (state) => {
                state.isLoading = true
            })
            .addCase(uploadSoilReport.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.reports.push(action.payload)
            })
            .addCase(uploadSoilReport.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getSoilReports.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getSoilReports.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.reports = action.payload
            })
            .addCase(getSoilReports.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(getSoilReportById.pending, (state) => {
                state.isLoading = true
            })
            .addCase(getSoilReportById.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                state.currentReport = action.payload
            })
            .addCase(getSoilReportById.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = soilSlice.actions
export default soilSlice.reducer
