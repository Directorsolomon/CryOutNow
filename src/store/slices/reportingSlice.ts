import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportingService, ReportSchedule, CreateReportScheduleDto } from '@/services/reportingService'

interface ReportingState {
  schedules: ReportSchedule[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportingState = {
  schedules: [],
  loading: false,
  error: null,
}

export const fetchSchedules = createAsyncThunk(
  'reporting/fetchSchedules',
  async () => {
    const schedules = await reportingService.getSchedules()
    return schedules
  }
)

export const createSchedule = createAsyncThunk(
  'reporting/createSchedule',
  async (schedule: CreateReportScheduleDto) => {
    const newSchedule = await reportingService.createSchedule(schedule)
    return newSchedule
  }
)

export const updateSchedule = createAsyncThunk(
  'reporting/updateSchedule',
  async ({ id, updates }: { id: string; updates: Partial<CreateReportScheduleDto> }) => {
    const updatedSchedule = await reportingService.updateSchedule(id, updates)
    return updatedSchedule
  }
)

export const deleteSchedule = createAsyncThunk(
  'reporting/deleteSchedule',
  async (id: string) => {
    await reportingService.deleteSchedule(id)
    return id
  }
)

export const toggleSchedule = createAsyncThunk(
  'reporting/toggleSchedule',
  async ({ id, enabled }: { id: string; enabled: boolean }) => {
    const updatedSchedule = await reportingService.toggleSchedule(id, enabled)
    return updatedSchedule
  }
)

export const sendTestReport = createAsyncThunk(
  'reporting/sendTestReport',
  async (schedule: CreateReportScheduleDto) => {
    await reportingService.sendTestReport(schedule)
  }
)

const reportingSlice = createSlice({
  name: 'reporting',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.loading = false
        state.schedules = action.payload
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch schedules'
      })
      .addCase(createSchedule.fulfilled, (state, action) => {
        state.schedules.push(action.payload)
      })
      .addCase(updateSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.schedules[index] = action.payload
        }
      })
      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter(s => s.id !== action.payload)
      })
      .addCase(toggleSchedule.fulfilled, (state, action) => {
        const index = state.schedules.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.schedules[index] = action.payload
        }
      })
  },
})

export default reportingSlice.reducer 