import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getOrderDetails } from "../utils/services/Order.services";
import { handleApiError } from "../hooks/handleApiError";

type Ticket = {
  order_id: number;
  receipt: string;
  created_at: string;
  payment_mode: string;
  grand_total: string;
  total_no?: number;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

const parseCreatedAt = (value?: string): { date: string; time: string } => {
  if (!value || typeof value !== "string") return { date: "-", time: "-" };
  const parts = value.split(" - ");
  if (parts.length !== 2) return { date: "-", time: "-" };
  const [datePart, timePart] = parts;
  const [dayStr, monStr, yearStr] = datePart.split(" ");
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const day = parseInt(dayStr, 10);
  const month = monthMap[monStr as keyof typeof monthMap];
  const year = parseInt(yearStr, 10);
  if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) {
    return { date: "-", time: "-" };
  }
  const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) return { date: "-", time: "-" };
  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  const d = new Date(year, month, day, hours, minutes, 0, 0);
  if (Number.isNaN(d.getTime())) return { date: "-", time: "-" };
  const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return { date, time };
};

const TicketDetailsModal: React.FC<Props> = ({ isOpen, onClose, ticket }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);

  const parsed = useMemo(() => parseCreatedAt(ticket?.created_at), [ticket?.created_at]);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !ticket?.order_id) return;
      setLoading(true);
      try {
        const resp = await getOrderDetails(ticket.order_id);
        // Expecting resp?.data?.result?.items (adjust to your API shape)
        const rows = (resp as any)?.data?.result?.items || [];
        setItems(Array.isArray(rows) ? rows : []);
      } catch (e) {
        handleApiError(e, "Failed to load order details");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, ticket?.order_id]);

  if (!isOpen || !ticket) return null;

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Ticket Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#1D1F27] p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Receipt</div>
            <div className="text-white font-medium">{ticket.receipt}</div>
          </div>
          <div className="bg-[#1D1F27] p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Order ID</div>
            <div className="text-white font-medium">{ticket.order_id}</div>
          </div>
          <div className="bg-[#1D1F27] p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Date</div>
            <div className="text-white font-medium">{parsed.date}</div>
          </div>
          <div className="bg-[#1D1F27] p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Time</div>
            <div className="text-white font-medium">{parsed.time}</div>
          </div>
          <div className="bg-[#1D1F27] p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Payment</div>
            <div className="text-white font-medium capitalize">{ticket.payment_mode || '-'}</div>
          </div>
          <div className="bg-[#1D1F27] p-3 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Grand Total</div>
            <div className="text-[#EDB726] font-semibold">₹{ticket.grand_total}</div>
          </div>
        </div>

        <div className="mb-2 text-gray-300 font-semibold">Items</div>
        <div className="bg-[#1D1F27] rounded border border-gray-600 overflow-hidden">
          {loading ? (
            <div className="p-4 text-gray-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-gray-400">No items found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#2A2D36] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="px-3 py-2 text-left">Lottery</th>
                  <th className="px-3 py-2 text-left">Digits</th>
                  <th className="px-3 py-2 text-left">Bet Amount</th>
                  <th className="px-3 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {items.map((row: any, idx: number) => {
                  const abv = row?.abbreviation || row?.lottery_abv || '-';
                  const number = row?.lottery_number ?? row?.number ?? '-';
                  const digits = String(number).length || '-';
                  const bet = parseFloat(row?.bet_amount ?? row?.amount ?? '0') || 0;
                  const total = bet; // Adjust if a different calc is needed
                  return (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-white">{abv}</td>
                      <td className="px-3 py-2 text-white">{digits}</td>
                      <td className="px-3 py-2 text-white">₹{bet.toFixed(2)}</td>
                      <td className="px-3 py-2 text-white">₹{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end mt-4 gap-2">
         
          <button onClick={onClose} className="px-4 py-2 bg-[#EDB726] text-[#1D1F27] rounded hover:bg-[#d4a422]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;


