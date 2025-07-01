import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import {
  resetErrorAction,
  resetSuccesAction,
} from "../globalSlice/globalSlice";
import BASE_URL from "../../../utils/baseURL";

//initialstate
const INITIAL_STATE = {
  loading: false,
  error: null,
  categories: [
    { _id: "1", name: "Technology" },
    { _id: "2", name: "Health" },
    { _id: "3", name: "Lifestyle" },
    { _id: "4", name: "Travel" }
  ], // Default categories for testing
  category: null,
  success: false,
};

//!Fetch categories
export const fetchCategoriesAction = createAsyncThunk(
  "categories/lists",
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/categories`);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

//! Create category action
export const createCategoryAction = createAsyncThunk(
  "categories/create",
  async (payload, { rejectWithValue, getState, dispatch }) => {
    try {
      // Get token from user state
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post(`${BASE_URL}/categories`, payload, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

//! Update category action
export const updateCategoryAction = createAsyncThunk(
  "categories/update",
  async ({ id, name }, { rejectWithValue, getState, dispatch }) => {
    try {
      // Get token from user state
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(`${BASE_URL}/categories/${id}`, { name }, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

//! Delete category action
export const deleteCategoryAction = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      // Get token from user state
      const token = getState()?.users?.userAuth?.userInfo?.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.delete(`${BASE_URL}/categories/${id}`, config);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
  }
);

//! categories slices
const categoriesSlice = createSlice({
  name: "categories", // Fixed: was "posts", should be "categories"
  initialState: INITIAL_STATE,
  extraReducers: (builder) => {
    //fetch categories
    builder.addCase(fetchCategoriesAction.pending, (state, action) => {
      state.loading = true;
    });
    //handle fulfilled state
    builder.addCase(fetchCategoriesAction.fulfilled, (state, action) => {
      // Fixed: Extract categories array from the response
      const fetchedCategories = action.payload.categories || action.payload;
      // Keep default categories if API returns empty array
      if (Array.isArray(fetchedCategories) && fetchedCategories.length > 0) {
        state.categories = fetchedCategories;
      }
      // If API returns empty, keep the default categories in initial state
      state.success = true;
      state.loading = false;
      state.error = null;
    });
    //* Handle the rejection
    builder.addCase(fetchCategoriesAction.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Create category
    builder.addCase(createCategoryAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createCategoryAction.fulfilled, (state, action) => {
      // Add new category to the list
      state.categories.push(action.payload.category);
      state.success = true;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(createCategoryAction.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Update category
    builder.addCase(updateCategoryAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateCategoryAction.fulfilled, (state, action) => {
      // Update category in the list
      const index = state.categories.findIndex(cat => cat._id === action.payload.category._id);
      if (index !== -1) {
        state.categories[index] = action.payload.category;
      }
      state.success = true;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(updateCategoryAction.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Delete category
    builder.addCase(deleteCategoryAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteCategoryAction.fulfilled, (state, action) => {
      // Remove category from the list (we need to pass the id from the component)
      // Since the API doesn't return the deleted category, we'll handle this in the component
      state.success = true;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(deleteCategoryAction.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    //! Reset error action
    builder.addCase(resetErrorAction.fulfilled, (state) => {
      state.error = null;
    });
    //! Reset success action
    builder.addCase(resetSuccesAction.fulfilled, (state) => {
      state.success = false;
    });
  },
});

//! generate reducer
const categoriesReducer = categoriesSlice.reducer;

export default categoriesReducer;