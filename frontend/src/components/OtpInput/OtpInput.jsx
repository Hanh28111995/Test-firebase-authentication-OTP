import React, { useRef } from "react";

const OTPInputCustom = ({ length = 6, value, onChange }) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    // Chỉ lọc lấy các ký tự là số và giới hạn độ dài đúng bằng `length`
    const rawVal = e.target.value.replace(/\D/g, "");
    const slicedVal = rawVal.slice(0, length);
    onChange(slicedVal);
  };

  return (
    <div 
      className="custom-otp-wrapper" 
      onClick={() => inputRef.current?.focus()}
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        cursor: "text",
        userSelect: "none"
      }}
    >
      {/* 1. Ô Input THẬT nằm ẩn phía sau: Nhận chuỗi LIỀN MẠCH giúp Windows VIE không bị lỗi lặp số */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="\d*"
        maxLength={length}
        value={value}
        onChange={handleInputChange}
        autoComplete="one-time-code"
        style={{
          position: "absolute",
          opacity: 0, // Ẩn hoàn toàn khỏi giao diện
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 2,
          cursor: "text"
        }}
      />

      {/* 2. Các ô GIẢ LẬP hiển thị giao diện Bento rời nhau */}
      <div style={{ display: "flex", gap: "12px", zIndex: 1 }}>
        {Array(length)
          .fill("")
          .map((_, index) => {
            // Xác định xem ô hiện tại có đang được "focus" ngầm hay không
            const isFocused = value.length === index;

            return (
              <div
                key={index}
                className={`otp-box ${isFocused ? "is-focused" : ""} ${value[index] ? "has-value" : ""}`}
                style={{
                  width: "46px",
                  height: "52px",
                  border: `1px solid ${isFocused ? "#2f7cf6" : "#d9d9d9"}`,
                  boxShadow: isFocused ? "0 0 0 2px rgba(47, 124, 246, 0.15)" : "none",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "600",
                  backgroundColor: "#fff",
                  color: "#000",
                  transition: "all 0.15s ease"
                }}
              >
                {value[index] || ""}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OTPInputCustom;