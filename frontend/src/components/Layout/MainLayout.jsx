import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { USER_KEY } from '../../constants/common';
import { setUserInfoAction, setAuthenRole } from '../../store/actions/user.action';
import "./index.scss"


export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Lấy thông tin user đăng nhập từ Redux
  const { userInfor } = useSelector((state) => state.userReducer);

  const handleLogout = () => {
    // Xóa sạch bộ nhớ phiên đăng nhập ở LocalStorage và Redux
    localStorage.removeItem(USER_KEY);
    dispatch(setUserInfoAction(null));
    dispatch(setAuthenRole(null));
    
    // Đẩy user về trang đăng nhập
    navigate('/signin');
  };

  // Helper check xem route nào đang active để gán class css
  const checkActive = (path) => location.pathname === path ? 'active-menu' : '';

  return (
    <div className="main-layout-container">
      
      {/* 1. SIDEBAR */}
      <aside className="layout-sidebar">
        <div className="sidebar-brand">My System</div>
        
        <nav className="sidebar-nav">
          <Link to="/tasks" className={`nav-link ${checkActive('/tasks')}`}>
            Quản lý Tasks
          </Link>
          <Link to="/employees" className={`nav-link ${checkActive('/employees')}`}>
            Quản lý Nhân viên
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
};
