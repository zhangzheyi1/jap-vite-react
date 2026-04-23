import type { User, Customer, Attachment, OperationLog } from '../types';
import SHA256 from 'crypto-js/sha256';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: '1',
    userId: 'admin',
    name: '系统管理员',
    role: 'admin',
    status: 'active',
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: 'zhangsan',
    name: '张三',
    role: 'employee',
    status: 'active',
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    userId: 'lisi',
    name: '李四',
    role: 'employee',
    status: 'active',
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// 模拟密码 (密码: password -> SHA-256)
export const mockPasswords: Record<string, string> = {
  admin: SHA256('password').toString(),
  zhangsan: SHA256('password').toString(),
  lisi: SHA256('password').toString(),
};

// 模拟客户数据
export const mockCustomers: Customer[] = [
  {
    id: '1',
    customerNo: 'CUS-20240423-001',
    name: '科技有限公司',
    contactPerson: '王总',
    contactPhone: '13800138000',
    contactEmail: 'wang@example.com',
    address: '北京市朝阳区xxx大厦',
    responsible: '张三',
    status: 'active',
    remark: '重要客户',
    createdBy: 'admin',
    createdAt: '2024-01-10T08:00:00Z',
    updatedBy: 'admin',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    customerNo: 'CUS-20240423-002',
    name: '商贸有限公司',
    contactPerson: '李总',
    contactPhone: '13900139000',
    contactEmail: 'li@example.com',
    address: '上海市浦东新区xxx路',
    responsible: '李四',
    status: 'active',
    remark: '',
    createdBy: 'admin',
    createdAt: '2024-02-15T10:00:00Z',
    updatedBy: 'admin',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: '3',
    customerNo: 'CUS-20240423-003',
    name: '建材批发市场',
    contactPerson: '赵总',
    contactPhone: '13700137000',
    contactEmail: 'zhao@example.com',
    address: '广州市天河区xxx街',
    responsible: '张三',
    status: 'inactive',
    remark: '暂停合作',
    createdBy: 'admin',
    createdAt: '2024-03-01T09:00:00Z',
    updatedBy: 'admin',
    updatedAt: '2024-03-05T11:00:00Z',
  },
  {
    id: '4',
    customerNo: 'CUS-20240423-004',
    name: '服装加工厂',
    contactPerson: '孙总',
    contactPhone: '13600136000',
    contactEmail: 'sun@example.com',
    address: '深圳市宝安区xxx工业园',
    responsible: '李四',
    status: 'active',
    remark: '新客户',
    createdBy: 'admin',
    createdAt: '2024-03-10T14:00:00Z',
    updatedBy: 'admin',
    updatedAt: '2024-03-10T14:00:00Z',
  },
  {
    id: '5',
    customerNo: 'CUS-20240423-005',
    name: '电子科技有限公司',
    contactPerson: '周总',
    contactPhone: '13500135000',
    contactEmail: 'zhou@example.com',
    address: '杭州市滨江区xxx科技园',
    responsible: '张三',
    status: 'archived',
    remark: '已归档',
    createdBy: 'admin',
    createdAt: '2024-03-15T16:00:00Z',
    updatedBy: 'admin',
    updatedAt: '2024-03-20T10:00:00Z',
  },
];

// 模拟附件数据
export const mockAttachments: Attachment[] = [
  {
    id: '1',
    customerId: '1',
    fileName: '合同文件.pdf',
    fileSize: 1024000,
    fileType: 'application/pdf',
    fileUrl: '/uploads/contract.pdf',
    uploadedBy: 'admin',
    uploadedAt: '2024-01-10T09:00:00Z',
  },
  {
    id: '2',
    customerId: '1',
    fileName: '营业执照.jpg',
    fileSize: 512000,
    fileType: 'image/jpeg',
    fileUrl: '/uploads/license.jpg',
    uploadedBy: 'admin',
    uploadedAt: '2024-01-10T09:30:00Z',
  },
  {
    id: '3',
    customerId: '2',
    fileName: '财务报表.xlsx',
    fileSize: 256000,
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileUrl: '/uploads/report.xlsx',
    uploadedBy: 'admin',
    uploadedAt: '2024-02-15T11:00:00Z',
  },
];

// 模拟操作日志
export const mockLogs: OperationLog[] = [
  {
    id: '1',
    userId: 'admin',
    userName: '系统管理员',
    action: 'login',
    targetType: 'system',
    targetId: '',
    details: '用户登录成功',
    ip: '192.168.1.100',
    createdAt: '2024-04-23T08:00:00Z',
  },
  {
    id: '2',
    userId: 'zhangsan',
    userName: '张三',
    action: 'login',
    targetType: 'system',
    targetId: '',
    details: '用户登录成功',
    ip: '192.168.1.101',
    createdAt: '2024-04-23T09:00:00Z',
  },
  {
    id: '3',
    userId: 'admin',
    userName: '系统管理员',
    action: 'customer_create',
    targetType: 'customer',
    targetId: '1',
    details: '创建客户: 科技有限公司',
    ip: '192.168.1.100',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: '4',
    userId: 'admin',
    userName: '系统管理员',
    action: 'attachment_upload',
    targetType: 'attachment',
    targetId: '1',
    details: '上传附件: 合同文件.pdf',
    ip: '192.168.1.100',
    createdAt: '2024-01-10T09:00:00Z',
  },
];

// 生成客户编号
export function generateCustomerNo(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CUS-${today}-${random}`;
}

// 生成ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}