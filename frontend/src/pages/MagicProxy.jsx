import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PublicReceipt from './PublicReceipt';
import PublicPdfViewer from './PublicPdfViewer';

export default function MagicProxy() {
  const { hash } = useParams();
  
  if (!hash) return <Navigate to="/" replace />;
  
  if (hash.startsWith('rec/')) {
    const id = hash.replace('rec/', '');
    return <PublicReceipt manualId={id} />;
  }
  if (hash.startsWith('admt/')) {
    const id = hash.replace('admt/', '');
    return <PublicPdfViewer type="admit-card" manualId={id} />;
  }
  if (hash.startsWith('res/')) {
    const id = hash.replace('res/', '');
    return <PublicPdfViewer type="result-card" manualId={id} />;
  }
  
  return <Navigate to="/" replace />;
}
