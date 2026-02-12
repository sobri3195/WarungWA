import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Order, OrderStatus } from '../../types';
import { orderService } from '../../lib/services/orderService';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { useToastStore } from '../../lib/stores/toastStore';
import { formatCurrency } from '../../lib/utils/whatsapp';

interface OrderKanbanProps {
  orders: Order[];
  onRefresh: () => void;
  onOrderClick: (order: Order) => void;
}

const statusColumns: Array<{ status: OrderStatus; label: string; color: string }> = [
  { status: 'NEW', label: 'Baru', color: 'bg-blue-100 border-blue-300' },
  { status: 'CONFIRMED', label: 'Konfirmasi', color: 'bg-yellow-100 border-yellow-300' },
  { status: 'PACKED', label: 'Dikemas', color: 'bg-purple-100 border-purple-300' },
  { status: 'SHIPPED', label: 'Dikirim', color: 'bg-orange-100 border-orange-300' },
  { status: 'COMPLETED', label: 'Selesai', color: 'bg-green-100 border-green-300' },
];

export function OrderKanban({ orders, onRefresh, onOrderClick }: OrderKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { session } = useSessionStore();
  const { showToast } = useToastStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !session) return;

    const orderId = active.id as string;
    const newStatus = over.id as OrderStatus;

    if (statusColumns.find((col) => col.status === newStatus)) {
      try {
        await orderService.updateStatus(orderId, newStatus, session.userName);
        showToast('success', 'Status pesanan berhasil diubah');
        onRefresh();
      } catch (error) {
        showToast('error', 'Gagal mengubah status pesanan');
        console.error(error);
      }
    }

    setActiveId(null);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const activeOrder = activeId ? orders.find((o) => o.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statusColumns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          return (
            <KanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              color={column.color}
              orders={columnOrders}
              onOrderClick={onOrderClick}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeOrder ? (
          <OrderCard order={activeOrder} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanColumnProps {
  status: OrderStatus;
  label: string;
  color: string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

function KanbanColumn({ status, label, color, orders, onOrderClick }: KanbanColumnProps) {
  return (
    <SortableContext
      id={status}
      items={orders.map((o) => o.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex-shrink-0 w-80">
        <div className={`${color} border-2 rounded-lg p-4 min-h-[600px]`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{label}</h3>
            <span className="bg-white px-2 py-1 rounded-full text-sm font-semibold">
              {orders.length}
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <SortableOrderCard
                key={order.id}
                order={order}
                onOrderClick={onOrderClick}
              />
            ))}
          </div>
        </div>
      </div>
    </SortableContext>
  );
}

interface SortableOrderCardProps {
  order: Order;
  onOrderClick: (order: Order) => void;
}

function SortableOrderCard({ order, onOrderClick }: SortableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard order={order} onOrderClick={onOrderClick} />
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  isDragging?: boolean;
  onOrderClick?: (order: Order) => void;
}

function OrderCard({ order, isDragging = false, onOrderClick }: OrderCardProps) {
  const priorityColors = {
    NORMAL: 'bg-gray-100 text-gray-700',
    URGENT: 'bg-red-100 text-red-700',
  };

  const paymentColors = {
    UNPAID: 'bg-red-100 text-red-700',
    DOWN_PAYMENT: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-xl' : ''
      }`}
      onClick={() => onOrderClick && onOrderClick(order)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-mono text-xs text-gray-500">
            #{order.id.substring(0, 8).toUpperCase()}
          </p>
          <p className="font-bold text-lg">{order.customerName}</p>
        </div>
        {order.priority === 'URGENT' && (
          <span className={`${priorityColors.URGENT} px-2 py-1 rounded text-xs font-semibold`}>
            URGENT
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">📱</span>
          <span className="text-gray-700">{order.customerPhone}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Total:</span>
          <span className="font-bold text-primary-600">
            Rp {formatCurrency(order.total)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Pembayaran:</span>
          <span className={`${paymentColors[order.paymentStatus]} px-2 py-1 rounded text-xs font-semibold`}>
            {order.paymentStatus === 'UNPAID' && 'Belum Bayar'}
            {order.paymentStatus === 'DOWN_PAYMENT' && 'DP'}
            {order.paymentStatus === 'PAID' && 'Lunas'}
          </span>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          {new Date(order.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
