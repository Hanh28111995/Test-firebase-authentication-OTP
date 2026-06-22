import React, { useState, useEffect } from "react";
import { Table, Button,  Tag, Space, Avatar, message, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  getAllTasksApi,
  deleteTaskApi,  
} from "../../services/role.task.service";
import { useSelector } from "react-redux";
import "./index.scss";
import TaskForm from "../../components/Form/TaskForm";

export default function TaskTable() {  
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [dataSource, setDataSource] = useState([]);  
  const [createForm, setCreateForm] = useState(false);  
  const [editingTask, setEditingTask] = useState(null);   

  const userRole = useSelector(
    (state) => state.userReducer.userInfor?.user.role,
  );

  const fetchTasks = async () => {    
    try {
      const response = await getAllTasksApi(userRole);          
      const tasksData = response?.content ;
      const safeData = Array.isArray(tasksData) ? tasksData : [];
      setDataSource(safeData);
    } catch (error) {
      console.error("Lỗi lấy danh sách task:", error);
      message.error("Không thể tải danh sách công việc.");      
      setDataSource([]);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchTasks();
    }
  }, [userRole, refreshToggle]);

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await deleteTaskApi(userRole, taskId);
      if (response?.success || response) {
        message.success("Xóa công việc thành công!");
        fetchTasks();
      }
    } catch (error) {
      console.error("Lỗi xóa task:", error);
      message.error("Xóa công việc thất bại.");
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setCreateForm(true);
  };

  const openEditModal = (record) => {
    setEditingTask(record);
    setCreateForm(true);
  };

  const handleFormSubmit = async (formData) => {    
    try {
      if (editingTask) {
        // LUỒNG UPDATE TASK
        // await updateTaskApi(userRole, editingTask._id, formData);
        console.log("Gửi API Cập nhật Task ID:", editingTask._id, formData);
        message.success("Cập nhật công việc thành công!");
      } else {
        // LUỒNG CREATE TASK
        // await createTaskApi(userRole, formData);
        console.log("Gửi API Tạo mới Task:", formData);
        message.success("Tạo mới công việc thành công!");
      }
      setCreateForm(false); // Đóng modal
      fetchTasks(); // Reload lại danh sách bảng
    } catch (error) {
      console.error("Lỗi xử lý Form Task:", error);
      message.error("Thao tác thất bại.");
    } 
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "red";
      case "Medium":
        return "gold";
      default:
        return "green";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "success";
      case "In Progress":
        return "processing";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Task",
      dataIndex: "title",
      key: "title",
      width: "25%",
    },
    {
      title: "Project",
      dataIndex: "projectName",
      key: "projectName",
      width: "15%",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: "12%",
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      width: "18%",
      render: (members) => (
        <Avatar.Group max={{ count: 3 }}>
          {Array.isArray(members) &&
            members.map((member) => {
              const name =
                member?.userName || (typeof member === "string" ? member : "U");
              const key = member?._id || name;
              return (
                <Avatar key={key} title={member?.email || ""}>
                  {name.charAt(0).toUpperCase()}
                </Avatar>
              );
            })}
        </Avatar.Group>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "endDate",
      key: "endDate",
      width: "10%",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "-",
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space>
          {/* 🟢 SỬA TẠI ĐÂY: Bấm vào mở modal edit và truyền data hàng hiện tại */}
          <Button type="primary" onClick={() => openEditModal(record)}>
            Edit
          </Button>

          <Button danger onClick={() => handleDeleteTask(record._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="manage-task-container">
        <h1 className="main-title">Manage Tasks</h1>

        <div className="task-card">
          <div className="toolbar">
            <div className="count-text">
              <strong>{dataSource?.length || 0} Tasks</strong>
            </div>

            <div className="right-actions">
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                className="create-btn"
                onClick={() => setCreateForm(true)}
              >
                Create New Task
              </Button>
            </div>
          </div>

          <Table
            rowKey="_id"
            columns={columns}
            dataSource={dataSource}
            pagination={{ pageSize: 10 }}
            className="task-table"
          />
        </div>
      </div>

      <Modal
        title={
          editingTask
            ? "Chỉnh sửa công việc (Edit Issue)"
            : "Tạo công việc mới (Create Issue)"
        }
        open={createForm}
        onCancel={() => setCreateForm(false)}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        <TaskForm
          editingTask={editingTask}
          onSuccess={()=>{
            setCreateForm(false)
            fetchTasks();
            userList
          }}
        />
      </Modal>
    </>
  );
}
