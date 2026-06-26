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
import { createTaskApi, updateTaskApi } from "../../services/role.task.service";
const { Option } = Select;
const { TextArea } = Input;

export default function TaskForm({ editingTask, onSuccess, userList, role }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!editingTask;
  console.log("👥 Component con nhận được userList:", userList);

  useEffect(() => {
    if (editingTask && Array.isArray(userList)) {      
      const initialMemberIds = Array.isArray(editingTask.members)
        ? editingTask.members.map(m => typeof m === "object" ? m._id : m)
        : [];

      form.setFieldsValue({
        ...editingTask,
        members: initialMemberIds, // Gán mảng chuỗi ID [ "id1", "id2" ] -> Select sẽ tự hiển thị đúng tên người dùng
        startDate: editingTask.startDate ? dayjs(editingTask.startDate) : dayjs(),
        endDate: editingTask.endDate ? dayjs(editingTask.endDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [editingTask, userList, form]); 

  const handleFinish = async (values) => {
    setLoading(true);
    try {      
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : null,        
        members: Array.isArray(values.members) ? values.members : []
      };

      let response;
      if (isEditMode) {
        response = await updateTaskApi(role, editingTask._id, payload);
      } else {
        response = await createTaskApi(role, payload);
      }

      if (response?.success) {
        message.success(
          isEditMode ? "Cập nhật task thành công!" : "Tạo task mới thành công!",
        );
        form.resetFields();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(
          response?.message ||
            (isEditMode ? "Cập nhật task thất bại." : "Tạo task thất bại."),
        );
      }
    } catch (error) {
      console.error("Lỗi xử lý task:", error);
      message.error(
        error?.response?.data?.message || "Đã xảy ra lỗi hệ thống.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      requiredMark={false}
      className="jira-task-form"
      style={{ padding: "12px 0" }}
    >
      <Row gutter={24}>
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

        {/* ================= CỘT PHẢI================= */}
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
              <Select placeholder="Chọn ca làm">
                <Option value="Day Shift">
                  <span>Ca sáng - 8h</span>
                </Option>
                <Option value="Night Shift">
                  <span>Ca tối - 8h</span>
                </Option>
                <Option value="Half Shift">
                  <span>Ca gãy - 4h</span>
                </Option>
              </Select>
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
                {userList.map((user) => (
                  <Option key={user?._id} value={user._id}>
                    <Space>
                      <UserOutlined />
                      {user.userName}
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
            {editingTask ? "Cập nhật Task" : "Tạo mới Task"}
          </Button>
        </Space>
      </Row>
    </Form>
  );
}
