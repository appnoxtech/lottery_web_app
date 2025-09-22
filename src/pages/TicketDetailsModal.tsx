import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { getOrderDetails } from "../utils/services/Order.services";
import { handleApiError } from "../hooks/handleApiError";
import { dollarConversion, euroConversion } from "../hooks/utilityFn";

type Ticket = {
  order_id: number;
  receipt: string;
  created_at: string;
  payment_mode: string;
  grand_total: string;
  total_no?: number;
  status: string;
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
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, time };
};

const TicketDetailsModal: React.FC<Props> = ({ isOpen, onClose, ticket }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<any>>([]);

  const parsed = useMemo(() => parseCreatedAt(ticket?.created_at), [ticket?.created_at]);
  // const totalBetAmount = useMemo(() => {
  //   return items.reduce((sum, item) => sum + (parseFloat(item.bet_amount) || 0), 0);
  // }, [items]);

  useEffect(() => {
    const load = async () => {
      if (!isOpen || !ticket?.order_id) return;
      setLoading(true);
      try {
        const resp = await getOrderDetails(ticket.order_id);
        const rows = (resp as any)?.data?.result?.details || [];
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
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-lg sm:max-w-2xl text-black overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-gray-300">
            <h3 className="text-xl font-semibold"></h3>
            <button onClick={onClose} className="text-gray-600 hover:text-black">
              <X className="w-6 h-6 cursor-pointer" />
            </button>
          </div>

          {/* Yellow Receipt Title */}
          <p className="text-center uppercase text-gray-500 text-4xl mt-1 font-bold">Lottery Receipt</p>
          <div className="border-t border-solid border-gray-400 my-2"></div>

          {/* Ticket Details */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4 text-md text-center">
              <div>
                <p className="text-black-300">Receipt# CW - <span className="text-black font-semibold">{ticket.receipt}</span></p>
              </div>
              <div>
                <p className="text-black-300">Date: <span className="font-bold">{parsed.date} - {parsed.time}</span></p>
              </div>
              <div>
                <p className="text-gray-500 font-bold">
                  Status :{" "}
                  <span
                    className={`text-lg capitalize ${ticket.status === "completed" ? "text-green-500" : "text-red-500"
                      }`}
                  >
                    {ticket.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 mb-6">
            <div className="border border-gray-300 rounded overflow-hidden">
              <table className="w-full text-lg">
                <thead className="bg-[#EDB726] text-black uppercase text-lg">
                  <tr>
                    <th className="px-3 py-2 text-center">P Mode</th>
                    <th className="px-3 py-2 text-center">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-3 py-2 text-center">{ticket.payment_mode}</td>
                    <td className="px-3 py-2 text-center">XCG {ticket.grand_total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>



          {/* Items Table */}
          <div className="px-6 mb-6">
            {/* <p className="text-gray-700 font-semibold mb-2 text-lg">Ticket Items</p> */}
            <div className="border border-gray-300 rounded overflow-hidden">
              {loading ? (
                <div className="p-4 text-gray-500 text-center text-lg">Loading...</div>
              ) : items.length === 0 ? (
                <div className="p-4 text-gray-500 text-center text-lg">No items found.</div>
              ) : (
                <table className="w-full text-lg">
                  <thead className="bg-[#EDB726] text-black uppercase text-lg">
                    <tr>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-center">Digits</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {items.map((item, idx) => {
                      const number = item.lottery_number ?? "-";
                      const abbreviation = item.abbreviation[0] || "-";
                      const bet = parseFloat(item.bet_amount) || 0;
                      return (
                        <tr key={idx}>
                          <td className="px-3 py-2">
                            <p className=" text-red-600">{abbreviation}</p>
                            <p className="text-lg font-semibold">{number}</p>
                          </td>
                          <td className="px-3 py-2 text-center">{String(number).length} digits</td>
                          <td className="px-3 py-2 text-right">
                            XCG {bet.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>

                    <tr className="border-t border-gray-400">
                      <td colSpan={2} className="px-3 py-2">
                        Total Numbers:
                      </td>
                      <td className="px-3 py-2 text-right">{ticket.total_no}</td>
                    </tr>
                    <tr className="border-t border-gray-400">
                      <td colSpan={2} className="px-3 py-2">
                        Sub Total: 
                      </td>
                      <td className="px-3 py-2 text-right">XCG {ticket.grand_total}</td>
                    </tr>
                    <tr className="border-t border-gray-400 font-bold">
                      <td colSpan={2} className="px-3 py-2">
                        Grand Total:
                      </td>
                      <td className="px-3 py-2 text-right">
                        XCG {ticket.grand_total}
                        <div className=" text-sm">
                           (${dollarConversion(Number(ticket.grand_total))} / €{euroConversion(Number(ticket.grand_total))})
                        </div>
                        <div className="text-gray-500 text-sm">
                          
                        </div>
                      </td>
                    </tr>

                  </tfoot>
                </table>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center px-6 pb-6">
            <p className="text-black text-md mt-1">
              Korda kontrola bo numbernan ‼️</p>
            <p className="text-black text-md">Despues di wega NO ta asepta reklamo ‼️</p>
            <p className="text-black text-md">Tur number ta wordu skibi ekivalente na Florin ‼️</p>
            <p className="text-black text-md">Pa bo por kobra premio, bo numbernan mester ta mark "Completed".</p>
            <p className="text-black text-md">Suerte paki ratu. 🍀🇳🇬💶💰</p>
            <div className="border-t border-dashed border-gray-400 my-2"></div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end px-6 pb-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#EDB726] text-black rounded-lg hover:bg-[#d4a422] font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
