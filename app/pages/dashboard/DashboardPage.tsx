import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { TeamOutlined, FileOutlined, UserOutlined, HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { customerService, attachmentService, userService, logService } from '../../services/api';

const { Title } = Typography;

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  totalAttachments: number;
  totalUsers: number;
  todayLogs: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalAttachments: 0,
    totalUsers: 0,
    todayLogs: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const customers = await customerService.getCustomers();
    const attachments = await attachmentService.getAttachments();
    const users = await userService.getUsers();
    const logs = await logService.getLogs();

    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = logs.filter((l) => l.createdAt.slice(0, 10) === today);

    setStats({
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.status === 'active').length,
      totalAttachments: attachments.length,
      totalUsers: users.length,
      todayLogs: todayLogs.length,
    });
  };

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        欢迎回来, {user?.name}
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('/customers')}
            style={{ borderColor: '#1890ff' }}
          >
            <Statistic
              title="客户总数"
              value={stats.totalCustomers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
            />
            <div style={{ color: '#8c8c8c', marginTop: 8 }}>
              正常: {stats.activeCustomers}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card hoverable onClick={() => handleCardClick('/attachments')}>
            <Statistic
              title="附件总数"
              value={stats.totalAttachments}
              prefix={<FileOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('/users')}
            style={{ display: user?.role === 'admin' ? 'block' : 'none' }}
          >
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => handleCardClick('/logs')}
            style={{ display: user?.role === 'admin' ? 'block' : 'none' }}
          >
            <Statistic
              title="今日操作"
              value={stats.todayLogs}
              prefix={<HistoryOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}