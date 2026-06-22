import { request } from "../configs/axios";

const loginPhoneApi = (data) => {
  return request({
    url: "/api/signin/create-phone-code",
    method: "POST",
    data,
  });
};

const loginMailApi = (data) => {
  return request({
    url: "/api/signin/create-email-code",
    method: "POST",
    data,
  });
};


const verifyPhoneOtpApi = (data) => {
  return request({
    url: "/api/signin/owner/validate-phone-code",
    method: "POST",
    data,
  });
};

const verifyMailOtpApi = (data) =>{
  return request({
    url: "/api/signin/employee/validate-email-code",
    method: "POST",
    data,
  });
}

export { loginPhoneApi, verifyPhoneOtpApi, loginMailApi, verifyMailOtpApi };