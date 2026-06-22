import React, { useState, useEffect } from "react";
import { Form, Input, Button, Row, Col, message, Select } from "antd";
import "./index.scss";
import { createUserApi, updateUserApi } from "../../services/owner.user.service";

export default function UserForm({ onSuccess, editingEmployee }) { 
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const isEditMode = !!editingEmployee;
  
  useEffect(() => {     
    if (editingEmployee) {     
      form.setFieldsValue(editingEmployee);
    } else {
      form.resetFields();
    }
  }, [editingEmployee]);

  const handleFinish = async (values) => {
  setLoading(true);
  try {      
    let response;
    if (isEditMode) {        
      response = await updateUserApi(editingEmployee._id, values);
    } else {        
      response = await createUserApi(values);
    }

    if (response?.success) {
      message.success(isEditMode ? "Cập nhật nhân viên thành công!" : "Tạo nhân viên mới thành công!");                            
      form.resetFields();      
      if (onSuccess) {
        onSuccess(); 
      }
    } else {
      message.error(response?.message || (isEditMode ? "Cập nhật thất bại." : "Tạo nhân viên thất bại."));
    }
  } catch (error) {
    console.error("Lỗi xử lý nhân viên:", error);
    message.error(error?.response?.data?.message || "Đã xảy ra lỗi hệ thống.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="user-form-container">      
      <h2 className="form-title">{isEditMode ? "Update Employee" : "Create Employee"}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Row gutter={[32, 16]}>
          <Col span={12}>
            <Form.Item
              label="Employee Name"
              name="userName"
              rules={[{ required: true, message: "Please enter employee name" }]}
            >
              <Input placeholder="Enter employee name" className="custom-input" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Phone Number"
              name="phoneNumber"
              rules={[
                { required: true, message: "Please enter phone number" },
                { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ (9-11 số)" }
              ]}
            >
              <Input placeholder="Enter phone number" className="custom-input" />
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={[32, 16]}>
          <Col span={12}>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Invalid email format" }
              ]}
            >
              <Input placeholder="Enter email address" className="custom-input" disabled={isEditMode} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select placeholder="Select role" className="custom-select">                
                <Select.Option value="owner">Owner</Select.Option>
                <Select.Option value="employee">Employee</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[32, 16]}>
          <Col span={24}>
            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please enter address" }]}
            >
              <Input placeholder="Enter address" className="custom-input" />
            </Form.Item>
          </Col>
        </Row>

        <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            className="btn-submit"
            loading={loading}
          >           
            {isEditMode ? "Save Changes" : "Create"}
          </Button>
        </div>
      </Form>
    </div>
  );
}