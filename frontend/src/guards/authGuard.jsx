import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function AuthGuards() {
  const userState = useSelector((state) => state.userReducer);
  const navigate = useNavigate();
  useEffect(() => {
    if (!userState.userInfor) {
      navigate("/signin");
    }
  }, [userState.userInfor, navigate]);

  return <Outlet />;
}
