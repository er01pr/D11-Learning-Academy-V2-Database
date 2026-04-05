'use client';

import React, { useRef } from 'react';
import { X, Download, GraduationCap } from 'lucide-react';

interface CertificateProps {
  userName: string;
  completionDate: Date;
  avgQuizScore: number;
  onClose: () => void;
}

export default function Certificate({ userName, completionDate, avgQuizScore, onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const certIdRef = useRef<string>(
    'A11-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
  );
  const certId = certIdRef.current;

  const formattedDate = completionDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 600;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 600);

      // Orange top bar
      ctx.fillStyle = '#e87722';
      ctx.fillRect(40, 30, 720, 8);

      // Title
      ctx.fillStyle = '#e87722';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLETION', 400, 80);

      ctx.fillStyle = '#183028';
      ctx.font = 'bold 28px Georgia, serif';
      ctx.fillText('Aquila11 Financial Academy', 400, 120);

      // Divider
      ctx.fillStyle = '#e87722';
      ctx.fillRect(350, 145, 100, 2);

      // Certifies text
      ctx.fillStyle = '#183028';
      ctx.globalAlpha = 0.6;
      ctx.font = '14px Arial';
      ctx.fillText('This certifies that', 400, 185);
      ctx.globalAlpha = 1;

      // Name
      ctx.fillStyle = '#183028';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText(userName, 400, 220);

      // Description
      ctx.globalAlpha = 0.6;
      ctx.font = '14px Arial';
      ctx.fillText('has successfully completed all training modules of the', 400, 260);
      ctx.fillText('Aquila11 Financial Academy curriculum', 400, 280);
      ctx.globalAlpha = 1;

      // Stats labels
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#183028';
      ctx.globalAlpha = 0.5;
      ctx.fillText('COMPLETION DATE', 300, 330);
      ctx.fillText('AVG QUIZ SCORE', 500, 330);
      ctx.globalAlpha = 1;

      // Stats values
      ctx.fillStyle = '#183028';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(formattedDate, 300, 355);
      ctx.fillText(`${avgQuizScore}%`, 500, 355);

      // Cert ID
      ctx.globalAlpha = 0.3;
      ctx.font = '10px monospace';
      ctx.fillText(`Certificate ID: ${certId}`, 400, 520);
      ctx.globalAlpha = 1;

      // Orange bottom bar
      ctx.fillStyle = '#e87722';
      ctx.fillRect(40, 560, 720, 8);

      // Download
      const link = document.createElement('a');
      link.download = `Aquila11-Certificate-${userName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download certificate:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fwd-green/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95">
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-fwd-green/40 hover:text-fwd-green transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Certificate content - this is what gets captured */}
        <div ref={certificateRef} className="px-12 pb-12 text-center bg-white">
          {/* Decorative top border */}
          <div className="h-2 bg-gradient-to-r from-fwd-orange via-fwd-orange-50 to-fwd-orange rounded-full mb-8" />

          {/* Logo area */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-fwd-orange flex items-center justify-center mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>

          <p className="text-xs font-bold text-fwd-orange uppercase tracking-[0.2em] mb-2">
            Certificate of Completion
          </p>
          <h2 className="text-3xl font-bold text-fwd-green mb-1">Aquila11 Financial Academy</h2>
          <div className="w-24 h-0.5 bg-fwd-orange mx-auto my-6" />

          <p className="text-sm text-fwd-green/60 mb-2">This certifies that</p>
          <h3 className="text-2xl font-bold text-fwd-green mb-2">{userName}</h3>
          <p className="text-sm text-fwd-green/60 mb-6">
            has successfully completed all training modules of the
            <br />
            Aquila11 Financial Academy curriculum
          </p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-xs text-fwd-green/50 uppercase tracking-wide font-bold">Completion Date</p>
              <p className="text-sm font-bold text-fwd-green">{formattedDate}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-fwd-green/50 uppercase tracking-wide font-bold">Avg Quiz Score</p>
              <p className="text-sm font-bold text-fwd-green">{avgQuizScore}%</p>
            </div>
          </div>

          <p className="text-[10px] text-fwd-green/30 font-mono">Certificate ID: {certId}</p>

          {/* Decorative bottom border */}
          <div className="h-2 bg-gradient-to-r from-fwd-orange via-fwd-orange-50 to-fwd-orange rounded-full mt-8" />
        </div>

        {/* Download button - outside the captured area */}
        <div className="p-6 border-t border-fwd-grey bg-fwd-grey/20 flex justify-center">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-8 py-3 bg-fwd-orange text-white font-bold rounded-xl hover:bg-fwd-orange-80 transition-colors shadow-md"
          >
            <Download className="w-5 h-5" />
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
