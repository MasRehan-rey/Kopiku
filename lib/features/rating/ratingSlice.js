import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchUserRatings = createAsyncThunk('rating/fetchUserRatings', async ({ getToken }, thunkAPI) => {
    try {
        console.log("Rating thunk: Fetching user ratings");
        const token = await getToken()
        const { data } = await axios.get('/api/rating', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("Rating thunk: API response:", data);
        return data ? data.ratings : []
    } catch (error) {
        console.error("Rating thunk: Error:", error);
        return thunkAPI.rejectWithValue(error.response.data)
    }
    
})


const ratingSlice = createSlice({
    name: 'rating',
    initialState: {
        ratings: [],
    },
    reducers: {
        addRating: (state, action) => {
            state.ratings.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUserRatings.fulfilled, (state, action) => {
            console.log("Rating slice: Fetch fulfilled, payload:", action.payload);
            state.ratings = action.payload
        })
    }
})

export const { addRating } = ratingSlice.actions

export default ratingSlice.reducer