import dayjs from 'dayjs';

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(date).format(format);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    active: '正常',
    inactive: '停用',
    archived: '已归档',
    locked: '已锁定',
    disabled: '已禁用',
  };
  return statusMap[status] || status;
}

export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    admin: '管理员',
    employee: '员工',
  };
  return roleMap[role] || role;
}

export function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    login: '登录',
    logout: '登出',
    customer_create: '新增客户',
    customer_update: '修改客户',
    customer_delete: '删除客户',
    attachment_upload: '上传附件',
    attachment_download: '下载附件',
    user_create: '新增用户',
    user_update: '修改用户',
    user_delete: '删除用户',
  };
  return actionMap[action] || action;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'orange',
    archived: 'default',
    locked: 'red',
    disabled: 'red',
  };
  return colorMap[status] || 'default';
}

export function getRoleColor(role: string): string {
  const colorMap: Record<string, string> = {
    admin: 'blue',
    employee: 'default',
  };
  return colorMap[role] || 'default';
}

export function getActionColor(action: string): string {
  const colorMap: Record<string, string> = {
    login: 'green',
    logout: 'default',
    customer_create: 'blue',
    customer_update: 'orange',
    customer_delete: 'red',
    attachment_upload: 'blue',
    attachment_download: 'green',
    user_create: 'blue',
    user_update: 'orange',
    user_delete: 'red',
  };
  return colorMap[action] || 'default';
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}