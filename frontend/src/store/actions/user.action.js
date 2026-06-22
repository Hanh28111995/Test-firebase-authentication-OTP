import { 
  SET_USER_INFO, 
  SET_AUTH_ROLE, 
  SET_VERIFYING_INFO, 
  SET_AUTH_LOADING, 
  SET_AUTH_ERROR,
  SET_EMPLOYEE_STORE_LIST, 
  SET_EMPLOYEE_ACTION_LOADING, 
  SET_CHAT_CURRENT_SELECTED_EMPLOYEE
} from "../types/user.type";

// --- ACTIONS CHO LUỒNG AUTHENTICATION ---

export const setUserInfoAction = (data) => ({
  type: SET_USER_INFO,
  payload: data,
});

export const setAuthenRole = (role) => ({
  type: SET_AUTH_ROLE,
  payload: role,
});

export const setOtpVerifyingInfo = (data) => ({
  type: SET_VERIFYING_INFO,
  payload: data,
});

export const setAuthenLoading = (isLoading) => ({
  type: SET_AUTH_LOADING,
  payload: isLoading,
});

export const setAuthenError = (errorMessage) => ({
  type: SET_AUTH_ERROR,
  payload: errorMessage,
});

// --- ACTIONS CHO QUẢN LÝ / CHAT NHÂN VIÊN ---

export const setEmployeeStoreList = (employeesList) => ({
  type: SET_EMPLOYEE_STORE_LIST,
  payload: employeesList,
});

export const setEmployeeActionLoading = (isLoading) => ({
  type: SET_EMPLOYEE_ACTION_LOADING,
  payload: isLoading,
});

export const setChatCurrentSelectedEmployee = (employeeData) => ({
  type: SET_CHAT_CURRENT_SELECTED_EMPLOYEE,
  payload: employeeData,
});