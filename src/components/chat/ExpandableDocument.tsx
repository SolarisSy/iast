import { useState } from 'react';

interface ExpandableDocumentProps {
  title: string;
  content: string;
}

export const ExpandableDocument = ({ title, content }: ExpandableDocumentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm overflow-hidden shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 md:p-4 text-left hover:bg-white/5 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
            <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xs md:text-sm font-medium text-white/80 truncate">{title}</span>
        </div>
        <svg 
          className={`w-4 h-4 md:w-5 md:h-5 flex-shrink-0 text-white/40 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-3 md:px-4 pb-3 md:pb-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mt-2 md:mt-3 p-3 md:p-4 bg-black/20 rounded-lg overflow-x-auto">
            <pre className="whitespace-pre-wrap font-sans text-[10px] md:text-xs text-white/60 leading-relaxed">{content}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
