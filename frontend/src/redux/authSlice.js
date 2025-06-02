import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isVerified: false,
  isAdmin: false,
  isEmailSent: false,
  isPasswordReset: false,
  isPasswordChanged: false,
  isEmailVerified: false,
  isEmailVerifiedError: false,
  isEmailVerifiedLoading: false,
  isEmailVerifiedSuccess: false,
  isEmailVerifiedErrorMessage: null,
  isEmailVerifiedErrorCode: null,
};

const API_URL = "http://localhost:4000/api/v1/auth/";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error("Failed to register user");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json(); // Burada hata mesajını çekiyoruz

      console.log("Login response data:", data); // Hata mesajını kontrol etmek için
      if (!response.ok) {
        return rejectWithValue(data.message || "Giriş başarısız"); // Backend'den gelen mesajı al
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}logout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to logout user");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}verify-email/${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to verify email");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const sendVerificationEmail = createAsyncThunk(
  "auth/sendVerificationEmail",
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}send-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Failed to send verification email");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}forgotpassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error("Failed to reset password");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const performPasswordReset = createAsyncThunk(
  "auth/performPasswordReset",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}resetpassword/${token}`, {
        // Backend'deki PUT endpoint'i
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Cookie'lerin gönderilmesi için
        body: JSON.stringify({ password }), // Backend bu body'yi bekliyor
      });
      const data = await response.json(); // Hata veya başarı mesajını al
      if (!response.ok) {
        throw new Error(data.message || "Şifre sıfırlanamadı.");
      }
      // Başarılı olursa backend sendTokenResponse çağıracak ve { success: true, token, data: { user } } dönecek
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}updatepassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });
      if (!response.ok) {
        throw new Error("Failed to change password");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}updatedetails`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}avatar`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }
      const data = await response.json();
      console.log("Avatar upload response data:", data); // Debugging log
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to get user profile");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.isEmailSent = false;
      state.isPasswordReset = false;
      state.isPasswordChanged = false;
      state.isEmailVerified = false;
      state.isEmailVerifiedError = false;
      state.isEmailVerifiedLoading = false;
      state.isEmailVerifiedSuccess = false;
      state.isEmailVerifiedErrorMessage = null;
      state.isEmailVerifiedErrorCode = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailSent = true;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = false;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = false;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
        
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
        
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = false;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = true;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(sendVerificationEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(sendVerificationEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.isEmailSent = true;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(sendVerificationEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailSent = true;
        state.isPasswordReset = true;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = true;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(uploadAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        console.log("Avatar upload response data:", action.payload);
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        console.log("User profile data:", action.payload);
        state.isAdmin = action.payload.data.role === "admin";
        state.user = action.payload.data;
        state.isEmailSent = false;
        state.isPasswordReset = false;
        state.isPasswordChanged = false;
        state.isEmailVerified = false;
        state.isEmailVerifiedError = false;
        state.isEmailVerifiedLoading = false;
        state.isEmailVerifiedSuccess = true;
        state.isEmailVerifiedErrorMessage = null;
        state.isEmailVerifiedErrorCode = null;
        state.error = null;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
      })
      .addCase(performPasswordReset.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isPasswordChanged = false;
      })
      .addCase(performPasswordReset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.isPasswordChanged = true;
        state.error = null;
      })
      .addCase(performPasswordReset.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.isPasswordChanged = false;
      })
    

  },
});
export const { clearErrors, clearMessages } = authSlice.actions;

export default authSlice.reducer;
