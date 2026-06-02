import React, { useState } from 'react';
import { QrCode, Copy, Check, MessageSquare, Phone } from 'lucide-react';

export default function QRShare({ phone, whatsapp, telegram, sellerName }) {
  const [copied, setCopied] = useState(false);

  // Construct the contact vCard or raw URL payload
  const qrData = whatsapp || `tel:${phone}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=059669&bgcolor=ffffff`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center shadow-inner flex flex-col items-center">
      <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold mb-3">
        <QrCode className="h-5 w-5" />
        <span className="text-sm uppercase tracking-wider font-sans">Quick Connect QR</span>
      </div>
      
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
        Scan this QR code with your smartphone camera to immediately open a chat with <b>{sellerName}</b>!
      </p>

      {/* Pulsing Glow QR container */}
      <div className="p-3 bg-white rounded-lg shadow-xl dark:shadow-emerald-500/5 mb-4 border-2 border-emerald-500/20 group-hover:border-emerald-500/50 transition-all duration-300">
        <img
          src={qrCodeUrl}
          alt={`Scan to contact ${sellerName}`}
          className="w-40 h-40 object-contain"
          onError={(e) => {
            e.target.style.display = 'none'; // hide broken image and let fallback display
          }}
        />
      </div>

      {/* Quick Dial Actions */}
      <div className="w-full flex flex-col space-y-2 mt-2">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all duration-200"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open WhatsApp Chat</span>
          </a>
        )}

        <div className="flex items-center space-x-2 w-full">
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center space-x-1.5 flex-grow py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all duration-200"
            title="Copy phone number to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Phone</span>
              </>
            )}
          </button>

          <a
            href={`tel:${phone}`}
            className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200"
            title="Call Seller"
          >
            <Phone className="h-4.5 w-4.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
