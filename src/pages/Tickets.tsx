import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Search, Eye, Download } from "lucide-react";
import { useSelector } from "react-redux";
import { getDailyLotteryTickets } from "../utils/services/Order.services";
import { handleApiError } from "../hooks/handleApiError";
import { formatDate } from "../hooks/dateFormatter";
import TicketDetailsModal from "./TicketDetailsModal";

const Tickets: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lotteryTickets, setLotteryTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const userData = useSelector((state: any) => state.user.userData);
  const todaysDate = new Date();
  const formattedTodaysDate = formatDate(todaysDate.toISOString());

  const fetchLotteryRecords = useCallback(async () => {
    if (!userData?.id) return;
    setLoading(true);
    try {
      const response = await getDailyLotteryTickets(
        userData.id,
        formattedTodaysDate
      );
      if (response?.data?.result && response?.status === 200) {
        setLotteryTickets(response.data.result);
      } else {
        setLotteryTickets([]);
      }
    } catch (error: unknown) {
      handleApiError(error, "Failed to fetch tickets.");
      setLotteryTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userData?.id, formattedTodaysDate]);

  useEffect(() => {
    fetchLotteryRecords();
  }, [fetchLotteryRecords]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "winner":
        return "bg-[#EDB726]/20 text-[#EDB726] border-[#EDB726]/30";
      case "expired":
      case "pending":
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredTickets = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return lotteryTickets
      .filter((ticket) => {
        const receiptText = String(ticket?.receipt ?? "").toLowerCase();
        return term === "" ? true : receiptText.includes(term);
      })
      .filter((ticket) => (selectedTab === "all" ? true : ticket?.status === selectedTab));
  }, [lotteryTickets, searchTerm, selectedTab]);

  const totalTicketsCount = lotteryTickets.length;
  const activeTicketsCount = lotteryTickets.filter(
    (ticket) => ticket.status === "active"
  ).length;
  const winningTicketsCount = lotteryTickets.filter(
    (ticket) => ticket.status === "winner"
  ).length;
  const totalRevenue = lotteryTickets.reduce(
    (sum, ticket) => sum + (parseFloat(ticket.grand_total) || 0),
    0
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const openDetails = (ticket: any) => {
    setSelectedTicket(ticket);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedTicket(null);
  };

  const ensureScript = (id: string, src: string) => new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement('script');
    s.id = id; s.src = src; s.onload = () => resolve(); s.onerror = reject;
    document.body.appendChild(s);
  });

  const downloadTicketPdf = async (ticket: any) => {
    try {
      // Optional: fetch order details for items (skip if not needed)
      // const resp = await getOrderDetails(ticket.order_id);
      // const items = (resp as any)?.data?.result?.items || [];
      const items: any[] = [];

      const rows = items
        .map((row: any) => {
          const abv = row?.abbreviation || row?.lottery_abv || '-';
          const number = row?.lottery_number ?? row?.number ?? '-';
          const digits = String(number).length || '-';
          const bet = parseFloat(row?.bet_amount ?? row?.amount ?? '0') || 0;
          const total = bet;
          return `<tr>
            <td>${abv}</td>
            <td style=\"text-align:center\">${digits}</td>
            <td style=\"text-align:right\">₹${bet.toFixed(2)}</td>
            <td style=\"text-align:right\">₹${total.toFixed(2)}</td>
          </tr>`;
        })
        .join("");

      const createdAt: string | undefined = ticket?.created_at;
      const parts = createdAt ? createdAt.split(" - ") : [];
      const dateDisp = parts.length === 2 ? parts[0] : "-";
      const timeDisp = parts.length === 2 ? parts[1] : "-";

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '72mm';
      container.innerHTML = `
        <div style="font-family: 'Courier New', monospace; color:#000; width:72mm; padding:6mm;">
          <div style='text-align:center;font-size:18px;font-weight:700;'>WEGA DI NUMBER</div>
          <div style='text-align:center;font-size:14px;'>LOTTERY TICKET</div>
          <div style='border-top:1px dashed #000; margin:6px 0;'></div>
          <div style='display:flex;justify-content:space-between;font-size:12px;'><div>Receipt</div><div style='font-weight:700;'>${ticket.receipt}</div></div>
          <div style='display:flex;justify-content:space-between;font-size:12px;'><div>Order ID</div><div>${ticket.order_id}</div></div>
          <div style='display:flex;justify-content:space-between;font-size:12px;'><div>Date</div><div>${dateDisp}</div></div>
          <div style='display:flex;justify-content:space-between;font-size:12px;'><div>Time</div><div>${timeDisp}</div></div>
          <div style='display:flex;justify-content:space-between;font-size:12px;'><div>Payment</div><div style='font-weight:700;'>${ticket.payment_mode || '-'}</div></div>
          <div style='border-top:1px dashed #000; margin:6px 0;'></div>
          <table style='width:100%;border-collapse:collapse;'>
            <thead>
              <tr>
                <th style='text-align:left;font-size:12px;border-bottom:1px solid #000;'>LOT</th>
                <th style='text-align:center;font-size:12px;border-bottom:1px solid #000;'>DIG</th>
                <th style='text-align:right;font-size:12px;border-bottom:1px solid #000;'>BET</th>
                <th style='text-align:right;font-size:12px;border-bottom:1px solid #000;'>TOTAL</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan='4' style='padding:8px 0;text-align:center;'>No items</td></tr>`}</tbody>
            <tfoot>
              <tr>
                <td colspan='3' style='padding-top:6px;border-top:1px solid #000;font-weight:700;'>GRAND TOTAL</td>
                <td style='padding-top:6px;border-top:1px solid #000;text-align:right;font-weight:700;'>₹${ticket.grand_total}</td>
              </tr>
            </tfoot>
          </table>
          <div style='border-top:1px dashed #000; margin:6px 0;'></div>
          <div style='text-align:center;font-size:12px;'>Keep this ticket safe.</div>
          <div style='text-align:center;font-size:12px;'>Good luck!</div>
          <div style='text-align:center;font-size:10px;color:#555;margin-top:6px;'>- - - - - - - - - - - - - - - - - - -</div>
        </div>
      `;
      document.body.appendChild(container);

      await ensureScript('html2canvas-cdn', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await ensureScript('jspdf-cdn', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      // @ts-ignore
      const html2canvas = (window as any).html2canvas;
      // @ts-ignore
      const { jsPDF } = (window as any).jspdf;
      const node = container.firstElementChild as HTMLElement;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, canvas.height * 80 / canvas.width] });
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Ticket_${ticket.receipt}.pdf`);
      document.body.removeChild(container);
    } catch (e) {
      handleApiError(e, 'Failed to generate PDF');
    }
  };

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header
          isMenuOpen={isMenuOpen}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                Ticket Management
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">
                View and manage all lottery tickets
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Total Tickets</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {totalTicketsCount}
                </p>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Active Tickets</p>
                <p className="text-lg sm:text-2xl font-bold text-green-400">
                  {activeTicketsCount}
                </p>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Winning Tickets</p>
                <p className="text-lg sm:text-2xl font-bold text-[#EDB726]">
                  {winningTicketsCount}
                </p>
              </div>
              <div className="bg-[#2A2D36] rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400">Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-white">
                  ₹{totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-[#2A2D36] rounded-lg p-4 sm:p-6 border border-gray-700 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex space-x-1 flex-wrap sm:flex-nowrap">
                  {["all", "active", "winner", "pending", "cancelled"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-[10px] sm:text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedTab === tab
                            ? "bg-[#EDB726] text-[#1D1F27]"
                            : "text-gray-400 hover:text-white cursor-pointer"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    )
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1D1F27] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-400">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-gray-400">
                  No tickets found for selected criteria.
                </p>
              </div>
            ) : (
              <div className="bg-[#2A2D36] rounded-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#1D1F27] text-gray-400 uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">Ticket</th>
                        <th className="px-3 py-2 text-left">Order</th>
                        <th className="px-3 py-2 text-left">Purchase Details</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredTickets.map((ticket) => {
                        const createdAt: string | undefined = ticket?.created_at;

                        const parseCreatedAt = (value?: string): Date | null => {
                          if (!value || typeof value !== "string") return null;
                          // Expected: "16 Sep 2025 - 05:47 AM"
                          const parts = value.split(" - ");
                          if (parts.length !== 2) return null;
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
                            return null;
                          }
                          // timePart: "05:47 AM"
                          const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                          if (!timeMatch) return null;
                          let hours = parseInt(timeMatch[1], 10);
                          const minutes = parseInt(timeMatch[2], 10);
                          const ampm = timeMatch[3].toUpperCase();
                          if (ampm === "PM" && hours < 12) hours += 12;
                          if (ampm === "AM" && hours === 12) hours = 0;
                          const d = new Date(year, month, day, hours, minutes, 0, 0);
                          return Number.isNaN(d.getTime()) ? null : d;
                        };

                        const dateObj = parseCreatedAt(createdAt);
                        const isValidDate = !!dateObj;
                        const dateStr = isValidDate ? formatDate((dateObj as Date).toISOString()) : "-";
                        const timeStr = isValidDate
                          ? (dateObj as Date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "-";
                        const statusText = String(ticket?.status || "-");
                        return (
                          <tr
                            key={ticket.receipt}
                            className="hover:bg-[#3A3D46] transition-colors"
                          >
                            <td className="px-3 py-2">
                              <div className="text-white font-medium">Ticket #{ticket.receipt}</div>
                              <div className="text-gray-400 text-xs">Receipt: {ticket.receipt}</div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-white">Order ID: {ticket.order_id}</div>
                              <div className="text-gray-400 text-xs capitalize">Payment: {String(ticket.payment_mode || "-")}</div>
                              <div className="text-gray-400 text-xs">Total Numbers: {ticket.total_no ?? '-'}</div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="text-white">{dateStr}</div>
                              <div className="text-gray-400 text-xs">{timeStr}</div>
                              <div className="text-[#EDB726] font-medium">
                                ₹{ticket.grand_total}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                  ticket?.status || ""
                                )}`}
                              >
                                {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="inline-flex items-center gap-3">
                                <button
                                  onClick={() => openDetails(ticket)}
                                  className="text-[#EDB726] hover:text-[#d4a422]"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => downloadTicketPdf(ticket)}
                                  className="text-[#EDB726] hover:text-[#d4a422]"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <TicketDetailsModal isOpen={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />
    </div>
  );
};

export default Tickets;

// Mount modal at end so it's not clipped by table container
// eslint-disable-next-line
// @ts-ignore
// Render modal using selectedTicket state
// Note: Keeping here to avoid altering main layout structure
// The modal is conditionally rendered above via component import

