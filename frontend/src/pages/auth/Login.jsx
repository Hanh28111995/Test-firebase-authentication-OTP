import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../configs/firebase";
import {
  loginPhoneApi,
  loginMailApi,
  verifyPhoneOtpApi,
  verifyMailOtpApi,
} from "../../services/auth.service";
import {
  setAuthenError,
  setAuthenLoading,
  setAuthenRole,
  setOtpVerifyingInfo,
  setUserInfoAction,
} from "../../store/actions/user.action";
import "./index.scss";
import OTPInputCustom from "../../components/OtpInput/OtpInput";
import { useNavigate } from "react-router-dom";
import { USER_KEY } from "../../constants/common";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authenLoading, authenError, otpVerifyingInfo } = useSelector(
    (state) => state.userReducer,
  );

  const [inputVal, setInput] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("input");
  const [authType, setAuthType] = useState("");

  useEffect(() => {
    if (!window.recaptchaVerifier && document.getElementById("recaptcha-container")) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            console.log("reCAPTCHA solved ngầm thành công!");
          },
        },
      );
    }

    return () => {};
  }, []);

  const validateInput = (value) => {
    const trimmed = value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+?\d{1,4})?[\d\s\-]{9,15}$/;

    if (emailRegex.test(trimmed)) {
      return { type: "email", payload: { email: trimmed } };
    } else if (phoneRegex.test(trimmed)) {
      return { type: "phone", payload: { phoneNumber: trimmed } };
    }
    return { type: "invalid", payload: null };
  };

  const handleSendCode = async (event) => {
    event.preventDefault();
    if (!inputVal.trim()) {
      dispatch(setAuthenError("Vui lòng nhập số điện thoại hoặc email"));
      return;
    }

    dispatch(setAuthenError(null));
    const checkResult = validateInput(inputVal);

    if (checkResult.type === "invalid") {
      dispatch(
        setAuthenError("Định dạng số điện thoại hoặc email không hợp lệ."),
      );
      return;
    }

    dispatch(setAuthenLoading(true));
    setAuthType(checkResult.type);

    try {
      if (checkResult.type === "email") {
        const response = await loginMailApi(checkResult.payload);
        const formattedMail = response?.content?.email;

        if (!formattedMail) {
          dispatch(setAuthenError("Không nhận được email hợp lệ từ server."));
          return;
        }
        dispatch(setOtpVerifyingInfo({ displayValue: formattedMail }));
        setStep("otp");
        setOtp(""); 
        return;
      }

      if (checkResult.type === "phone") {
        const response = await loginPhoneApi(checkResult.payload);
        const formattedPhone = response?.content?.phoneNumber;

        if (!formattedPhone) {
          dispatch(
            setAuthenError("Không nhận được số điện thoại hợp lệ từ server."),
          );
          return;
        }

        const verification = window.recaptchaVerifier;
        window.confirmationResult = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          verification,
        );

        dispatch(setOtpVerifyingInfo({ displayValue: formattedPhone }));
        setStep("otp");
        setOtp(""); 
      }
    } catch (error) {
      console.error("handleSendCode error:", error);
      const message =
        error?.response?.data?.message ||
        "Không thể gửi mã xác nhận. Vui lòng thử lại.";
      dispatch(setAuthenError(message));
    } finally {
      dispatch(setAuthenLoading(false));
    }
  };

  const handleOtpChange = (text) => {
    setOtp(text);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    dispatch(setAuthenError(null));
    dispatch(setAuthenLoading(true));
    try {
      let loginResponse;
      if (authType === "phone") {
        const googleResult = await window.confirmationResult.confirm(otp);
        const idToken = await googleResult.user.getIdToken();
        loginResponse = await verifyPhoneOtpApi({ idToken });
      } else if (authType === "email") {
        loginResponse = await verifyMailOtpApi({
          email: otpVerifyingInfo?.displayValue,
          otp: otp,
        });
      }
      const responseData = loginResponse; 
      const authContent = responseData?.content;
      console.log(responseData)

      if (responseData?.success && authContent) {
        localStorage.setItem(USER_KEY, JSON.stringify(authContent));        
        dispatch(setUserInfoAction(authContent.user));
        dispatch(setAuthenRole(authContent.user?.role || null));
        navigate("/");
      }
    } catch (error) {
      console.error("handleVerifyOtp error:", error);
      const message =
        error?.response?.data?.message ||
        "Mã OTP không chính xác hoặc đã hết hạn.";
      dispatch(setAuthenError(message));
    } finally {
      dispatch(setAuthenLoading(false));
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h2 className="login-title">Sign In</h2>

        {step === "input" ? (
          <>
            <p className="login-desc">Please enter phone/email to sign in</p>
            <form onSubmit={handleSendCode}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="phone/email"
                  value={inputVal}
                  onChange={(e) => setInput(e.target.value)}
                  className="custom-input"
                />
              </div>
              <button
                id="btn-send-code"
                type="submit"
                className="btn-submit-primary"
                disabled={authenLoading}
              >
                {authenLoading ? "Đang gửi..." : "Next"}
              </button>
            </form>
            <p className="sub-text-footer">
              passwordless authentication methods.
            </p>            
          </>
        ) : (
          <>
            <p className="login-desc" style={{ marginBottom: 20 }}>
              Mã OTP đã được gửi tới:{" "}
              <strong>{otpVerifyingInfo?.displayValue}</strong>
            </p>
            <div
              className="form-group"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <OTPInputCustom
                length={6}
                value={otp}
                onChange={handleOtpChange}
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              className="btn-submit-primary"
              disabled={otp.length !== 6 || authenLoading}
            >
              {authenLoading ? "Đang xác nhận..." : "Xác nhận OTP"}
            </button>
            <button
              type="button"
              className="btn-back"
              onClick={() => setStep("input")}
              style={{
                marginTop: 14,
                background: "none",
                border: "none",
                color: "#666",
                cursor: "pointer",
              }}
            >
              Quay lại nhập lại thông tin
            </button>
          </>
        )}

        {authenError && <p className="error-text">{authenError}</p>}
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}