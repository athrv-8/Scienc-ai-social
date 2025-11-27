import React from 'react';
import { GeneratedPost } from '../types';
import { Copy, Loader2, Download, RefreshCw } from 'lucide-react';

interface PlatformCardProps {
  post: GeneratedPost;
  icon: React.ReactNode;
  colorClass: string;
  onRegenerateImage?: () => void;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ post, icon, colorClass, onRegenerateImage }) => {
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(post.content);
    // Could add toast here
  };

  const downloadImage = () => {
    if (post.imageData) {
      const link = document.createElement('a');
      link.href = post.imageData;
      link.download = `${post.platform.toLowerCase()}-post.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className={`p-4 ${colorClass} text-white flex items-center justify-between`}>
        <div className="flex items-center gap-2 font-bold text-lg">
          {icon}
          {post.platform}
        </div>
        <div className="text-xs font-mono opacity-80 bg-black/20 px-2 py-1 rounded">
          {post.aspectRatio}
        </div>
      </div>

      {/* Image Section */}
      <div className="relative w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center group min-h-[250px]">
        {post.isLoadingImage ? (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Generating {post.platform} Visual...</span>
          </div>
        ) : post.imageData ? (
          <>
            <img 
              src={post.imageData} 
              alt={`${post.platform} generated content`} 
              className="w-full h-auto max-h-[400px] object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <button 
                onClick={downloadImage}
                className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors"
                title="Download Image"
              >
                <Download size={20} />
              </button>
               {onRegenerateImage && (
                 <button 
                  onClick={onRegenerateImage}
                  className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors"
                  title="Regenerate Image"
                 >
                   <RefreshCw size={20} />
                 </button>
               )}
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-sm italic p-4 text-center">
            Waiting for content...
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 p-5 flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Draft Caption</h3>
          <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
            {post.content || "Generations will appear here..."}
          </div>
        </div>
        
        {post.content && (
          <button 
            onClick={copyToClipboard}
            className="self-end flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-wide"
          >
            <Copy size={14} /> Copy Text
          </button>
        )}
      </div>
    </div>
  );
};

export default PlatformCard;