import React, { useState } from "react";
import { Table, Button, Input, Tag, Space, Avatar } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./index.scss";

export default function TaskTable() {
  const initialData = [
    {
      id: 1,
      title: "Design Login Page",
      projectName: "CRM System",
      priority: "High",
      status: "In Progress",
      members: ["John", "Anna"],
      endDate: "2026-06-25",
    },
    {
      id: 2,
      title: "Fix Payment Bug",
      projectName: "E-Commerce",
      priority: "High",
      status: "Todo",
      members: ["Mike"],
      endDate: "2026-06-30",
    },
    {
      id: 3,
      title: "Update Dashboard",
      projectName: "CRM System",
      priority: "Medium",
      status: "Done",
      members: ["Tom", "Lucy"],
      endDate: "2026-06-20",
    },
  ];

  const [searchText, setSearchText] = useState("");
  const [dataSource, setDataSource] = useState(initialData);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);

    const filteredData = initialData.filter(
      (item) =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.projectName.toLowerCase().includes(value.toLowerCase())
    );

    setDataSource(filteredData);
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
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Members",
      dataIndex: "members",
      key: "members",
      width: "18%",
      render: (members) => (
        <Avatar.Group max={{ count: 3 }}>
          {members.map((member) => (
            <Avatar key={member}>
              {member.charAt(0)}
            </Avatar>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "endDate",
      key: "endDate",
      width: "10%",
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() =>
              console.log("Edit:", record.id)
            }
          >
            Edit
          </Button>

          <Button
            danger
            onClick={() =>
              console.log("Delete:", record.id)
            }
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="manage-task-container">
      <h1 className="main-title">
        Manage Tasks
      </h1>

      <div className="task-card">
        <div className="toolbar">
          <div className="count-text">
            <strong>
              {dataSource.length} Tasks
            </strong>
          </div>

          <div className="right-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="create-btn"
            >
              Create Task
            </Button>

            <Input
              placeholder="Search Task"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={handleSearch}
              className="filter-input"
            />
          </div>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="task-table"
        />
      </div>
    </div>
  );
}