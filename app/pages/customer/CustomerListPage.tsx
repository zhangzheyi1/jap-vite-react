import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, message, Popconfirm, Card, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/api';
import type { Customer, SearchParams } from '../../types';
import { formatDate, formatStatus, getStatusColor } from '../../utils';
import styles from './CustomerListPage.module.less';

const { Title } = Typography;

export default function CustomerListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const [searchVisible, setSearchVisible] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [searchParams]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers(searchParams);
      setCustomers(data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (field: keyof SearchParams, value: string) => {
    setSearchParams((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await customerService.deleteCustomer(id, user!.userId, user!.name);
      if (success) {
        message.success('删除成功');
        loadCustomers();
      }
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '客户编号', dataIndex: 'customerNo', key: 'customerNo', width: 180 },
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson', width: 100 },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone', width: 130 },
    { title: '负责人', dataIndex: 'responsible', key: 'responsible', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={getStatusColor(status)}>{formatStatus(status)}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => formatDate(date, 'YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Customer) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/customers/${record.id}`)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/customers/${record.id}/edit`)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此客户?" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          客户资料列表
        </Title>
        <Space>
          <Button icon={<FilterOutlined />} onClick={() => setSearchVisible(!searchVisible)}>
            筛选
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/customers/new')} className={styles.addBtn}>
            新增客户
          </Button>
        </Space>
      </div>

      {searchVisible && (
        <Card size="small" className={styles.searchCard}>
          <Space wrap>
            <Input
              placeholder="客户名称"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch('name', e.target.value)}
            />
            <Input placeholder="客户编号" allowClear style={{ width: 180 }} onChange={(e) => handleSearch('customerNo', e.target.value)} />
            <Input placeholder="负责人" allowClear style={{ width: 120 }} onChange={(e) => handleSearch('responsible', e.target.value)} />
            <Select placeholder="状态" allowClear style={{ width: 120 }} onChange={(value) => handleSearch('status', value || '')}>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
              <Select.Option value="archived">已归档</Select.Option>
            </Select>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Card>
      )}

      <Table columns={columns} dataSource={customers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} scroll={{ x: 1000 }} />
    </div>
  );
}