import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  Divider,
  message,
} from "antd";
import {
  ProjectOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
export default function TaskForm({
  initialValues,
  onSubmit,
  loading,
  usersList = [],
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate
          ? dayjs(initialValues.startDate)
          : dayjs(),
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const handleFinish = (values) => {
    const formattedValues = {
      ...values,
      startDate: values.startDate
        ? values.startDate.toISOString()
        : new Date().toISOString(),
      endDate: values.endDate ? values.endDate.toISOString() : null,
    };
    onSubmit(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        priority: "Medium",
        status: "Todo",
        startDate: dayjs(),
        shift: "",
        members: [],
      }}
      className="jira-task-form"
      style={{ padding: "12px 0" }}
    >
      <Row gutter={24}>
        {/* ================= CỘT TRÁI: NỘI DUNG CHÍNH (MAIN CONTENT) ================= */}
        <Col xs={24} lg={16}>
          <Form.Item
            name="projectName"
            label="Dự án"
            rules={[{ required: true, message: "Vui lòng nhập tên dự án!" }]}
          >
            <Input
              prefix={<ProjectOutlined />}
              placeholder="Nhập tên dự án hoặc mã dự án..."
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề công việc"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề công việc!" },
            ]}
          >
            <Input
              prefix={<FileTextOutlined />}
              placeholder="Ví dụ: Thiết kế giao diện Dashboard"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả chi tiết">
            <TextArea
              rows={6}
              placeholder="Nhập mô tả yêu cầu công việc, các bước thực hiện..."
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Col>

        {/* ================= CỘT PHẢI: THÔNG TIN PHỤ / PHÂN LOẠI (ATTRIBUTES) ================= */}
        <Col xs={24} lg={8}>
          <div
            style={{
              background: "#f9f9f9",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #f0f0f0",
            }}
          >
            <Form.Item name="status" label="Trạng thái (Status)">
              <Select placeholder="Chọn trạng thái">
                <Option value="Todo">
                  <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                    ● To do
                  </span>
                </Option>
                <Option value="In Progress">
                  <span style={{ color: "#faad14", fontWeight: "bold" }}>
                    ● In Progress
                  </span>
                </Option>
                <Option value="Done">
                  <span style={{ color: "#52c41a", fontWeight: "bold" }}>
                    ● Done
                  </span>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item name="priority" label="Độ ưu tiên (Priority)">
              <Select
                placeholder="Chọn độ ưu tiên"
                className="select-priority-smoke"
                popupClassName="dropdown-priority-smoke"
              >
                <Option value="Low">
                  <span className="priority-item low">
                    <span className="dot"></span> Low
                  </span>
                </Option>
                <Option value="Medium">
                  <span className="priority-item medium">
                    <span className="dot"></span> Medium
                  </span>
                </Option>
                <Option value="High">
                  <span className="priority-item high">
                    <span className="dot"></span> High
                  </span>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item name="shift" label="Ca làm việc (Shift)">
              <Input placeholder="Ví dụ: Ca sáng, Ca gãy..." />
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[{ required: true, message: "Chọn ngày bắt đầu!" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                prefix={<CalendarOutlined />}
              />
            </Form.Item>

            <Form.Item name="endDate" label="Hạn chót (Deadline)">
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                prefix={<CalendarOutlined />}
              />
            </Form.Item>

            {/* Mục chọn thành viên thực hiện gán danh sách người dùng */}
            <Form.Item name="members" label="Thành viên tham gia">
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Chọn người thực hiện..."
                optionFilterProp="children"
              >
                {usersList.map((user) => (
                  <Option key={user._id} value={user._id}>
                    <Space>
                      <UserOutlined />
                      {user.userName || user.email}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: "12px 0" }} />

      {/* Nút hành động chân Form */}
      <Row justify="end">
        <Space>
          <Button onClick={() => form.resetFields()}>Xóa nhập liệu</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? "Cập nhật Task" : "Tạo mới Task"}
          </Button>
        </Space>
      </Row>
    </Form>
  );
}
