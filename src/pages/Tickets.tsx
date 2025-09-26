import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { Search, Eye, Download, Repeat, CreditCard, CalendarDays, ChevronLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { getDailyLotteryTickets, getOrderDetails, getOrderHistory } from "../utils/services/Order.services";
import { handleApiError } from "../hooks/handleApiError";
import { formatDate } from "../hooks/dateFormatter";
import { dollarConversion, euroConversion } from "../hooks/utilityFn";
import TicketDetailsModal from "./TicketDetailsModal";
import { useNavigate } from "react-router-dom";
import StripeCheckout from "./StripeCheckout";
import PaymentMethodModal from "./PaymentMethodModal";
import WhatsAppModal from "./WhatsAppModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const Tickets: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lotteryTickets, setLotteryTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethodOpen, setPaymentMethodOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [showAllView, setShowAllView] = useState(false);
  const [selectedPaymentTicket, setSelectedPaymentTicket] = useState<any | null>(null);
  const userData = useSelector((state: any) => state.user.userData);
  const todaysDate = dayjs().local();
  const formattedTodaysDate = formatDate(todaysDate.toISOString());
  const navigate = useNavigate();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentTicket, setPaymentTicket] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const parseCreatedAt = (value?: string): Date | null => {
  if (!value || typeof value !== "string") return null;
  // Try parsing as ISO string first
  const date = dayjs.utc(value).local();
  if (date.isValid()) return date.toDate();
  // If invalid as ISO, try parsing as YYYY-MM-DD
  const simpleDate = dayjs(value, "YYYY-MM-DD", true);
  if (simpleDate.isValid()) return simpleDate.toDate();
  return null;
};

  const openPayment = async (ticket: any) => {
    const resp = await getOrderDetails(ticket.order_id);
    const items = resp?.data?.result?.details ?? [];
    const orderInfo = {
      order_id: ticket.order_id,
      total_price: ticket.grand_total,
      local_total: ticket.grand_total,
      ticket_numbers: items.map((i: any) => i.lottery_number ?? 0),
      selected_lotteries: items.map((i: any) => i.abbreviation[0] ?? "-"),
    };
    setSelectedPaymentTicket(orderInfo);
    setPaymentMethodOpen(true);
  };

  const handlePaymentMethodSelect = (method: "stripe" | "whatsapp") => {
    if (!selectedPaymentTicket) return;
    setPaymentMethodOpen(false);
    if (method === "stripe") {
      setPaymentTicket({
        ...selectedPaymentTicket,
        grand_total: selectedPaymentTicket.local_total,
      });
      setPaymentOpen(true);
    } else if (method === "whatsapp") {
      setWhatsAppOpen(true);
    }
  };

  const closeWhatsApp = () => {
    setWhatsAppOpen(false);
    setSelectedPaymentTicket(null);
  };

  const closePayment = (success: boolean) => {
    setPaymentOpen(false);
    setPaymentTicket(null);
    if (success) fetchLotteryRecords();
  };

