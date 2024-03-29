import {createSlice, PayloadAction, createAsyncThunk} from "@reduxjs/toolkit";
import {ApiUrl} from "../../config";
import httpService, {HttpError} from "../../httpService/httpService";
import {IApiConfig} from "../../httpService/httpService.interface";
import {UserInfoResponse, UserPermissions, UserInfo} from "../../interfaces/user.interface";

let userAuth = null;
const isUserAuth = localStorage.getItem("loyalty-crm-user-auth");

if(isUserAuth) {
    userAuth = JSON.parse(isUserAuth).value;
}

enum Role {ADMIN, MERCHANT, MERCHANT_EMPLOYEE}

interface UserState {
    isAuth: boolean;
    fullName: string;
    username: string;
    loadingInfo: boolean;
    fetchError: null | string;
    role: Role;
    permissions?: UserPermissions[];
}

const initialState: UserState = {
    isAuth: userAuth ?? false, // Nullish coalescing operator
    fullName: "",
    username: "",
    loadingInfo: false,
    fetchError: null,
    role: Role.MERCHANT,
};

export const fetchUserInfo= createAsyncThunk(
    "user/fetchUserInfo",
    async ( _: void, thunkAPI) => {
        try {
            const apiConfig: IApiConfig = {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            }

            const responseJson = await httpService<UserInfo>(apiConfig, `${ApiUrl}get_me`);
            return responseJson;
        } catch (error) {
            if(error instanceof HttpError) {
                console.log(error.getErrorDetails());
            }
            return thunkAPI.rejectWithValue('Возникла ошибка во время получения данных пользователя');
        }
    }
)

export const userSlice = createSlice({
    name: "user",
    initialState: initialState,
    reducers: {
        signInSuccess: (state, action: PayloadAction<string>) => {
            state.isAuth = true;
            state.fullName = action.payload;
        },
        startLoadingUserInfo: (state) => {
            state.loadingInfo = true;
        },
        endLoadingUserInfo: (state) => {
            state.loadingInfo = false;
        },
        setUserInfo: (state, action: PayloadAction<string>) => {
            state.isAuth = true;
            state.fullName = action.payload;
        },
        logout: (state) => {
            state.isAuth = false;
            state.fullName = "";
            state.loadingInfo = false;
        },
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<UserInfo>) => {
            state.isAuth = true;
            state.fullName = `${action.payload.last_name} ${action.payload.first_name}`;
            state.permissions = action.payload.permissions;
            state.loadingInfo = false;
        });
        builder.addCase(fetchUserInfo.pending, (state, action) => {
            state.loadingInfo = true;
        });
        builder.addCase(fetchUserInfo.rejected, (state, action) => {
            state.loadingInfo = false;
            state.fetchError = action.payload as string;
        });
    }
});

export const {signInSuccess, setUserInfo, logout} =  userSlice.actions;

export default userSlice.reducer;