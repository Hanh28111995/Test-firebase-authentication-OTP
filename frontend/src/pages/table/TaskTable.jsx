import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Space, Avatar, message, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import {
  getAllTasksApi,
  deleteTaskApi,
} from "../../services/role.task.service";
import { useSelector } from "react-redux";
import "./index.scss";
import TaskForm from "../../components/Form/TaskForm";
import { getUserListByEmployeeApi } from "../../services/employee.user.service";
import { getAllUserApi } from "../../services/owner.user.service";

export default function TaskTable() {
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [createForm, setCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [userList, setUserList] = useState(null);

  const userRole = useSelector(
    (state) =>
      state.userReducer.userInfor?.role ||
      state.userReducer.userInfor?.user.role,
  );

  const userID = useSelector(
    (state) =>
      state.userReducer.userInfor?._id || state.userReducer.userInfor?.user._id,
  );

  const fetchTasks = async () => {
    try {
      let getUsers = userList;
      if (userRole === "owner") {
        getUsers = await getAllUserApi();
      } else {
        getUsers = await getUserListByEmployeeApi();
      }
      const IDvsNameUsers = getUsers?.content.map((user) => ({
        _id: user._id,
        userName: user.userName,
      }));
      setUserList(IDvsNameUsers);
      const getTasks = await getAllTasksApi(userRole);
      const tasksData = getTasks?.content;
      const safeData = Array.isArray(tasksData) ? tasksData : [];
      setDataSource(safeData);
    } catch (error) {
      message.error("Không thể tải danh sách user/task.");
      console.error(error);
      setDataSource([]);
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchTasks();
    }
  }, [refreshToggle]);

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
      render: (_, record) => {        
        const isCreator = userID === record.createdBy;
        return (
          <Space>
            <Button type="primary" onClick={() => openEditModal(record)}>
              Edit
            </Button>
            <Button
              danger
              onClick={() => handleDeleteTask(record._id)}
              disabled={!isCreator} 
            >
              Delete
            </Button>
          </Space>
        );
      },
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
          role={userRole}
          editingTask={editingTask}
          userList={userList}
          onSuccess={() => {
            setCreateForm(false);
            fetchTasks();
          }}
        />
      </Modal>
    </>
  );
}
