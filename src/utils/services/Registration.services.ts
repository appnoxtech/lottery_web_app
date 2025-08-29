import { type AxiosResponse } from "axios";
import { get, post, del } from "../api.util";
import storage from "redux-persist/lib/storage";
import { handleApiError } from "../../hooks/handleApiError";

const userSignup = async (signupData: any): Promise<AxiosResponse | void> => {
  try {
    const response = await post(`register`, signupData);
    return response;
  } catch (error: any) {
    console.error("Signup error: ", error);
    throw error;
  }
};

const userSignIn = async (signinData: any): Promise<AxiosResponse<any> | void> => {
  try {
    const apiUrl = "login";
    const response = await post(apiUrl, signinData);
    return response;
  } catch (error: any) {
    console.error("Signin error:", error);
    throw error;
  }
};


const userSendOTP = async (payload: any): Promise<AxiosResponse | void> => {
  try {
    const response = await post("send-otp", payload);
    return response;
  } catch (error: any) {
    console.error("Send OTP error:", error);
    throw error;
  }
};

const userOTPVerfication = async (
  payload: any
): Promise<AxiosResponse | void> => {
  try {
    const response = await post("verify-otp", payload);
    return response;
  } catch (error) {
    console.error("OTP Verification error: ", error);
    throw error;
  }
};

const userForgotPassword = async (
  payload: any
): Promise<AxiosResponse | void> => {
  try {
    const response = await post("forgot-password", payload);
    return response;
  } catch (error) {
    console.error("OTP Verification error: ", error);
    throw error;
  }
};

const userChangePassword = async (
  payload: any
): Promise<AxiosResponse | void> => {
  try {
    const response = await post("change-password", payload);
    return response;
  } catch (error) {
    console.error("Change Password error: ", error);
    throw error;
  }
};

const userUpdatePassword = async (
  payload: any
): Promise<AxiosResponse | void> => {
  try {
    const response = await post("reset-password", payload);
    return response;
  } catch (error) {
    console.error("Update Password error: ", error);
    throw error;
  }
};

const userUpdateProfile = async (
  payload: FormData
): Promise<AxiosResponse | void> => {
  try {
    const response = await post("update-profile", payload, {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
    });
    return response;
  } catch (error) {
    console.error("Update Profile error: ", error);
    throw error;
  }
};

const userSignOut = async (): Promise<AxiosResponse | void> => {
  try {
    const fcm_token = await storage.getItem("fcm_token");
    const response = await post("logout", {fcm_token});
    return response;
  } catch (error) {
    console.error("Signout error: ", error);
    throw error;
  }
};

const userInfo = async (): Promise<AxiosResponse | void> => {
  try {
    const response = await get("customer-info");
    return response;
  } catch (error) {
    handleApiError(error, "Faied to get user data");
    console.error("Customer Info error: ", error);
    throw error;
  }
};

const deleteUser = async (): Promise<AxiosResponse<any> | void> => {
  try {
    const response = await del("delete-account", true);
    return response;
  } catch (error: any) {
    console.error("unable to delete user account:", error);
    throw error;
  }
};

export {
  deleteUser,
  userInfo,
  userUpdateProfile,
  userSignOut,
  userUpdatePassword,
  userSignup,
  userSignIn,
  userSendOTP,
  userOTPVerfication,
  userForgotPassword,
  userChangePassword,
};
