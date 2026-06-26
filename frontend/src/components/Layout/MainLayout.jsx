import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { USER_KEY } from '../../constants/common';
import { setUserInfoAction, setAuthenRole } from '../../store/actions/user.action';
import { getSocket, connectSocket, disconnectSocket } from './../../configs/socket'; 

import "./index.scss";

export default function MainLayout() {   
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();    
    
  const  userInfor = useSelector((state) => state.userReducer.userInfor);
  
  // 🛡️ SỬA 1: Dùng Optional Chaining (?.) để tránh crash khi userInfor bị null lúc Logout
  const token = userInfor?.loginToken; 

  // 🔌 Quản lý vòng đời kết nối Socket
  useEffect(() => {
    console.log(token)
    if (!token) {
      disconnectSocket();
      return;
    }      

    const socketInstance = connectSocket(token);

    // 🛡️ SỬA 3: Chỉ đăng ký sự kiện khi socketInstance tồn tại thực tế (không bị null)
    if (socketInstance) {
      socketInstance.on("connect", () => {
        console.log(`🟢 Đã kết nối Real-time! Socket ID: ${socketInstance.id}`);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("❌ Lỗi kết nối Socket:", error.message);
      });
    }    
    
    // Hàm dọn dẹp chạy khi đổi user hoặc unmount layout
    return () => {
      disconnectSocket();
    };
  // Theo dõi token là đủ để quyết định vòng đời của socket
  }, [token]); 

  // 🚪 Hàm xử lý Đăng xuất
  const handleLogout = () => {
    // Ngắt kết nối socket ngay lập tức trước khi clear store
    disconnectSocket();

    // Xóa sạch bộ nhớ phiên đăng nhập ở LocalStorage và Redux
    localStorage.removeItem(USER_KEY);
    dispatch(setUserInfoAction(null));
    dispatch(setAuthenRole(null));  
    navigate('/signin');
  };
  

  // Helper check xem route nào đang active để gán class css
  const checkActive = (path) => location.pathname === path ? 'active-menu' : '';

  // Lệnh return duy nhất trả về toàn bộ giao diện của Layout
  return (
    <div className="main-layout-container">
      
      {/* 1. SIDEBAR */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand">My System</div>
        
        <nav className="sidebar-nav">
          <Link to="/tasks" className={`nav-link ${checkActive('/tasks')}`}>
            Manage Task
          </Link>
          <Link to="/employees" className={`nav-link ${checkActive('/employees')}`}>
            Manage Employee
          </Link>
          <Link to="/messages" className={`nav-link ${checkActive('/messages')}`}>
            Message
          </Link>
        </nav>
      </aside>

      {/* KHỐI BÊN PHẢI */}
      <div className="layout-content-wrapper">
        
        {/* 2. HEADER */}
        <header className="layout-header">
          <div className="header-welcome">
            Xin chào, <span>{userInfor?.userName || 'Chủ cửa hàng'}</span> 👋
          </div>
          
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </header>

        {/* 3. MAIN WORKSPACE */}
        <main className="layout-main-content">
          {/* Nơi hiển thị động nội dung các bảng dữ liệu con */}
          <Outlet />
        </main>
      </div>

    </div>
  );
}