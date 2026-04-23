import { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  FolderOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Link, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = useMemo<MenuProps['items']>(() => {
    const items: MenuProps['items'] = [
      { key: '/dashboard', icon: <DashboardOutlined />, label: <Link to="/dashboard">仪表盘</Link> },
      { key: '/customers', icon: <TeamOutlined />, label: <Link to="/customers">客户资料</Link> },
      { key: '/attachments', icon: <FolderOutlined />, label: <Link to="/attachments">附件管理</Link> },
    ];

    if (user?.role === 'admin') {
      items.push(
        { key: '/users', icon: <FileTextOutlined />, label: <Link to="/users">用户管理</Link> },
        { key: '/logs', icon: <HistoryOutlined />, label: <Link to="/logs">操作日志</Link> }
      );
    }

    return items;
  }, [user?.role]);

  const handleLogout = async () => {
    try {
      await logout();
      message.success('已退出登录');
      navigate('/');
    } catch {
      message.error('退出失败');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: <Link to="/profile">个人中心</Link> },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  const selectedKeys = menuItems
    ?.filter((item) => item && location.pathname.startsWith(item.key as string))
    .map((item) => item.key as string) || [];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ background: '#001529' }}
        width={240}
        collapsedWidth={80}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
            borderBottom: '1px solid #ffffff20',
          }}
        >
          {collapsed ? 'CDMS' : '客户管理系统'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={selectedKeys} items={menuItems} style={{ background: '#001529' }} />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div onClick={() => setCollapsed(!collapsed)} style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar style={{ background: '#1890ff' }}>{user?.name?.charAt(0) || 'U'}</Avatar>
              <span>{user?.name}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280, overflow: 'auto' }}>
          {children || <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
}