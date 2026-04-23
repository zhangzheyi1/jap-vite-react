# 客户资料库浏览与管理系统 - 规格说明书

## 1. 项目概述

### 项目名称
客户资料库浏览与管理系统 (Customer Data Management System)

### 项目类型
Web 企业管理系统

### 核心功能
会计事务所内部对客户资料及相关附件进行统一管理，并通过Web方式供授权用户安全访问和使用。

### 目标用户
- 管理员
- 一般员工

---

## 2. UI/UX 规格

### 2.1 布局结构

**整体布局**
- 固定头部导航栏 (64px 高度)
- 左侧可折叠侧边栏 (240px 展开 / 80px 收起)
- 主内容区域 (自适应宽度)
- 无底部footer，全屏模式

**响应式断点**
- 桌面: >= 1200px (完整布局)
- 平板: 768px - 1199px (侧边栏收起)
- 移动: < 768px (汉堡菜单)

### 2.2 视觉设计

**颜色系统**
```css
--primary-color: #1890ff        /* 主色 - 品牌蓝 */
--primary-hover: #40a9ff       /* 主色悬停 */
--primary-active: #096dd9    /* 主色激活 */
--success-color: #52c41a      /* 成功色 */
--warning-color: #faad14       /* 警告色 */
--error-color: #ff4d4f        /* 错误色 */
--text-primary: #262626       /* 主要文本 */
--text-secondary: #8c8c8c     /* 次要文本 */
--border-color: #d9d9d9       /* 边框 */
--bg-layout: #f5f5f5           /* 背景色 */
--bg-white: #ffffff           /* 卡片背景 */
--bg-header: #001529          /* 顶部导航背景 */
```

**字体系统**
- 主字体: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial
- 标题: 24px / 20px / 16px (h1/h2/h3)
- 正文: 14px
- 辅助: 12px
- 行高: 1.5

**间距系统**
- 基础单位: 8px
- 组件间距: 16px / 24px
- 页面边距: 24px

### 2.3 组件设计

**表格**
- 斑马纹: 奇数行 #fafafa
- 行高: 52px
- 表头背景: #fafafa
- 悬停背景: #f5f5f5

**表单**
- 标签宽度: 100px
- 输入框高度: 32px
- 必填标识: 红星

**按钮**
- 主按钮: primary-color, 白色文字
- 次按钮: 白色背景, primary-color 边框
- 危险按钮: error-color

---

## 3. 功能规格

### 3.1 路由结构

```
/                       -> 登录页
/dashboard              -> 仪表盘 (登录后首页)
/customers             -> 客户资料列表
/customers/new         -> 新增客户
/customers/:id         -> 客户详情
/customers/:id/edit   -> 编辑客户
/attachments          -> 附件管理
/users                -> 用户管理 (管理员)
/logs                  -> 操作日志 (管理员)
/profile              -> 个人中心
```

### 3.2 核心功能模块

#### 3.2.1 登录模块
- 用户ID + 密码登录
- 登录失败次数限制 (5次)
- 账户锁定机制 (失败5次后锁定30分钟)
- 密码哈希 (SHA-256 模拟)
- 记住我 functionality

#### 3.2.2 客户资料管理模块
**数据模型**
```typescript
interface Customer {
  id: string;
  customerNo: string;        // 客户编号 (自动生成 CUS-YYYYMMDD-XXX)
  name: string;             // 客户名称
  contactPerson: string;     // 联系人
  contactPhone: string;     // 联系电话
  contactEmail: string;     // 联系邮箱
  address: string;          // 地址
  responsible: string;     // 负责人
  status: 'active' | 'inactive' | 'archived';
  remark: string;           // 备注
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}
```

**功能**
- 客户列表 (分页, 排序)
- 新增客户 (表单验证)
- 编辑客户
- 查看详情
- 状态管理 (启用/停用/归档)

#### 3.2.3 搜索功能模块
- 按客户名称 (模糊搜索)
- 按客户编号 (精确搜索)
- 按负责人 (模糊搜索)
- 按状态 (精确筛选)
- 多条件组合搜索

#### 3.2.4 附件管理模块
**数据模型**
```typescript
interface Attachment {
  id: string;
  customerId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}
```

**功能**
- 附件上传 (限制: 20MB, pdf/doc/docx/xls/xlsx/jpg/png)
- 附件下载
- 附件列表查看
- 客户关联

#### 3.2.5 用户管理模块 (仅管理员)
**数据模型**
```typescript
interface User {
  id: string;
  userId: string;           // 登录ID
  name: string;              // 显示名称
  role: 'admin' | 'employee';
  status: 'active' | 'locked' | 'disabled';
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}
```

**功能**
- 用户列表
- 新增用户 (管理员)
- 编辑用户
- 停用/启用用户
- 设置角色

#### 3.2.6 权限管理模块
- 管理员: 全部权限
- 一般员工: 客户列表查看、新增、编辑、附件上传下载
- 后端权限校验

#### 3.2.7 操作日志模块
**日志类型**
- 登录/登出
- 客户资料变更 (新增/修改/删除)
- 附件操作 (上传/下载)
- 用户管理操作

---

## 4. 技术架构

### 4.1 技术栈
- React 19
- React Router 7
- Ant Design 6
- Tailwind CSS 4
- TypeScript
- Vite

### 4.2 组件结构
```
app/
├── components/           # 公共组件
│   ├── layout/         # 布局相关
│   ├── common/        # 通用组件
│   └── forms/         # 表单组件
├── pages/             # 页面组件
│   ├── auth/         # 认证相关
│   ├── customer/    # 客户管理
│   ├── attachment/   # 附件管理
│   ├── user/        # 用户管理
│   └── log/         # 日志管理
├── hooks/            # 自定义钩子
├── services/          # 服务层 (API模拟)
├── types/             # 类型定义
├── utils/             # 工具函数
└── data/              # 模拟数据
```

---

## 5. 验收标准

### 5.1 功能验收
- [ ] 登录功能正常 (成功/失败/锁定)
- [ ] 客户CRUD操作正常
- [ ] 搜索功能正常
- [ ] 附件上传下载正常
- [ ] 用户管理正常 (管理员)
- [ ] 权限控制正常
- [ ] 日志记录正常

### 5.2 UI验收
- [ ] 响应式布局正常
- [ ] 颜色主题一致
- [ ] 组件样式统一
- [ ] 无明显样式问题

### 5.3 性能验收
- [ ] 页面加载正常
- [ ] 无控制台错误
- [ ] 构建成功