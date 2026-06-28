import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import {  getToken } from "firebase/app-check";
import { getApp } from "firebase/app";
import { auth, appCheck } from "../../configs/firebase";
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

const ENTERPRISE_SITE_KEY = "6LfRZDltAAAAAHvs1o_gmPWggcVoqK3d_3ygvBQX";

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

  const recaptchaVerifier = useRef(null);
  const confirmationResult = useRef(null);
  const recaptchaContainerRef = useRef(null);
  

  useEffect(() => {
    if (!recaptchaVerifier.current && recaptchaContainerRef.current) {
      try {
        recaptchaVerifier.current = new RecaptchaVerifier(
          auth,
          recaptchaContainerRef.current,
          {
            size: "invisible",
            siteKey: ENTERPRISE_SITE_KEY,
            callback: () => {
              console.log("reCAPTCHA Enterprise solved thành công!");
            },
          },
        );
      } catch (err) {
        console.error("Lỗi khởi tạo RecaptchaVerifier ban đầu:", err);
      }
    }

    return () => {
      if (recaptchaVerifier.current) {
        try {
          recaptchaVerifier.current.clear();
        } catch (e) {
          console.log("Lỗi dọn dẹp useEffect:", e);
        }
        recaptchaVerifier.current = null;
      }
    };
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
    dispatch(setAuthenError("Định dạng số điện thoại hoặc email không hợp lệ."));
    return;
  }

  dispatch(setAuthenLoading(true));
  setAuthType(checkResult.type);

  try {
    // Xử lý Email
    if (checkResult.type === "email") {
      const response = await loginMailApi(checkResult.payload);
      const formattedMail = response?.content?.email;
      if (!formattedMail) throw new Error("Không nhận được email hợp lệ.");
      
      dispatch(setOtpVerifyingInfo({ displayValue: formattedMail }));
      setStep("otp");
      return;
    }

    // Xử lý Phone
    if (checkResult.type === "phone") {
      // 1. Lấy token App Check (Nếu App Check đang bật chế độ Enforce)
      const appCheckTokenResult = await getToken(appCheck, false);
      
      // 2. Gọi API kiểm tra số điện thoại của Backend trước
      const response = await loginPhoneApi({
        ...checkResult.payload,
        appCheckToken: appCheckTokenResult.token,
      });
      const formattedPhone = response?.content?.phoneNumber;
      if (!formattedPhone) throw new Error("Không nhận được số điện thoại hợp lệ.");

      // 3. Khởi tạo Recaptcha nếu chưa có
      if (!recaptchaVerifier.current) {
        recaptchaVerifier.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: "invisible",
          siteKey: ENTERPRISE_SITE_KEY,
        });
      }

      // 4. Gọi Firebase xác thực số điện thoại
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifier.current
      );

      confirmationResult.current = confirmation;
      dispatch(setOtpVerifyingInfo({ displayValue: formattedPhone }));
      setStep("otp");
      setOtp("");
    }
  } catch (error) {
    console.error("handleSendCode error:", error);
    
    // Chỉ reset captcha nếu có lỗi nghiêm trọng
    if (recaptchaVerifier.current) {
      recaptchaVerifier.current.clear();
      recaptchaVerifier.current = null;
    }

    const message = error?.response?.data?.message || error?.message || "Lỗi xác thực. Vui lòng thử lại sau.";
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
        const googleResult = await confirmationResult.current.confirm(otp);
        const idToken = await googleResult.user.getIdToken();
        loginResponse = await verifyPhoneOtpApi({ idToken });
      } else if (authType === "email") {
        loginResponse = await verifyMailOtpApi({
          email: otpVerifyingInfo?.displayValue,
          otp: otp,
        });
      } else {
        throw new Error("Unsupported authentication type");
      }
      const responseData = loginResponse;
      const authContent = responseData?.content;
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

        <div
          ref={recaptchaContainerRef}
          id="recaptcha-container"
          style={{ display: "none" }}
        ></div>

        {authenError && <p className="error-text">{authenError}</p>}
      </div>
    </div>
  );
}
