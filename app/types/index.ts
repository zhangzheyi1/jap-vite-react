// 客户资料数据类型
export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  responsible: string;
  status: 'active' | 'inactive' | 'archived';
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

// 用户数据类型
export interface User {
  id: string;
  userId: string;
  name: string;
  role: 'admin' | 'employee';
  status: 'active' | 'locked' | 'disabled';
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}

// 附件数据类型
export interface Attachment {
  id: string;
  customerId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

// 操作日志类型
export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: 'login' | 'logout' | 'customer_create' | 'customer_update' | 'customer_delete' | 'attachment_upload' | 'attachment_download' | 'user_create' | 'user_update' | 'user_delete';
  targetType: string;
  targetId: string;
  details: string;
  ip: string;
  createdAt: string;
}

// 认证状态
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 表单数据类型
export interface LoginForm {
  userId: string;
  password: string;
  remember: boolean;
}

// 用户表单数据
export interface UserFormData {
  userId: string;
  name: string;
  role: 'admin' | 'employee';
  password?: string;
}

// 客户表单数据
export interface CustomerFormData {
  name: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  responsible: string;
  status: 'active' | 'inactive' | 'archived';
  remark: string;
}

// 搜索参数
export interface SearchParams {
  name?: string;
  customerNo?: string;
  responsible?: string;
  status?: string;
}