const fetchLotteryRecords = useCallback(async () => {
  if (!userData?.id) return;
  setLoading(true);
  try {
    if (selectedTab === "today") {
      const response = await getDailyLotteryTickets(userData.id, formattedTodaysDate);
      if (response?.data?.result && response?.status === 200) {
        console.log("Today Tickets:", response.data.result);
        setLotteryTickets(
          response.data.result.map((ticket: any) => ({
            ...ticket,
            payment_mode: ticket.payment_mode || "-",
            total_no: ticket.total_no || 0,
            grand_total: ticket.grand_total || 0,
            created_at: ticket.created_at, // Already in ISO format
          }))
        );
      } else {
        setLotteryTickets([]);
      }
    } else {
      const histResponse = await getOrderHistory("");
      if (histResponse?.data?.success) {
        const orders = histResponse.data.result;
        const detailedPromises = orders.map((ord: { order: number; date: string; receipt: string }) => 
          getOrderDetails(ord.order).then(resp => ({
            ...resp?.data?.result,
            order_id: ord.order,
            receipt: ord.receipt,
            created_at: ord.date, // Map API's date to created_at
          }))
        );
        const detailsResponses = await Promise.all(detailedPromises);
        const tickets = detailsResponses.filter((result): result is NonNullable<typeof result> => result !== null);
        setLotteryTickets(tickets);
      } else {
        setLotteryTickets([]);
      }
    }
  } catch (error: unknown) {
    handleApiError(error, "Failed to fetch tickets.");
    setLotteryTickets([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [userData?.id, selectedTab, formattedTodaysDate]);

  useEffect(() => {
    fetchLotteryRecords();
  }, [fetchLotteryRecords, selectedTab]);

  const filteredTickets = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return lotteryTickets
      .filter((ticket) => {
        const receiptText = String(ticket?.receipt ?? "").toLowerCase();
        const createdAt = ticket?.created_at;
        const dateObj = parseCreatedAt(createdAt);
        if (!dateObj && createdAt) {
          console.log("Invalid created_at:", createdAt); // Debug invalid dates
        }
        const ticketDate = dateObj ? formatDate(dateObj.toISOString()) : "";
        const isDateSearch = term === ticketDate;
        return term === "" ? true : isDateSearch || receiptText.includes(term);
      })
      .filter((ticket) => {
        if (selectedTab === "all") return true;
        if (selectedTab === "today") {
          const createdAt = ticket?.created_at;
          const dateObj = parseCreatedAt(createdAt);
          if (!dateObj) return false;
          const ticketDate = formatDate(dateObj.toISOString());
          console.log("Ticket Date:", ticketDate, "Formatted Today's Date:", formattedTodaysDate);
          return ticketDate === formattedTodaysDate;
        }
        return ticket?.status === selectedTab;
      });
  }, [lotteryTickets, searchTerm, selectedTab, formattedTodaysDate]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const parseCreatedAtForPdf = (value?: string): { date: string; time: string } => {
    if (!value || typeof value !== "string") return { date: "-", time: "-" };
    const date = dayjs.utc(value).local();
    if (!date.isValid()) return { date: "-", time: "-" };
    return {
      date: date.format("YYYY-MM-DD"),
      time: date.format("hh:mm A"),
    };
  };

  const downloadTicketPdf = async (ticket: any) => {
    try {
      const resp = await getOrderDetails(ticket.order_id);
      const items = (resp as any)?.data?.result?.details || [];
      const parsed = parseCreatedAtForPdf(ticket?.created_at);

      const rows = items.length > 0 ? items
        .map((item: any) => {
          const number = item.lottery_number ?? "-";
          const abbreviation = Array.isArray(item.abbreviation) ? item.abbreviation.join(", ") : item.abbreviation || "-";
          const bet = parseFloat(item.bet_amount) || 0;
          return `
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 6px;">
              <p style="color: #DC2626; margin: 0;">${abbreviation}</p>
              <p style="font-weight: 600; margin: 0; font-size: 14px;">${number}</p>
            </td>
            <td style="padding: 6px; text-align: center; color: #000; font-size: 14px;">${String(number).length} digit</td>
            <td style="padding: 6px; text-align: right; color: #000; font-weight: 400; font-size: 14px;">XCG ${bet.toFixed(2)}</td>
          </tr>`;
        })
        .join("") : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #6B7280; font-size: 14px;">No items found.</td></tr>`;

      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '148mm';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '0';
      container.style.overflow = 'visible';
      container.innerHTML = `
      <div style="font-family: Arial, sans-serif; color: #000; width: 148mm; padding: 5mm; border: 2px solid #D1D5DB">
        <div style="text-align: center; margin-bottom:4px;padding-bottom:10px">
          <p style="color: #6B7280; font-size: 24px; font-weight: bold; text-transform: uppercase; margin: 4px 0;">Lottery Numbers</p>
        </div>
        <div style="border-top: 1px solid #D1D5DB; margin: 6px 2px;"></div>
        <div style="padding: 0 16px; margin-bottom: 10px">
          <div style="display: grid; grid-template-columns: 1fr; gap: 8px; text-align: center; font-size: 14px;">
            <div>
              <p style="color: #000; margin: 0;">Receipt# CW - <span style="font-weight: 600;">${ticket.receipt}</span></p>
            </div>
            <div>
              <p style="color: #000; margin: 0;">Date: <span style="font-weight: 600;">${parsed.date} - ${parsed.time}</span></p>
            </div>
            <div>
              <p style="color: #6B7280; font-weight: 600; margin: 0;">
                Status: <span style="font-size: 16px; text-transform: capitalize; color: ${ticket.status === "completed" ? "#22C55E" : "#EF4444"}">${ticket.status}</span>
              </p>
            </div>
          </div>
        </div>
        <div style="padding: 0 16px; margin-bottom: 12px;">
          <div style="border: 1px solid #D1D5DB; border-radius: 6px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead style="background-color: #EDB726; color: #000; text-transform: uppercase;">
                <tr>
                  <th style="padding: 6px; text-align: center;">P Mode</th>
                  <th style="padding: 6px; text-align: center;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 6px; text-align: center; color: #000;">${ticket.payment_mode}</td>
                  <td style="padding: 6px; text-align: center; color: #000;">XCG ${ticket.grand_total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style="padding: 0 16px; margin-bottom: 12px;">
          <div style="border: 1px solid #D1D5DB; border-radius: 6px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead style="background-color: #EDB726; color: #000; text-transform: uppercase;">
                <tr>
                  <th style="padding: 6px; text-align: left;">Name</th>
                  <th style="padding: 6px; text-align: center;">Digits</th>
                  <th style="padding: 6px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
              <tfoot>
                <tr style="border-top: 1px solid #9CA3AF; font-weight: 400;">
                  <td colspan="2" style="padding: 6px; text-align: left; color: #000;">Total Numbers:</td>
                  <td style="padding: 6px; text-align: right; color: #000;">${ticket.total_no}</td>
                </tr>
                <tr style="border-top: 1px solid #9CA3AF; font-weight: 400;">
                  <td colspan="2" style="padding: 6px; text-align: left; color: #000;">Sub Total:</td>
                  <td style="padding: 6px; text-align: right; color: #000;">XCG ${ticket.grand_total}</td>
                </tr>
                <tr style="border-top: 1px solid #9CA3AF; font-weight: 700;">
                  <td colspan="2" style="padding: 6px; text-align: left;">Grand Total:</td>
                  <td style="padding: 6px; text-align: right;">
                    XCG ${ticket.grand_total}
                    <div style="color: #000; font-size: 12px; font-weight: bold;">
                      ($${dollarConversion(Number(ticket.grand_total))} / €${euroConversion(Number(ticket.grand_total))})
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div style="text-align: center; padding: 0 16px; padding-bottom: 12px; font-size: 12px;">
          <p style="color: #000; margin: 2px 0;">Korda kontrola bo numbernan ‼️</p>
          <p style="color: #000; margin: 2px 0;">Despues di wega NO ta asepta reklamo ‼️</p>
          <p style="color: #000; margin: 2px 0;">Tur number ta wordu skibi ekivalente na Florin ‼️</p>
          <p style="color: #000; margin: 2px 0;">Pa bo por kobra premio, bo numbernan mester ta mark "Completed".</p>
          <p style="color: #000; margin: 2px 0;">Suerte paki ratu. 🍀🇳🇬💶💰</p>
        </div>
      </div>
    `;
      document.body.appendChild(container);

      await ensureScript('html2canvas-cdn', 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await ensureScript('jspdf-cdn', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      const html2canvas = (window as any).html2canvas;
      const { jsPDF } = (window as any).jspdf;

      const node = container.firstElementChild as HTMLElement;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: '#ffffff',
        windowWidth: 148 * 3.78,
        windowHeight: node.scrollHeight * 2,
        scrollX: 0,
        scrollY: 0,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pdfWidth = 148;
      const pdfPageHeight = 210;
      const margin = 10;
      const usablePageHeight = pdfPageHeight - 2 * margin;
      const canvasHeight = canvas.height * (pdfWidth / canvas.width);

      if (canvasHeight <= usablePageHeight) {
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin,
          pdfWidth - 2 * margin,
          canvasHeight,
          undefined,
          'FAST'
        );
      } else {
        let position = 0;
        while (position < canvasHeight) {
          if (position > 0) {
            pdf.addPage();
          }
          const sliceHeight = Math.min(usablePageHeight, canvasHeight - position);
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            margin - position,
            pdfWidth - 2 * margin,
            sliceHeight,
            undefined,
            'FAST'
          );
          position += usablePageHeight;
        }
      }

      pdf.save(`Ticket_${ticket.receipt}.pdf`);
      document.body.removeChild(container);
    } catch (e) {
      handleApiError(e, 'Failed to generate PDF');
    }
  };

  const reuseTicketNumbers = (ticket: any) => {
    navigate(`/new-lottery?orderId=${ticket.order_id}`);
  };

  return (
    <div className="h-screen bg-[#1D1F27] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        {!(isMobile && showAllView) && (
          <Header
            isMenuOpen={isMenuOpen}
            onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          />
        )}
        <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto mb-20 sm:mb-0">
          <div className="max-w-7xl mx-auto">
            {selectedTab === "all" && (
              <div className="lg:hidden mb-4">
                {isMobile && (
                  <button
                    onClick={() => {
                      setSelectedTab("today");
                      setShowAllView(false);
                    }}
                    className="flex items-center text-white hover:text-yellow-600 transition-colors text-sm sm:text-base"
                    aria-label="Back to today"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Tickets
                  </button>
                )}
                <div className="flex flex-col justify-between px-3 py-2">
                  <p className="text-sm mb-1">Select Your lottery</p>
                  <div className="flex items-center border border-1 border-[#EDB726] rounded w-full py-2 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tickets..."
                      className="bg-[#1D1F27] border-r px-2 py-1 text-white placeholder-gray-400 focus:outline-none text-xs w-full max-w-xxl"
                    />
                    <CalendarDays
                      className="ml-3 mr-2 cursor-pointer"
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    />
                    {isDatePickerOpen && (
                      <div className="absolute top-12 left-0 z-50">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date: Date | null) => {
                            setSelectedDate(date);
                            setIsDatePickerOpen(false);
                            if (date) {
                              const formattedDate = formatDate(date.toISOString());
                              setSearchTerm(formattedDate);
                            } else {
                              setSearchTerm("");
                            }
                          }}
                          inline
                          maxDate={new Date()}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="bg-[#2A2D36] rounded-lg p-2 hidden lg:block sm:p-4 md:p-6 border border-white mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                <div className="flex space-x-1 bg-[#1D1F27] rounded-lg p-1 md:mr-2">
                  {["today", "all"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setSelectedTab(tab);
                        setShowAllView(tab === "all");
                      }}
                      className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm md:text-base font-medium transition-colors whitespace-nowrap ${selectedTab === tab
                        ? "bg-[#EDB726] text-[#1D1F27]"
                        : "text-gray-400 hover:text-white cursor-pointer"
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="w-full lg:w-auto">
                  <div className="relative hidden lg:block">
                    <Search className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search tickets..."
                      className="w-full lg:w-48 md:w-64 pl-8 lg:pl-10 pr-4 py-1 sm:py-2 bg-[#1D1F27] border border-white rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EDB726] focus:border-[#EDB726] text-xs sm:text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-32 sm:h-48">
                <p className="text-gray-400 text-xs sm:text-sm md:text-base">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex justify-center items-center h-32 sm:h-48">
                <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                  No tickets found for selected criteria.
                </p>
              </div>
            ) : selectedTab === "today" && !showAllView ? (
              <div>
                <div className="lg:hidden mb-2 sm:mb-4 md:mb-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                    Today's <span className="text-[#EDB726]">Lottery Ticket</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {filteredTickets.map((ticket) => {
                    const createdAt = ticket?.created_at;
                    const dateObj = parseCreatedAt(createdAt);
                    const isValidDate = !!dateObj && !isNaN(dateObj.getTime());
                    const dateStr = isValidDate ? formatDate(dateObj.toISOString()) : "-";
                    const timeStr = isValidDate ? dayjs(dateObj).format("hh:mm A") : "-";
                    const statusText = String(ticket?.status || "-");

                    return (
                      <div
                        key={ticket.receipt}
                        className="bg-[#6e6f67] rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={() => openDetails(ticket)}
                      >
                        <div className="bg-white rounded-xl">
                          <div className="text-center mb-4">
                            <p className="text-black">Receipt# CW - <span className="font-semibold">{ticket.receipt}</span></p>
                            <p className="text-black">Date: <span className="font-bold">{dateStr} - {timeStr}</span></p>
                            <p className="text-gray-500 font-bold">
                              Status: <span className={ticket.status === "completed" ? "text-green-500" : "text-red-500"}>{statusText}</span>
                            </p>
                          </div>
                          <div className="border border-gray-300 rounded overflow-hidden mb-4" style={{ minWidth: "100%", display: "block" }}>
                            <table className="w-full text-sm">
                              <thead className="bg-[#EDB726] text-black uppercase">
                                <tr>
                                  <th className="px-2 py-1 text-center">P Mode</th>
                                  <th className="px-2 py-1 text-center">Total No.</th>
                                  <th className="px-2 py-1 text-center">Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="px-2 py-1 text-center">{ticket.payment_mode || "-"}</td>
                                  <td className="px-2 py-1 text-center">{ticket.total_no || 0}</td>
                                  <td className="px-2 py-1 text-center">XCG {ticket.bet || "0.00"}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div className="flex justify-around items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadTicketPdf(ticket);
                            }}
                            className="text-white mb-4 hover:text-[#d4a422] flex items-center cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5 mr-1" /> Download
                          </button>
                          {ticket.status === "pending" && dateStr === formattedTodaysDate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPayment(ticket);
                              }}
                              className="px-2 mb-4 bg-[#EDB726] text-black rounded hover:bg-[#d4a422] transition-colors cursor-pointer"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center mt-4 lg:hidden">
                  <button
                    onClick={() => {
                      setSelectedTab("all");
                      setShowAllView(true);
                    }}
                    className="px-4 py-2 bg-[#EDB726] font-bold text-black rounded-full hover:bg-[#d4a422] transition-colors"
                    style={{
                      background: "linear-gradient(135deg, #DCC549, #7B5910)"
                    }}
                  >
                    View All
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-[#2A2D36] rounded-lg border border-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm md:text-base">
                      <thead className="bg-[#1D1F27] text-[#EDB726]">
                        <tr>
                          <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left">Date</th>
                          <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-left">Receipt</th>
                          <th className="px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredTickets.map((ticket) => {
                          const createdAt: string | undefined = ticket?.created_at;
                          const dateObj = parseCreatedAt(createdAt);
                          const isValidDate = !!dateObj && !isNaN(dateObj.getTime());
                          const dateStr = isValidDate ? formatDate(dateObj.toISOString()) : "-";
                          const timeStr = isValidDate ? dayjs(dateObj).format("hh:mm A") : "-";
                          return (
                            <tr key={ticket.receipt} className="hover:bg-[#3A3D46] transition-colors">
                              <td className="px-2 sm:px-3 md:px-4 py-2">
                                <div className="text-white">{dateStr}</div>
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 py-2">
                                <div className="text-white font-medium">{ticket.receipt}</div>
                              </td>
                              <td className="px-2 sm:px-3 md:px-4 py-2 text-right">
                                <div className="inline-flex items-center gap-1 sm:gap-2">
                                  {ticket.status === "pending" && dateStr === formattedTodaysDate ? (
                                    <button
                                      onClick={() => openPayment(ticket)}
                                      className="text-[#EDB726] hover:text-[#d4a422]"
                                      title="Complete Payment"
                                    >
                                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => reuseTicketNumbers(ticket)}
                                      className="text-[#EDB726] hover:text-[#d4a422]"
                                      title="Reuse Numbers"
                                    >
                                      <Repeat className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openDetails(ticket)}
                                    className="text-[#EDB726] hover:text-[#d4a422]"
                                    title="View details"
                                  >
                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
                                  </button>
                                  <button
                                    onClick={() => downloadTicketPdf(ticket)}
                                    className="text-[#EDB726] hover:text-[#d4a422]"
                                    title="Download PDF"
                                  >
                                    <Download className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer" />
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
              </div>
            )}
          </div>
        </main>
      </div>
      <TicketDetailsModal isOpen={detailsOpen} onClose={closeDetails} ticket={selectedTicket} />
      {paymentOpen && paymentTicket && (
        <StripeCheckout
          amount={Number(paymentTicket.grand_total) || 0}
          localAmount={Number(paymentTicket.grand_total) || 0}
          lotteryId={paymentTicket.lottery_id}
          newOrderInfo={{ order_id: paymentTicket.order_id }}
          onClose={closePayment}
        />
      )}
      <PaymentMethodModal
        isOpen={paymentMethodOpen}
        newOrderInfo={selectedPaymentTicket}
        onClose={() => setPaymentMethodOpen(false)}
        onSelect={handlePaymentMethodSelect}
      />
      {whatsAppOpen && selectedPaymentTicket && (
        <WhatsAppModal
          newOrderInfo={selectedPaymentTicket}
          onClose={closeWhatsApp}
        />
      )}
    </div>
  );
};

export default Tickets;