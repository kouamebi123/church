import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api';

// Configure axios avec le token par défaut s'il existe
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Fonction pour mettre à jour le token dans axios
const updateAxiosToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Async thunks
export const getMembers = createAsyncThunk(
  'members/getMembers',
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const getMember = createAsyncThunk(
  'members/getMember',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/users`, memberData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, memberData }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/users/${id}`, memberData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  members: [],
  currentMember: null,
  isLoading: false,
  error: null,
  totalMembers: 0,
  page: 1,
  limit: 10
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Members
      .addCase(getMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload.data;
        state.totalMembers = action.payload.total;
      })
      .addCase(getMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Get Single Member
      .addCase(getMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload.data;
      })
      .addCase(getMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Create Member
      .addCase(createMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.unshift(action.payload.data);
        state.totalMembers += 1;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Update Member
      .addCase(updateMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.members.findIndex(
          (member) => member._id === action.payload.data._id
        );
        if (index !== -1) {
          state.members[index] = action.payload.data;
        }
        state.currentMember = action.payload.data;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      })
      // Delete Member
      .addCase(deleteMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter(
          (member) => member._id !== action.payload
        );
        state.totalMembers -= 1;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Une erreur est survenue';
      });
  }
});

export const { setPage, setLimit, clearError } = membersSlice.actions;
export default membersSlice.reducer;
