import React from 'react';
import KPICard from './KPICard';
import Chart from './Chart';
import DataTable from './DataTable';
import ProductTable from './ProductTable';
import AlertPanel from './AlertPanel';
import { KPICard as KPICardType, ChartData, TableData, Product } from '../types';

const kpiData: KPICardType[] = [
  {
    title: 'Doanh Thu Tháng',
    value: '4.35B',
    change: '+12.5%',
    trend: 'up',
    icon: 'TrendingUp'
  },
  {
    title: 'Chi Phí Tháng',
    value: '3.25B',
    change: '+8.2%',
    trend: 'up',
    icon: 'TrendingDown'
  },
  {
    title: 'Lợi Nhuận Tháng',
    value: '1.10B',
    change: '+18.7%',
    trend: 'up',
    icon: 'DollarSign'
  },
  {
    title: 'Dòng Tiền',
    value: '850M',
    change: '+5.3%',
    trend: 'up',
    icon: 'TrendingUp'
  }
];

const revenueExpenseData: ChartData[] = [
  { label: 'T1', value: 2800000000 },
  { label: 'T2', value: 3100000000 },
  { label: 'T3', value: 2900000000 },
  { label: 'T4', value: 3300000000 },
  { label: 'T5', value: 3200000000 },
  { label: 'T6', value: 3450000000 },
  { label: 'T7', value: 3800000000 },
  { label: 'T8', value: 4100000000 },
  { label: 'T9', value: 3900000000 },
  { label: 'T10', value: 4300000000 },
  { label: 'T11', value: 4200000000 },
  { label: 'T12', value: 4350000000 }
];

const cashFlowData: ChartData[] = [
  { label: 'T1', value: 3200000000 },
  { label: 'T2', value: 2800000000 },
  { label: 'T3', value: 3100000000 },
  { label: 'T4', value: 2900000000 },
  { label: 'T5', value: 3300000000 },
  { label: 'T6', value: 3200000000 }
];

const profitData: ChartData[] = [
  { label: 'Doanh Thu Thuần', value: 68 },
  { label: 'Chi Phí Hoạt Động', value: 25 },
  { label: 'Lợi Nhuận', value: 7 }
];

const partnerExpenseData: ChartData[] = [
  { label: 'Sản xuất chính', value: 45 },
  { label: 'Bán hàng & Marketing', value: 35 },
  { label: 'Quản lý chung', value: 20 },
  { label: 'Nghiên cứu phát triển', value: 10 }
];

const receivableData: TableData[] = [
  { id: '1', name: 'Công ty TNHH ABC', amount: 150000000, dueDate: '15/12/2024', status: 'overdue' },
  { id: '2', name: 'Công ty XYZ Ltd', amount: 89000000, dueDate: '20/12/2024', status: 'due-soon' },
  { id: '3', name: 'Công ty DEF Corp', amount: 220000000, dueDate: '25/12/2024', status: 'current' },
  { id: '4', name: 'Doanh nghiệp GHI', amount: 95000000, dueDate: '10/12/2024', status: 'overdue' }
];

const payableData: TableData[] = [
  { id: '1', name: 'NCC Nguyên liệu A', amount: 120000000, dueDate: '18/12/2024', status: 'due-soon' },
  { id: '2', name: 'NCC Thiết bị B', amount: 75000000, dueDate: '22/12/2024', status: 'current' },
  { id: '3', name: 'NCC Dịch vụ C', amount: 180000000, dueDate: '12/12/2024', status: 'overdue' },
  { id: '4', name: 'NCC Vận chuyển D', amount: 45000000, dueDate: '28/12/2024', status: 'current' }
];

const bestSellingProducts: Product[] = [
  { id: '1', name: 'Sản phẩm A1', sold: 1250, revenue: 375000000, stock: 85 },
  { id: '2', name: 'Sản phẩm B2', sold: 980, revenue: 294000000, stock: 8 },
  { id: '3', name: 'Sản phẩm C3', sold: 750, revenue: 225000000, stock: 42 },
  { id: '4', name: 'Sản phẩm D4', sold: 620, revenue: 186000000, stock: 5 },
  { id: '5', name: 'Sản phẩm E5', sold: 580, revenue: 174000000, stock: 67 }
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart title="Doanh Thu & Chi Phí" data={revenueExpenseData} type="bar" />
        <Chart title="Dòng Tiền (Quản lý Tài khoản)" data={cashFlowData} type="line" />
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart title="Tỷ Lệ Lợi Nhuận (Quản lý Tài khoản)" data={profitData} type="pie" />
        <Chart title="Đối tượng Tập hợp Chi phí" data={partnerExpenseData} type="pie" />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable title="Công nợ phải thu" data={receivableData} type="receivable" />
        <DataTable title="Công nợ phải trả" data={payableData} type="payable" />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProductTable title="Sản phẩm bán chạy nhất" products={bestSellingProducts} />
        </div>
        <div>
          <AlertPanel />
        </div>
      </div>
    </div>
  );
}