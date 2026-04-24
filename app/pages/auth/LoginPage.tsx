import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';
import styles from './LoginPage.module.less';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { userId: string; password: string; remember?: boolean }) => {
    setLoading(true);
    try {
      const result = await login(values.userId, values.password);
      if (result.success) {
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error(result.message);
      }
    } catch {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={3} className={styles.title}>
            客户资料管理系统
          </Title>
          <Text type="secondary">Customer Data Management System</Text>
        </div>

        <Form
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="userId"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户ID"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked">
            <span className={styles.rememberText}>记住我</span>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className={styles.submitBtn}
            >
              登录
            </Button>
          </Form.Item>

          <div className={styles.footer}>
            <Text type="secondary" className={styles.hint}>
              默认账户: admin / password
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}