import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Space, Modal, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import UserForm from "../../components/Form/UserForm.jsx";
import {
  createUserApi,
  deleteUserApi,
  getAllUserApi,
} from "../../services/owner.user.service.js";
import "./index.scss";

export default function EmployeeTable() {
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [createForm, setCreateForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Hàm gọi API lấy danh sách
  const fetchEmployeeList = async () => {
    try {
      const res = await getAllUserApi();
      setDataSource(res?.content || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEmployeeList();
  }, [refreshToggle]); 

  // Hàm xóa nhân viên
  const handleDeleteEmployee = async (id) => {
    try {
      await deleteUserApi(id);
      message.success("Tạo nhân viên mới thành công!");
      setTimeout(() => {
        setRefreshToggle((prev) => !prev);
      }, 500);
      setRefreshToggle((prev) => !prev);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "userName",
      key: "userName",
      width: "30%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "30%",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "20%",
      render: (status) => (
        <Tag
          color={status ? "#e6fffb" : "#fff1f0"}
          style={{ color: status ? "#13c2c2" : "#f5222d" }}
        >
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: "20%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              setEditingEmployee(record);
              console.log(record);
              setCreateForm(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => handleDeleteEmployee(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="manage-employee-container">
        <h1 className="main-title">Manage Employee</h1>

        <div className="employee-card">
          <div className="toolbar">
            <div className="count-text">
              <strong>{dataSource.length} Employee</strong>
            </div>

            <div className="right-actions">
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                className="create-btn"
                onClick={() => setCreateForm(true)}
              >
                Create Employee
              </Button>
            </div>
          </div>

          <Table
            rowKey={(record) => record._id}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered={false}
            className="employee-table"
          />
        </div>
      </div>

      {createForm && (
        <Modal
          open={createForm}
          onCancel={() => {
            setCreateForm(false);
            setEditingEmployee(null);
          }}
          footer={null}
          destroyOnHidden
        >
          <UserForm
            editingEmployee={editingEmployee}
            onSuccess={() => {
              setCreateForm(false);
              fetchEmployeeList();
            }}
          />
        </Modal>
      )}
    </>
  );
}
