import { useState, useEffect } from 'react';
import { Card, Descriptions, Typography, Tag, Table, Button, Space, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router';
import { customerService, attachmentService } from '../../services/api';
import type { Customer, Attachment } from '../../types';
import { formatDate, formatStatus, getStatusColor, formatFileSize } from '../../utils';

const { Title } = Typography;

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (id) {
      loadCustomer(id);
    }
  }, [id]);

  const loadCustomer = async (customerId: string) => {
    const data = await customerService.getCustomer(customerId);
    if (data) {
      setCustomer(data);
      const files = await attachmentService.getAttachments(customerId);
      setAttachments(files);
    } else {
      navigate('/customers');
    }
  };

  if (!customer) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            客户详情
          </Title>
        </Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/customers/${id}/edit`)} style={{ background: '#1890ff' }}>
          编辑
        </Button>
      </div>

      <Card>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="客户编号">{customer.customerNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={getStatusColor(customer.status)}>{formatStatus(customer.status)}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="客户名称">{customer.name}</Descriptions.Item>
          <Descriptions.Item label="联系人">{customer.contactPerson}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{customer.contactPhone}</Descriptions.Item>
          <Descriptions.Item label="联系邮箱">{customer.contactEmail}</Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>
            {customer.address}
          </Descriptions.Item>
          <Descriptions.Item label="负责人">{customer.responsible}</Descriptions.Item>
          <Descriptions.Item label="备注">{customer.remark}</Descriptions.Item>
          <Descriptions.Item label="创建人">{customer.createdBy}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{formatDate(customer.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="更新人">{customer.updatedBy}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{formatDate(customer.updatedAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {attachments.length > 0 && (
        <Card title="附件列表" style={{ marginTop: 16 }}>
          <Table
            columns={[
              { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
              { title: '大小', dataIndex: 'fileSize', key: 'fileSize', render: (size: number) => formatFileSize(size) },
              { title: '上传人', dataIndex: 'uploadedBy', key: 'uploadedBy' },
              { title: '上传时间', dataIndex: 'uploadedAt', key: 'uploadedAt', render: (date: string) => formatDate(date) },
            ]}
            dataSource={attachments}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}