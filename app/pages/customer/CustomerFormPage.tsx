import { useState } from 'react';
import { Form, Input, Button, Card, Select, Space, message, Typography, Row, Col } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/api';
import type { CustomerFormData } from '../../types';
import styles from './CustomerFormPage.module.less';

const { Title } = Typography;
const { Option } = Select;

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm<CustomerFormData>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const values = form.getFieldsValue();

      await customerService.createCustomer(values, user!.userId, user!.name);
      message.success('创建成功');
      navigate('/customers');
    } catch {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
            返回
          </Button>
          <Title level={4} className={styles.title}>
            新增客户
          </Title>
        </Space>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={loading} className={styles.saveBtn}>
          保存
        </Button>
      </div>

      <Card>
        <Form form={form} layout="vertical">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}>
                <Input placeholder="请输入客户名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPerson" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="contactPhone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactEmail" label="联系邮箱" rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}>
                <Input placeholder="请输入联系邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="address" label="地址">
                <Input placeholder="请输入地址" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="responsible" label="负责人" rules={[{ required: true, message: '请输入负责人' }]}>
                <Input placeholder="请输入负责人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="status" label="状态" initialValue="active">
                <Select>
                  <Option value="active">正常</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="archived">已归档</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="remark" label="备注">
                <Input placeholder="请输入备注" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}