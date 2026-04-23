import type { User, Customer, Attachment, OperationLog, SearchParams } from '../types';
import { mockUsers, mockPasswords, mockCustomers, mockAttachments, mockLogs, generateCustomerNo, generateId } from '../data/mockData';
import SHA256 from 'crypto-js/sha256';

// 本地存储键
const STORAGE_KEYS = {
  users: 'cdms_users',
  customers: 'cdms_customers',
  attachments: 'cdms_attachments',
  logs: 'cdms_logs',
};

// 初始化存储数据
function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.customers)) {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(mockCustomers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.attachments)) {
    localStorage.setItem(STORAGE_KEYS.attachments, JSON.stringify(mockAttachments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.logs)) {
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(mockLogs));
  }
}

// 获取数据
function getData<T>(key: string): T[] {
  initStorage();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// 保存数据
function setData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// 认证服务
export const authService = {
  async login(userId: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const users = getData<User>(STORAGE_KEYS.users);
    const user = users.find((u) => u.userId === userId);

    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    if (user.status === 'locked') {
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const remaining = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
        return { success: false, message: `账户已锁定，请 ${remaining} 分钟后再试` };
      } else {
        user.status = 'active';
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        setData(STORAGE_KEYS.users, users);
      }
    }

    if (user.status === 'disabled') {
      return { success: false, message: '账户已被禁用，请联系管理员' };
    }

    const passwordHash = simpleHash(password);
    const storedPassword = mockPasswords[userId];

    if (passwordHash !== storedPassword) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.status = 'locked';
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      }
      setData(STORAGE_KEYS.users, users);
      return { success: false, message: `密码错误，还可尝试 ${5 - user.failedLoginAttempts} 次` };
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    setData(STORAGE_KEYS.users, users);

    // 记录登录日志
    logService.addLog(userId, user.name, 'login', 'system', '', '用户登录成功');

    return { success: true, user, message: '登录成功' };
  },

  async logout(userId: string, userName: string): Promise<void> {
    logService.addLog(userId, userName, 'logout', 'system', '', '用户退出登录');
  },

  getCurrentUser(): User | null {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentUser(user: User): void {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  },

  clearCurrentUser(): void {
    sessionStorage.removeItem('currentUser');
  },
};

// SHA-256 哈希
function simpleHash(str: string): string {
  return SHA256(str).toString();
}

// 客户管理服务
export const customerService = {
  async getCustomers(params?: SearchParams): Promise<Customer[]> {
    let customers = getData<Customer>(STORAGE_KEYS.customers);

    if (params) {
      if (params.name) {
        customers = customers.filter((c) => c.name.includes(params.name!));
      }
      if (params.customerNo) {
        customers = customers.filter((c) => c.customerNo === params.customerNo);
      }
      if (params.responsible) {
        customers = customers.filter((c) => c.responsible.includes(params.responsible!));
      }
      if (params.status) {
        customers = customers.filter((c) => c.status === params.status);
      }
    }

    return customers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getCustomer(id: string): Promise<Customer | null> {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    return customers.find((c) => c.id === id) || null;
  },

  async createCustomer(data: Omit<Customer, 'id' | 'customerNo' | 'createdAt' | 'updatedBy' | 'updatedAt'>, userId: string, userName: string): Promise<Customer> {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      customerNo: generateCustomerNo(),
      createdBy: userId,
      createdAt: now,
      updatedBy: userId,
      updatedAt: now,
    };
    customers.push(newCustomer);
    setData(STORAGE_KEYS.customers, customers);
    logService.addLog(userId, userName, 'customer_create', 'customer', newCustomer.id, `创建客户: ${newCustomer.name}`);
    return newCustomer;
  },

  async updateCustomer(id: string, data: Partial<Customer>, userId: string, userName: string): Promise<Customer | null> {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCustomer = {
      ...customers[index],
      ...data,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };
    customers[index] = updatedCustomer;
    setData(STORAGE_KEYS.customers, customers);
    logService.addLog(userId, userName, 'customer_update', 'customer', id, `更新客户: ${updatedCustomer.name}`);
    return updatedCustomer;
  },

  async deleteCustomer(id: string, userId: string, userName: string): Promise<boolean> {
    const customers = getData<Customer>(STORAGE_KEYS.customers);
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return false;

    const customer = customers[index];
    customers.splice(index, 1);
    setData(STORAGE_KEYS.customers, customers);
    logService.addLog(userId, userName, 'customer_delete', 'customer', id, `删除客户: ${customer.name}`);
    return true;
  },
};

