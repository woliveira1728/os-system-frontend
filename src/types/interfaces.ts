export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'MANAGER' | 'CLIENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  id: string;
  orderId: string;
  title: string;
  completed: boolean;
  notes?: string;
  required: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  orderId: string;
  filename: string;
  url: string;
  path?: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  description?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: OrderStatus;
  priority: PriorityLevel;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  scheduledAt?: string;
  user?: User;
  checklist?: ChecklistItem[];
  photos?: Photo[];
}

export interface CreateOrderData {
  title: string;
  description: string;
  location?: string;
  priority?: PriorityLevel;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  scheduledAt?: string;
}

export interface OrdersContextData {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  getOrder: (id: string) => Promise<Order>;
  createOrder: (data: CreateOrderData) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  fetchChecklist: (orderId: string) => Promise<ChecklistItem[]>;
  addChecklistItem: (orderId: string, title: string) => Promise<void>;
  toggleChecklistItem: (id: string) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
}