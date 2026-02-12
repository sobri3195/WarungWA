import { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Order, OrderStatus } from '../lib/db';
import { formatCurrency } from '../lib/whatsapp';

interface KanbanColumn {
  id: OrderStatus;
  title: string;
  color: string;
}

interface KanbanBoardProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'BARU', title: 'Baru', color: 'bg-blue-500' },
  { id: 'KONFIRMASI', title: 'Konfirmasi', color: 'bg-yellow-500' },
  { id: 'DIKEMAS', title: 'Dikemas', color: 'bg-purple-500' },
  { id: 'DIKIRIM', title: 'Dikirim', color: 'bg-indigo-500' },
  { id: 'SELESAI', title: 'Selesai', color: 'bg-green-500' },
];

export const KanbanBoard = ({ orders, onOrderClick, onStatusChange }: KanbanBoardProps) => {
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const order = orders.find((o) => o.id === event.active.id);
    setActiveOrder(order || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const orderId = active.id as string;
      const newStatus = over.id as OrderStatus;
      
      onStatusChange(orderId, newStatus);
    }
    
    setActiveOrder(null);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-5 gap-4 h-[calc(100vh-12rem)] overflow-x-auto">
        {COLUMNS.map((column) => {
          const columnOrders = getOrdersByStatus(column.id);
          
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              orders={columnOrders}
              onOrderClick={onOrderClick}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeOrder ? (
          <div className="opacity-80">
            <OrderCard order={activeOrder} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface KanbanColumnProps {
  column: KanbanColumn;
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

const KanbanColumn = ({ column, orders, onOrderClick }: KanbanColumnProps) => {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg h-full">
      {/* Column Header */}
      <div className={`${column.color} text-white px-4 py-3 rounded-t-lg`}>
        <h3 className="font-semibold">{column.title}</h3>
        <p className="text-sm opacity-90">{orders.length} pesanan</p>
      </div>

      {/* Column Content */}
      <SortableContext items={orders.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {orders.map((order) => (
            <SortableOrderCard
              key={order.id}
              order={order}
              onClick={() => onOrderClick(order)}
            />
          ))}
          
          {orders.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">
              Tidak ada pesanan
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

interface SortableOrderCardProps {
  order: Order;
  onClick: () => void;
}

const SortableOrderCard = ({ order, onClick }: SortableOrderCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard order={order} onClick={onClick} />
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  isDragging?: boolean;
}

const OrderCard = ({ order, onClick, isDragging = false }: OrderCardProps) => {
  const priorityColors = {
    NORMAL: 'border-gray-300',
    URGENT: 'border-red-500',
  };

  const paymentStatusColors = {
    BELUM_BAYAR: 'bg-red-100 text-red-800',
    DP: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white border-2 ${priorityColors[order.priority]} rounded-lg p-3
        ${!isDragging && 'cursor-pointer hover:shadow-md'}
        transition-shadow
      `}
    >
      {/* Order Number & Priority */}
      <div className="flex items-start justify-between mb-2">
        <span className="font-semibold text-sm text-gray-900">
          #{order.orderNumber}
        </span>
        {order.priority === 'URGENT' && (
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
            URGENT
          </span>
        )}
      </div>

      {/* Customer */}
      <p className="text-sm font-medium text-gray-700 mb-1">
        {order.customerName}
      </p>
      <p className="text-xs text-gray-500 mb-2">{order.customerPhone}</p>

      {/* Total */}
      <div className="text-lg font-bold text-blue-600 mb-2">
        {formatCurrency(order.total)}
      </div>

      {/* Payment Status */}
      <span className={`inline-block text-xs px-2 py-1 rounded ${paymentStatusColors[order.paymentStatus]}`}>
        {order.paymentStatus === 'BELUM_BAYAR' && 'Belum Bayar'}
        {order.paymentStatus === 'DP' && 'DP'}
        {order.paymentStatus === 'LUNAS' && 'Lunas'}
      </span>

      {/* Date */}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(order.createdAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};
