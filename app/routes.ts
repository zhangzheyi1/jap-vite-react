import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  index("pages/auth/LoginPage.tsx"),
  layout("components/layout/MainLayout.tsx", [
    route("dashboard", "pages/dashboard/DashboardPage.tsx"),
    route("customers", "pages/customer/CustomerListPage.tsx"),
    route("customers/new", "pages/customer/CustomerFormPage.tsx"),
    route("customers/:id", "pages/customer/CustomerDetailPage.tsx"),
    route("customers/:id/edit", "pages/customer/CustomerEditPage.tsx"),
    route("attachments", "pages/attachment/AttachmentListPage.tsx"),
    route("users", "pages/user/UserListPage.tsx"),
    route("logs", "pages/log/LogListPage.tsx"),
  ]),
] satisfies RouteConfig;