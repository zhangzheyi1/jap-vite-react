import { useState, useEffect, useMemo } from 'react';
import { Table, Card, Typography, Tag, Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { logService } from '../../services/api';
import type { OperationLog } from '../../types';
import { formatDate, formatAction, getActionColor } from '../../utils';
import styles from './LogListPage.module.less';

const { Title } = Typography;

export default function LogListPage() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState<string>();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await logService.getLogs();
      setLogs(data);
    } catch {
      console.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    let result = logs;
    if (searchText) {
      result = result.filter((log) => log.userName.includes(searchText) || log.details.includes(searchText));
    }
    if (actionFilter) {
      result = result.filter((log) => log.action === actionFilter);
    }
    return result;
  }, [logs, searchText, actionFilter]);

  const columns = useMemo(
    () => [
      {
        title: '时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (date: string) => formatDate(date, 'YYYY-MM-DD HH:mm:ss'),
      },
      { title: '用户', dataIndex: 'userName', key: 'userName', width: 120 },
      {
        title: '操作类型',
        dataIndex: 'action',
        key: 'action',
        width: 120,
        render: (action: string) => <Tag color={getActionColor(action)}>{formatAction(action)}</Tag>,
      },
      { title: '详情', dataIndex: 'details', key: 'details' },
      { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 130 },
    ],
    []
  );

  return (
    <div>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          操作日志
        </Title>
        <Space>
          <Input placeholder="搜索日志" allowClear className={styles.searchInput} prefix={<SearchOutlined />} onChange={(e) => setSearchText(e.target.value)} />
          <Select
            placeholder="操作类型"
            allowClear
            className={styles.filterSelect}
            onChange={setActionFilter}
            options={[
              { value: 'login', label: '登录' },
              { value: 'logout', label: '登出' },
              { value: 'customer_create', label: '新增客户' },
              { value: 'customer_update', label: '修改客户' },
              { value: 'customer_delete', label: '删除客户' },
              { value: 'attachment_upload', label: '上传附件' },
              { value: 'attachment_download', label: '下载附件' },
              { value: 'user_create', label: '新增用户' },
              { value: 'user_update', label: '修改用户' },
              { value: 'user_delete', label: '删除用户' },
            ]}
          />
        </Space>
      </div>

      <Card>
        <Table columns={columns} dataSource={filteredLogs} rowKey="id" loading={loading} pagination={{ pageSize: 15 }} />
      </Card>
    </div>
  );
}