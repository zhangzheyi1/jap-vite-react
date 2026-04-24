import { useState, useEffect } from 'react';
import { Table, Button, Upload, message, Card, Typography, Select, Space, Tag, Popconfirm } from 'antd';
import { InboxOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { attachmentService, customerService } from '../../services/api';
import type { Attachment, Customer } from '../../types';
import { formatDate, formatFileSize } from '../../utils';
import styles from './AttachmentListPage.module.less';

const { Title } = Typography;

export default function AttachmentListPage() {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>();

  useEffect(() => {
    loadCustomers();
    loadAttachments();
  }, []);

  useEffect(() => {
    loadAttachments();
  }, [selectedCustomer]);

  const loadCustomers = async () => {
    const data = await customerService.getCustomers();
    setCustomers(data);
  };

  const loadAttachments = async () => {
    setLoading(true);
    try {
      const data = await attachmentService.getAttachments(selectedCustomer);
      setAttachments(data);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!selectedCustomer) {
      message.warning('请先选择客户');
      return false;
    }
    if (file.size > 20 * 1024 * 1024) {
      message.error('文件大小不能超过20MB');
      return false;
    }
    try {
      await attachmentService.uploadAttachment(selectedCustomer, file, user!.userId, user!.name);
      message.success('上传成功');
      loadAttachments();
    } catch {
      message.error('上传失败');
    }
    return false;
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await attachmentService.deleteAttachment(id, user!.userId, user!.name);
      if (success) {
        message.success('删除成功');
        loadAttachments();
      }
    } catch {
      message.error('删除失败');
    }
  };

  const handleDownload = (attachment: Attachment) => {
    attachmentService.downloadFile(attachment);
    message.info('开始下载');
  };

  const columns = [
    { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
    { title: '大小', dataIndex: 'fileSize', key: 'fileSize', render: (size: number) => formatFileSize(size), width: 100 },
    {
      title: '客户',
      dataIndex: 'customerId',
      key: 'customerId',
      render: (customerId: string) => customers.find((c) => c.id === customerId)?.name || customerId,
    },
    { title: '上传人', dataIndex: 'uploadedBy', key: 'uploadedBy', width: 100 },
    { title: '上传时间', dataIndex: 'uploadedAt', key: 'uploadedAt', width: 180, render: (date: string) => formatDate(date) },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Attachment) => (
        <Space>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record)}>
            下载
          </Button>
          <Popconfirm title="确定删除此附件?" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
          附件管理
        </Title>
        <Space className={styles.toolbar}>
          <Select placeholder="选择客户" style={{ width: 200 }} allowClear value={selectedCustomer} onChange={setSelectedCustomer}>
            {customers.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
          <Upload beforeUpload={handleUpload} showUploadList={false}>
            <Button type="primary" icon={<InboxOutlined />} className={styles.uploadBtn}>
              上传附件
            </Button>
          </Upload>
        </Space>
      </div>

      <Card>
        <Table columns={columns} dataSource={attachments} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
}