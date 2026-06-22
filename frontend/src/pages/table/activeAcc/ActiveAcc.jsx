import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import axios from "axios"; // Hoặc import instance axios chung của dự án bạn (ví dụ: "../../services/axiosClient")
import "./index.scss";
import { confirmUserApi } from "../../../services/owner.user.service";

export default function ActiveAcc() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("Đang xác thực và kích hoạt tài khoản của bạn...");

  useEffect(() => {
    const activateUserAccount = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Mã kích hoạt không tồn tại hoặc đường dẫn không hợp lệ!");
        return;
      }
      try {
        const result = await confirmUserApi(token);

        if (result.success) {
          setStatus("success");
          setMessage("Tài khoản của bạn đã được kích hoạt thành công! Giờ đây bạn có thể sử dụng các dịch vụ.");
        } else {
          setStatus("error");
          setMessage("Kích hoạt thất bại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Activate account error:", error);
        setStatus("error");
        setMessage(
          error?.result.message || 
          "Mã kích hoạt đã hết hạn hoặc không chính xác. Vui lòng liên hệ Quản trị viên."
        );
      }
    };

    activateUserAccount();
  }, [token]);

  return (
    <div className="activate-account-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f5" }}>
      <div className="activate-card" style={{ background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxWidth: "500px", width: "100%", textAlign: "center" }}>
        
        {status === "loading" && (
          <div className="loading-state" style={{ padding: "30px 0" }}>
            <Spin size="large" />
            <p style={{ marginTop: "20px", color: "#666", fontSize: "16px" }}>{message}</p>
          </div>
        )}

        {status === "success" && (
          <Result
            status="success"
            title="Kích Hoạt Thành Công!"
            subTitle={message}
            extra={[
              <Button type="primary" key="login" onClick={() => navigate("/signin")} style={{ background: "#2f7cf6", height: "40px", borderRadius: "6px" }}>
                Đi tới Đăng nhập
              </Button>
            ]}
          />
        )}

        {status === "error" && (
          <Result
            status="error"
            title="Kích Hoạt Thất Bại"
            subTitle={message}
            extra={[
              <Button type="default" key="retry" onClick={() => navigate("/")} style={{ height: "40px", borderRadius: "6px" }}>
                Quay về Trang chủ
              </Button>
            ]}
          />
        )}

      </div>
    </div>
  );
}