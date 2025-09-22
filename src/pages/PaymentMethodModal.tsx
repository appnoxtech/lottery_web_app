import React from "react";
import { X } from "lucide-react";
import { formatDate } from "../hooks/dateFormatter";
import { dollarConversion, euroConversion } from "../hooks/utilityFn";

interface OrderInfo {
  order_id: number;
  total_price: string;
  local_total: string;
  ticket_numbers: number[];
  selected_lotteries: string[];
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  newOrderInfo: OrderInfo | null;
  onClose: () => void;
  onSelect: (method: "stripe" | "whatsapp") => void;
}

const paymentLink = `https://buy.stripe.com/fZeeUU05C8XueWIeUU`;
const paymentLink2 = `https://buy.stripe.com/fZe4gg8C8gpWdSEbIJ`;
const paymentLink3 = `https://buy.stripe.com/eVa000cSo5Li29W5km`;

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ isOpen, newOrderInfo, onClose, onSelect }) => {
  if (!isOpen) return null;

  const handleWhatsappPayment = () => {
    if (!newOrderInfo) return;
    const grandTotal = parseFloat(newOrderInfo.total_price || "0");
    const message = `
Esaki ta e numbernan ku bo a pidi:
----------------------------------------
🎟️ Numbernan: ${newOrderInfo.ticket_numbers.join(", ")}
💰 Loteria: ${newOrderInfo.selected_lotteries.join(", ")}
📅 Fecha: ${formatDate(new Date().toISOString())}
💵 Total: XCG ${grandTotal.toFixed(2)} / $ ${dollarConversion(Number(grandTotal))} / € ${euroConversion(Number(grandTotal))}
💳 Modo di Pago: Whatsapp

Por fabor usa link pa paga sea na €, $ of XCG :
Hulanda Ideal Euro €: ${paymentLink}
Bonaire Dollar $: ${paymentLink2}
Korsou Florin Karibense XCG: ${paymentLink3}

Kòrda paga pa bo ta den wega i kontrolá bo bòn.
Suerte,
Wega Di Number`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2D36] rounded-lg p-6 border border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Choose Payment Method</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {newOrderInfo && (
          <div className="mb-6 p-4 bg-[#1D1F27] rounded-lg border border-gray-600">
            <h4 className="text-sm font-semibold text-white mb-2">Order Summary</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Total Amount: XCG {newOrderInfo.local_total} </div>
              <div>Numbers: {newOrderInfo.ticket_numbers.length}</div>
              <div>Lotteries: {[...new Set(newOrderInfo.selected_lotteries)].join(", ")}</div>

            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => onSelect("stripe")}
            className="w-full bg-[#1D1F27] border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:border-[#EDB726] transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#EDB726] rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-[#1D1F27]"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.7917 8.75L7.58333 14.875L13.7917 21M20 8.75H15.1667H20ZM20 21H15.1667H20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-white font-medium">Pay With Stripe</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={() => { handleWhatsappPayment(); onSelect("whatsapp"); }}
            className="w-full bg-[#1D1F27] border border-gray-600 rounded-lg p-4 flex items-center justify-between hover:border-[#EDB726] transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.016a7.88 7.88 0 01-3.9-1.037l-.279-.165-2.937.77.784-2.875-.184-.289a7.88 7.88 0 01-1.2-4.206c0-4.356 3.532-7.89 7.888-7.89a7.88 7.88 0 015.658 2.357 7.882 7.882 0 012.33 5.643c0 4.356-3.532 7.89-7.888 7.89m8.949-16.785A11.811 11.811 0 0012.028 0C5.37 0 0 5.367 0 12.028c0 2.135.56 4.17 1.616 5.945L0 24l6.218-1.63c1.718.94 3.67 1.444 5.71 1.444h.01c6.667 0 12.037-5.367 12.037-12.028 0-3.172-1.238-6.157-3.487-8.405" />
                </svg>
              </div>
              <span className="text-white font-medium">Pay With WhatsApp</span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-4 text-center">
          Select your preferred payment method to complete the lottery creation
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
