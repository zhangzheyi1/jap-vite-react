import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Input, Space, Tag, message, Popconfirm, Card, Typography, Modal, Form, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';
import type { User, UserFormData } from '../../types';
import { formatDate, formatStatus, getStatusColor, formatRole, getRoleColor } from '../../utils';

const { Title } = Typography;

export default function UserListPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm<UserFormData>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    return users.filter((u) => u.name.includes(searchText) || u.userId.includes(searchText));
  }, [users, searchText]);

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await userService.deleteUser(id, currentUser!.userId, currentUser!.name);
      if (success) {
        message.success('删除成功');
        loadUsers();
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      await userService.updateUser(user.id, { status: newStatus }, undefined, currentUser!.userId, currentUser!.name);
      message.success(newStatus === 'active' ? '启用成功' : '停用成功');
      loadUsers();
    } catch {
      message.error('操作失败');
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (editingUser) {
        await userService.updateUser(editingUser.id, { name: values.name, role: values.role }, values.password, currentUser!.userId, currentUser!.name);
        message.success('更新成功');
      } else {
        await userService.createUser({ userId: values.userId, name: values.name, role: values.role, status: 'active', failedLoginAttempts: 0, lockedUntil: null }, values.password || 'password', currentUser!.userId, currentUser!.name);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadUsers();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = useMemo(
    () => [
      { title: '用户ID', dataIndex: 'userId', key: 'userId', width: 120 },
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '角色', dataIndex: 'role', key: 'role', width: 100, render: (role: string) => <Tag color={getRoleColor(role)}>{formatRole(role)}</Tag> },
      { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (status: string) => <Tag color={getStatusColor(status)}>{formatStatus(status)}</Tag> },
      { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, render: (date: string) => formatDate(date, 'YYYY-MM-DD HH:mm') },
      {
        title: '操作',
        key: 'action',
        width: 180,
        render: (_: unknown, record: User) => (
          <Space size="small">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />} onClick={() => handleToggleStatus(record)}>
              {record.status === 'active' ? '停用' : '启用'}
            </Button>
            <Popconfirm title="确定删除此用户?" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          用户管理
        </Title>
        <Space>
          <Input placeholder="搜索用户" allowClear style={{ width: 200 }} prefix={<SearchOutlined />} onChange={(e) => handleSearch(e.target.value)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ background: '#1890ff' }}>
            新增用户
          </Button>
        </Space>
      </div>

      <Card>
        <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={editingUser ? '编辑用户' : '新增用户'} open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="userId" label="用户ID" rules={[{ required: true, message: '请输入用户ID' }]}>
            <Input placeholder="请输入用户ID" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="employee">员工</Select.Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}