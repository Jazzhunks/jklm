import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useMatches } from 'react-router-dom';
import { API_BASE } from '@/lib/api';

export default function PublicPdfViewer({ type, manualId }) {
  const params = useParams();
  const applicationNo = manualId || params['*'] || '';
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const phone = queryParams.get('phone') || '';
  
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const endpoint = type === 'admit-card' 
          ? `/admt%2F${encodeURIComponent(applicationNo)}?phone=${encodeURIComponent(phone)}`
          : `/res%2F${encodeURIComponent(applicationNo)}?phone=${encodeURIComponent(phone)}`;
          
        const res = await fetch(endpoint, {
          method: 'GET'
        });
        if (!res.ok) throw new Error("Document not found");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        // Open PDF directly in the browser viewer (or trigger download on mobile)
        window.location.replace(url);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPdf();
  }, [applicationNo, phone, type]);

  const titleText = type === 'admit-card' ? 'Admit Card' : 'Result Card';
  const fileName = `${type}-${applicationNo}.pdf`;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-500 font-medium tracking-wide">Retrieving Secure {titleText}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">{titleText} Not Found</h2>
          <p className="text-slate-500 text-sm">The document for <strong className="text-slate-700">{applicationNo}</strong> could not be located. Please verify your credentials or contact administration.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm text-slate-600 font-medium tracking-wide">Opening Document...</p>
    </div>
  );
}
