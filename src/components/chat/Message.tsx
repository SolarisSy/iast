import Avatar from '@/components/avatar/Avatar';
import CitationChips from './CitationChips';
import { ExpandableDocument } from './ExpandableDocument';

export interface MessageProps {
  text: string;
  sender: 'user' | 'bot';
  citations?: { title: string; url: string }[];
  document?: {
    title: string;
    content: string;
  };
}

export const Message = ({ text, sender, citations, document }: MessageProps) => {
  const isUser = sender === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 ring-2 ring-white/10 rounded-full">
          <Avatar size="small" />
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`rounded-2xl px-6 py-4 ${
            isUser
              ? 'bg-white/10 backdrop-blur-sm text-white/90'
              : 'bg-white/5 backdrop-blur-sm text-white/80'
          } shadow-lg border ${
            isUser ? 'border-white/10' : 'border-white/5'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
        
        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-2">
            <CitationChips citations={citations} />
          </div>
        )}
        
        {/* Expandable Document */}
        {document && (
          <div className="mt-3 w-full max-w-full">
            <ExpandableDocument title={document.title} content={document.content} />
          </div>
        )}
      </div>

      {/* User Avatar Placeholder */}
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ring-2 ring-white/10">
          <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
    </div>
  );
};
