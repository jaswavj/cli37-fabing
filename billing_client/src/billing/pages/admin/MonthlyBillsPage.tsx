import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { billingApi } from '../../../api/billing/billing-api-service';
import { routerPathNames } from '../../../routes/routerPathNames';
import { useBillDetail } from '../account-reports/BillDetailModal';
import '../master/Master.css';
import './MonthlyBills.css';

type Card = {
  billId: number;
  billDisplay: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  payable: number;
  paymentMode: number;
  isTaxBill: number;
  stateLabel: string;
};

const monthValue = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d: string) => {
  const dt = new Date(`${d}T00:00:00`);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtTime = (t: string) => {
  const parts = String(t || '').split(':');
  if (parts.length < 2) return t || '';
  let h = Number(parts[0]);
  if (!Number.isFinite(h)) return t;
  const m = parts[1];
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const payLabel = (mode: number) => (mode === 2 ? 'Bank' : mode === 3 ? 'Mixed' : 'Cash');

const MonthlyBillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { openBill, billModal } = useBillDetail();
  const [month, setMonth] = useState(monthValue());
  const [rows, setRows] = useState<Card[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async (value = month) => {
    const [y, m] = value.split('-').map(Number);
    if (!y || !m) return;
    setLoading(true);
    try {
      const res: any = await billingApi.monthBills(y, m);
      if (!res?.success) throw new Error(res?.data?.error || 'Could not load bills');
      setRows(res.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.data?.error || err?.message || 'Could not load bills');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const printBill = async (billNo: string) => {
    try {
      const res: any = await billingApi.dispatchPrint(billNo);
      const data = res?.data || {};
      if (!res?.success) {
        toast.error(data.error || 'Print failed');
        return;
      }
      if (data.type === 'printed') toast.success(data.message || 'Receipt printed');
      else if (data.type === 'txt') toast.warn(data.message || 'Saved as TXT');
      else if (data.type === 'a4') navigate(`/app/billing/print/${encodeURIComponent(billNo)}`);
      else toast.error('Print did not run. Check printer in Company Details.');
    } catch (err: any) {
      toast.error(err?.response?.data?.data?.error || 'Print failed');
    }
  };

  const whatsApp = (card: Card) => {
    const digits = (card.customerPhone || '').replace(/\D/g, '');
    if (digits.length < 10) {
      toast.error('Customer phone is missing');
      return;
    }
    const phone = digits.length === 10 ? `91${digits}` : digits;
    const text = encodeURIComponent(
      `Sales Invoice #${card.billDisplay}\n${card.customerName || 'Customer'}\nAmount: ${inr(card.payable)}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="mst-page mb-page">
      <h2 className="mst-title"><i className="fas fa-file-invoice" /> Monthly Bills</h2>
      <div className="mst-card" style={{ marginBottom: 14 }}>
        <div className="mst-card-b mst-form">
          <div className="mst-fg">
            <label>Month</label>
            <input className="mst-inp" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="mst-actions">
            <button className="mst-btn mst-btn-primary" type="button" disabled={loading} onClick={() => load()}>
              {loading ? 'Loading…' : 'Show Bills'}
            </button>
          </div>
        </div>
      </div>

      {rows && (
        <div className="mb-cards">
          {rows.length === 0 && <div className="mst-empty">No bills in this month.</div>}
          {rows.map((card) => (
            <article className="mb-card" key={card.billId}>
              <div className="mb-card-body">
                <div>
                  <h3 className="mb-name">{card.customerName || 'Walk-in'}</h3>
                  <p className="mb-invoice">Sales Invoice #{card.billDisplay}</p>
                  <p className="mb-meta">
                    {fmtDate(card.date)} · {fmtTime(card.time)}
                    {card.customerPhone ? ` · ${card.customerPhone}` : ''}
                  </p>
                  <div className="mb-chips">
                    <span className="mb-chip">{payLabel(card.paymentMode)}</span>
                    {card.isTaxBill === 1 && <span className="mb-chip">GST</span>}
                    {card.stateLabel && <span className="mb-chip">{card.stateLabel}</span>}
                  </div>
                </div>
                <div className="mb-amt">{inr(card.payable)}</div>
              </div>
              <div className="mb-actions">
                <button className="mb-act" type="button" onClick={() => openBill(card.billDisplay)}>
                  <i className="fas fa-eye" /> View
                </button>
                <button
                  className="mb-act"
                  type="button"
                  onClick={() => navigate(`${routerPathNames.billing}?edit=${encodeURIComponent(card.billDisplay)}`)}
                >
                  <i className="fas fa-edit" /> Edit
                </button>
                <button className="mb-act mb-act-print" type="button" onClick={() => printBill(card.billDisplay)}>
                  <i className="fas fa-print" /> Print
                </button>
                <button className="mb-act mb-act-wa" type="button" onClick={() => whatsApp(card)}>
                  <i className="fab fa-whatsapp" /> WhatsApp
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {billModal}
    </div>
  );
};

export default MonthlyBillsPage;