// 附件管理服务
export const attachmentService = {
  async getAttachments(customerId?: string): Promise<Attachment[]> {
    let attachments = getData<Attachment>(STORAGE_KEYS.attachments);
    if (customerId) {
      attachments = attachments.filter((a) => a.customerId === customerId);
    }
    return attachments.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  },

  async uploadAttachment(customerId: string, file: File, userId: string, userName: string): Promise<Attachment> {
    const attachments = getData<Attachment>(STORAGE_KEYS.attachments);
    const newAttachment: Attachment = {
      id: generateId(),
      customerId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: `/uploads/${file.name}`,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
    };
    attachments.push(newAttachment);
    setData(STORAGE_KEYS.attachments, attachments);
    logService.addLog(userId, userName, 'attachment_upload', 'attachment', newAttachment.id, `上传附件: ${file.name}`);
    return newAttachment;
  },

  async deleteAttachment(id: string, userId: string, userName: string): Promise<boolean> {
    const attachments = getData<Attachment>(STORAGE_KEYS.attachments);
    const index = attachments.findIndex((a) => a.id === id);
    if (index === -1) return false;

    const attachment = attachments[index];
    attachments.splice(index, 1);
    setData(STORAGE_KEYS.attachments, attachments);
    logService.addLog(userId, userName, 'attachment_upload', 'attachment', id, `删除附件: ${attachment.fileName}`);
    return true;
  },

  downloadFile(attachment: Attachment): void {
    logService.addLog('system', '系统', 'attachment_download', 'attachment', attachment.id, `下载附件: ${attachment.fileName}`);
  },
};

// 用户管理服务
export const userService = {
  async getUsers(): Promise<User[]> {
    return getData<User>(STORAGE_KEYS.users);
  },

  async getUser(id: string): Promise<User | null> {
    const users = getData<User>(STORAGE_KEYS.users);
    return users.find((u) => u.id === id) || null;
  },

  async createUser(data: Omit<User, 'id' | 'createdAt'>, password: string, adminUserId: string, adminUserName: string): Promise<User> {
    const users = getData<User>(STORAGE_KEYS.users);
    const newUser: User = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setData(STORAGE_KEYS.users, users);
    mockPasswords[data.userId] = simpleHash(password);
    logService.addLog(adminUserId, adminUserName, 'user_create', 'user', newUser.id, `创建用户: ${newUser.name}`);
    return newUser;
  },

  async updateUser(id: string, data: Partial<User>, password: string | undefined, adminUserId: string, adminUserName: string): Promise<User | null> {
    const users = getData<User>(STORAGE_KEYS.users);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    setData(STORAGE_KEYS.users, users);
    if (password) {
      mockPasswords[updatedUser.userId] = simpleHash(password);
    }
    logService.addLog(adminUserId, adminUserName, 'user_update', 'user', id, `更新用户: ${updatedUser.name}`);
    return updatedUser;
  },

  async deleteUser(id: string, adminUserId: string, adminUserName: string): Promise<boolean> {
    const users = getData<User>(STORAGE_KEYS.users);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    const user = users[index];
    users.splice(index, 1);
    setData(STORAGE_KEYS.users, users);
    delete mockPasswords[user.userId];
    logService.addLog(adminUserId, adminUserName, 'user_delete', 'user', id, `删除用户: ${user.name}`);
    return true;
  },
};

// 日志服务
export const logService = {
  async getLogs(): Promise<OperationLog[]> {
    return getData<OperationLog>(STORAGE_KEYS.logs).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  addLog(userId: string, userName: string, action: OperationLog['action'], targetType: string, targetId: string, details: string): void {
    const logs = getData<OperationLog>(STORAGE_KEYS.logs);
    const newLog: OperationLog = {
      id: generateId(),
      userId,
      userName,
      action,
      targetType,
      targetId,
      details,
      ip: '192.168.1.100',
      createdAt: new Date().toISOString(),
    };
    logs.push(newLog);
    setData(STORAGE_KEYS.logs, logs);
  },
};