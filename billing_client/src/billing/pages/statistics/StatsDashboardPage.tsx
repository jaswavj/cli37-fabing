import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { statsApi, statsData, statsError } from '../../../api/statistics/statistics-api-service';
import '../master/Master.css';
import './Stats.css';

type Day = { date: string; sales: number; purchase: number };
type Dash = {
  year: number; month: number; label: string;
  sales: number; lastSales: number; salesPct: number;
  purchase: number; lastPurchase: number; purchasePct: number;
  expense: number; lastExpense: number; expensePct: number;
  profit: number; lastProfit: number; profitPct: number;
  netProfit: number; todaySales: number; todayBills: number; daily: Day[];
};

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SALES = '#3b82f6';
const PURCHASE = '#f97316';
const EXPENSE = '#a78bfa';

const n = (v?: number) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trend = (pct: number, last: number) => last === 0 ? '— No prev. data' : `${pct >= 0 ? '▲' : '▼'} ${Math.abs(pct).toFixed(1)}% vs last month`;
const compact = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 100000) return `${(v / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
};

const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="st-tip">
      <div className="st-tip-d">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="st-tip-row">
          <i style={{ background: p.color }} />
          {p.name}: ₹ {n(p.value)}
        </div>
      ))}
    </div>
  );
};

const PieTip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="st-tip">
      <div className="st-tip-row">
        <i style={{ background: p.payload.color }} />
        {p.name}: ₹ {n(p.value)} ({((p.percent || 0) * 100).toFixed(1)}%)
      </div>
    </div>
  );
};

const ActiveSlice = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="var(--color-text)" fontSize={13} fontWeight={700}>{payload.name}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--color-text-muted)" fontSize={12}>₹ {n(value)}</text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--color-text-muted)" fontSize={11}>{(percent * 100).toFixed(1)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const StatsDashboardPage: React.FC = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<Dash | null>(null);
  const [pieIndex, setPieIndex] = useState(0);

  const load = async (y = year, m = month) => {
    try {
      setData(statsData<Dash>(await statsApi.dashboard(y, m)));
    } catch (err) {
      toast.error(statsError(err, 'Could not load dashboard'));
    }
  };

  useEffect(() => { load(); }, []);

  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() + 1 - i);
  const daily = data?.daily || [];
  const pieData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Sales', value: Math.max(0, Number(data.sales || 0)), color: SALES },
      { name: 'Purchase', value: Math.max(0, Number(data.purchase || 0)), color: PURCHASE },
      { name: 'Expense', value: Math.max(0, Number(data.expense || 0)), color: EXPENSE },
    ].filter((s) => s.value > 0);
  }, [data]);
  const pieTotal = pieData.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="mst-page">
      <div className="mst-card st-filter" style={{ marginBottom: 12 }}>
        <div className="mst-card-b st-filter-row">
          <div className="mst-fg">
            <label>Year</label>
            <select className="mst-sel" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="mst-fg">
            <label>Month</label>
            <select className="mst-sel" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
            </select>
          </div>
          <div className="st-filter-acts">
            <button className="mst-btn mst-btn-primary" type="button" onClick={() => load()}>Load</button>
            {(year !== now.getFullYear() || month !== now.getMonth() + 1) && (
              <button className="mst-btn mst-btn-outline" type="button" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); load(now.getFullYear(), now.getMonth() + 1); }}>Current Month</button>
            )}
          </div>
        </div>
      </div>
      {data && (
        <>
          <div className="st-kpis">
            <div className="st-kpi sales"><div className="st-kpi-l">Total Sales</div><div className="st-kpi-v">₹ {n(data.sales)}</div><div className="st-kpi-t">{trend(data.salesPct, data.lastSales)}</div></div>
            <div className="st-kpi purchase"><div className="st-kpi-l">Total Purchase</div><div className="st-kpi-v">₹ {n(data.purchase)}</div><div className="st-kpi-t">{trend(data.purchasePct, data.lastPurchase)}</div></div>
            <div className="st-kpi expense"><div className="st-kpi-l">Total Expense</div><div className="st-kpi-v">₹ {n(data.expense)}</div><div className="st-kpi-t">{trend(data.expensePct, data.lastExpense)}</div></div>
            <div className={`st-kpi profit ${data.netProfit >= 0 ? 'up' : 'down'}`}><div className="st-kpi-l">Net Profit</div><div className="st-kpi-v">₹ {n(data.netProfit)}</div><div className="st-kpi-t">{trend(data.profitPct, data.lastProfit)}</div></div>
          </div>
          <div className="mst-note" style={{ marginBottom: 10 }}>Today: ₹ {n(data.todaySales)} across {data.todayBills} bills · Showing {data.label}</div>
          <div className="st-charts">
            <div className="mst-card">
              <div className="mst-card-h">Daily Sales vs Purchase — {data.label}</div>
              <div className="mst-card-b st-chart-body">
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={daily} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={SALES} stopOpacity={0.28} />
                        <stop offset="100%" stopColor={SALES} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="salesBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor={SALES} />
                      </linearGradient>
                      <linearGradient id="purchaseBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fdba74" />
                        <stop offset="100%" stopColor={PURCHASE} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(v) => String(v).slice(0, 2)} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
                    <YAxis tickFormatter={compact} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={46} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text)' }} />
                    <Area type="monotone" dataKey="sales" name="Sales trend" fill="url(#salesFill)" stroke="none" legendType="none" tooltipType="none" />
                    <Bar dataKey="sales" name="Sales" fill="url(#salesBar)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                    <Bar dataKey="purchase" name="Purchase" fill="url(#purchaseBar)" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mst-card">
              <div className="mst-card-h">Month Mix — {data.label}</div>
              <div className="mst-card-b st-chart-body">
                {pieTotal <= 0 ? (
                  <div className="mst-empty">No sales, purchase, or expense in this month.</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={92}
                          paddingAngle={3}
                          activeIndex={pieIndex}
                          activeShape={ActiveSlice}
                          onMouseEnter={(_, i) => setPieIndex(i)}
                        >
                          {pieData.map((s) => <Cell key={s.name} fill={s.color} stroke="var(--color-bg-surface)" strokeWidth={2} />)}
                        </Pie>
                        <Tooltip content={<PieTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="st-pie-legend">
                      {pieData.map((s) => (
                        <div key={s.name} className="st-pie-leg">
                          <i style={{ background: s.color }} />
                          <span>{s.name}</span>
                          <b>₹ {n(s.value)}</b>
                          <em>{((s.value / pieTotal) * 100).toFixed(1)}%</em>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsDashboardPage;
