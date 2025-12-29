import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'


export const fetchProducts = createAsyncThunk('product/fetchProducts',
    async ({ storeId }, thunkAPI) => {
        try {
            console.log("Redux fetchProducts: Starting fetch...")
            const { data } = await axios.get('/api/products' + (storeId ? `?storeId=${storeId}` : ''))
            console.log("Redux fetchProducts: Success, got products:", data.products?.length || 0)
            return data.products
        } catch (error) {
            console.error("Redux fetchProducts: Error:", error)
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchProducts.fulfilled, (state, action) => {
            console.log("Redux fetchProducts.fulfilled: Updating store with", action.payload?.length || 0, "products")
            state.list = action.payload
        })
        builder.addCase(fetchProducts.pending, (state, action) => {
            console.log("Redux fetchProducts.pending: Fetching products...")
        })
        builder.addCase(fetchProducts.rejected, (state, action) => {
            console.error("Redux fetchProducts.rejected:", action.payload)
        })
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer