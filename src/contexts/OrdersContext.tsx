'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { Order, ChecklistItem, CreateOrderData, OrdersContextData, OrderStatus } from '@/types/interfaces';

const OrdersContext = createContext<OrdersContextData>({} as OrdersContextData);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Order[]>('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = async (id: string): Promise<Order> => {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  };

  const createOrder = async (data: CreateOrderData) => {
    await api.post('/orders', data);
    toast.success('Pedido criado com sucesso!');
    await fetchOrders();
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success('Status do pedido atualizado!');
    await fetchOrders();
  };

  const deleteOrder = async (id: string) => {
    await api.delete(`/orders/${id}`);
    toast.success('Pedido excluído com sucesso!');
    await fetchOrders();
  };

  const fetchChecklist = useCallback(async (orderId: string) => {
    const res = await api.get<ChecklistItem[]>(`/checklist/orders/${orderId}/checklist`);
    return res.data;
  }, []);

  const addChecklistItem = async (orderId: string, title: string) => {
    await api.post(`/checklist/orders/${orderId}/checklist`, { title });
  };

  const toggleChecklistItem = async (id: string) => {
    await api.patch(`/checklist/${id}/toggle`);
  };

  const deleteChecklistItem = async (id: string) => {
    await api.delete(`/checklist/${id}`);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        fetchOrders,
        getOrder,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        fetchChecklist,
        addChecklistItem,
        toggleChecklistItem,
        deleteChecklistItem,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) throw new Error('useOrders must be used within an OrdersProvider');
  return context;
};