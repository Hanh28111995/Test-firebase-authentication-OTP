export const defaultPermissions = [
  {
    action: "CRUD_ALL_USERS",
    description: "Quản lý toàn bộ người dùng trong hệ thống",
    allowedRoles: ["owner"] 
  },
  {
    action: "CRUD_ONE_USER",
    description: "Xem và cập nhật thông tin cá nhân của chính mình",
    allowedRoles: ["owner", "employee"] 
  },
  {
    action: "CRUD_ALL_TASK",
    description: "Quản lý toàn bộ Task, ",
    allowedRoles: ["owner"]
  },
  {
    action: "CRUD_ONE_TASK",
    description: "Cập nhật Task có tên trong list member",
    allowedRoles: ["owner", "employee"] 
  },    
  {
    action: "MESSAGE_ACTION",
    description: "Sử dụng tính năng Chat Realtime qua Socket.io",
    allowedRoles: ["owner", "employee"] 
  }
];

export const defaultOwner = {
  userName: "Owner_Hanh",
  phoneNumber: "0789793059", 
  role: "owner",
  email: "owner@skiplitest.com",
  department: "Management", 
  accessCode: ""
};