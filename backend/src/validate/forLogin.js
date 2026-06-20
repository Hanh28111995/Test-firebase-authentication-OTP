export const validatePhone = (req, res, next) => {
  console.log("🧪 [Validator] validatePhone body:", req.body);
  const { phoneNumber } = req.body;
  const rawPhone =
    typeof phoneNumber === "string"
      ? phoneNumber.trim()
      : phoneNumber != null
        ? String(phoneNumber).trim()
        : "";
  const normalizedPhone = rawPhone.replace(/[\s-]/g, "");
  const phoneRegex = /^(?:\+84|84|0)\d{9,10}$/;

  if (!normalizedPhone) {
    console.log("⚠️ [Validator] phoneNumber invalid or missing:", phoneNumber);
    return sendError(res, "Số điện thoại là bắt buộc");
  }

  if (!phoneRegex.test(normalizedPhone)) {
    console.log(
      "⚠️ [Validator] phoneNumber format invalid:",
      phoneNumber,
      "-> normalized:",
      normalizedPhone,
    );
    return sendError(res, "Định dạng số điện thoại không hợp lệ!");
  }

  req.body.phoneNumber = normalizedPhone;
  console.log("✅ [Validator] phoneNumber accepted:", normalizedPhone);
  next();
};

export const validateMail = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (typeof email !== "string" || !email.trim()) {
    return sendError(res, "Email là bắt buộc");
  }

  if (!emailRegex.test(email.trim().toLowerCase())) {
    return sendError(
      res,
      "Định dạng Email không hợp lệ! Ví dụ đúng: abc@gmail.com",
    );
  }
  next();
};

