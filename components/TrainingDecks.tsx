import React from 'react';
import { Presentation, ExternalLink } from 'lucide-react';
import { CANVA_EMBED_URL, CANVA_VIEW_URL } from '../constants';

const TrainingDecks: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl md:text-3xl font-bold text-fwd-green mb-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-fwd-orange-20 flex items-center justify-center text-fwd-orange">
          <Presentation className="w-5 h-5" />
        </div>
        Training Decks
      </h2>
      <p className="text-sm text-fwd-green/60 mb-6">
        Browse the Aquila11 training module presentation — covers all modules and key concepts.
      </p>

      <div className="bg-white rounded-3xl shadow-soft border border-fwd-grey/50 overflow-hidden">
        <div className="w-full" style={{ aspectRatio: '16 / 9', minHeight: '300px' }}>
          <iframe
            src={CANVA_EMBED_URL}
            className="w-full h-full"
            allowFullScreen
            loading="lazy"
            title="Aquila11 Training Module Deck"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <a
          href={CANVA_VIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-fwd-orange text-white text-sm font-bold rounded-xl hover:bg-fwd-orange/90 transition-colors shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          View Full Deck in Canva
        </a>
      </div>
    </div>
  );
};

export default TrainingDecks;
