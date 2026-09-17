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
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const endpoint = type === 'admit-card' 
          ? `${API_BASE}/scholarship-applications/${encodeURIComponent(applicationNo)}/admit-card?phone=${encodeURIComponent(phone)}`
          : `${API_BASE}/scholarship-applications/${encodeURIComponent(applicationNo)}/result-card?phone=${encodeURIComponent(phone)}`;
          
        const res = await fetch(endpoint, {
          method: 'GET'
        });
        if (!res.ok) throw new Error("Document not found");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
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
    <div className="w-full h-screen overflow-hidden bg-slate-800 flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0 shadow-md z-10 relative">
        <div className="font-medium">{titleText} - {applicationNo}</div>
        <a href={pdfUrl} download={fileName} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-sm font-bold transition flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </a>
      </div>
      <iframe src={pdfUrl} className="w-full flex-1 border-0" title={titleText} />
    </div>
  );
}
