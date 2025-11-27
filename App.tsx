import React, { useState, useEffect } from 'react';
import { Sparkles, Linkedin, Twitter, Instagram, Settings2, Image as ImageIcon, Zap } from 'lucide-react';
import { Tone, ImageResolution, GenerationResult, AspectRatio } from './types';
import { generateSocialText, generatePlatformImage } from './services/geminiService';
import PlatformCard from './components/PlatformCard';

const App: React.FC = () => {
  // State
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>(Tone.PROFESSIONAL);
  const [resolution, setResolution] = useState<ImageResolution>(ImageResolution.R_1K);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Results State
  const [results, setResults] = useState<GenerationResult | null>(null);

  // Initialize and check for API Key
  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(hasKey);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasApiKey) {
      await handleSelectKey();
      return;
    }
    if (!topic.trim()) return;

    setIsGenerating(true);
    setResults(null);

    try {
      // 1. Generate Text Content
      const textData = await generateSocialText(topic, tone);

      // Initialize results with text, loading state for images
      const initialResults: GenerationResult = {
        linkedin: {
          platform: 'LinkedIn',
          content: textData.linkedin.content,
          imagePrompt: textData.linkedin.imagePrompt,
          isLoadingImage: true,
          aspectRatio: '16:9'
        },
        twitter: {
          platform: 'Twitter',
          content: textData.twitter.content,
          imagePrompt: textData.twitter.imagePrompt,
          isLoadingImage: true,
          aspectRatio: '16:9'
        },
        instagram: {
          platform: 'Instagram',
          content: textData.instagram.content,
          imagePrompt: textData.instagram.imagePrompt,
          isLoadingImage: true,
          aspectRatio: '1:1'
        }
      };

      setResults(initialResults);
      setIsGenerating(false); // Text is done, unlock UI partially if needed, but we keep visuals loading

      // 2. Trigger Image Generations in Parallel
      // We don't await these to block the UI. We update state as they finish.
      generateImageForPlatform('linkedin', textData.linkedin.imagePrompt, '16:9', resolution);
      generateImageForPlatform('twitter', textData.twitter.imagePrompt, '16:9', resolution);
      generateImageForPlatform('instagram', textData.instagram.imagePrompt, '1:1', resolution);

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Something went wrong. Please check your API key and try again.");
      setIsGenerating(false);
    }
  };

  const generateImageForPlatform = async (
    key: keyof GenerationResult, 
    prompt: string, 
    ratio: AspectRatio, 
    res: ImageResolution
  ) => {
    try {
      const base64Image = await generatePlatformImage(prompt, ratio, res);
      
      setResults(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [key]: {
            ...prev[key],
            imageData: base64Image,
            isLoadingImage: false
          }
        };
      });
    } catch (err) {
      console.error(`Failed to generate image for ${key}`, err);
      setResults(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [key]: {
            ...prev[key],
            isLoadingImage: false // Stop loading spinner even on fail
          }
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              SocialSync AI
            </span>
          </div>
          <div className="flex items-center gap-4">
             {!hasApiKey && (
               <button 
                onClick={handleSelectKey}
                className="text-sm font-medium text-red-500 hover:text-red-600"
               >
                 Connect API Key
               </button>
             )}
            <div className="flex items-center gap-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500">
              <Zap size={12} className="fill-yellow-500 text-yellow-500" />
              Gemini 3 Pro
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Input Section - Sticky-ish */}
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
            <h1 className="text-2xl font-bold mb-2 text-center">Create Viral Content Everywhere</h1>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
              One idea. Three platforms. Infinite possibilities.
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  What's your post about?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., launching a new sustainable coffee brand that helps farmers..."
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-900 transition-all outline-none resize-none h-28 text-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Settings2 size={16} /> Tone of Voice
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {Object.values(Tone).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <ImageIcon size={16} /> Image Quality
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as ImageResolution)}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {Object.values(ImageResolution).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className={`
                  w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform
                  ${isGenerating || !topic.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.01] hover:shadow-xl'}
                `}
              >
                {isGenerating ? (
                  <>
                    <Settings2 className="animate-spin" /> Crafting Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="fill-white" /> Generate Campaign
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Grid */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
            <PlatformCard
              post={results.linkedin}
              icon={<Linkedin size={20} />}
              colorClass="bg-[#0077b5]"
              onRegenerateImage={() => generateImageForPlatform('linkedin', results.linkedin.imagePrompt, '16:9', resolution)}
            />
            <PlatformCard
              post={results.twitter}
              icon={<Twitter size={20} />}
              colorClass="bg-black"
              onRegenerateImage={() => generateImageForPlatform('twitter', results.twitter.imagePrompt, '16:9', resolution)}
            />
            <PlatformCard
              post={results.instagram}
              icon={<Instagram size={20} />}
              colorClass="bg-gradient-to-r from-purple-500 to-pink-500"
              onRegenerateImage={() => generateImageForPlatform('instagram', results.instagram.imagePrompt, '1:1', resolution)}
            />
          </div>
        )}
      </main>
      
      {/* Footer / API Info */}
       <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
         <p>Powered by Google Gemini 3 Pro & Gemini 3 Pro Image Preview</p>
         {!hasApiKey && <p className="mt-2 text-amber-500">Paid API Key selection required for Image Generation.</p>}
         <p className="mt-2 text-xs">Images are generated in {resolution} resolution.</p>
       </footer>

    </div>
  );
};

export default App;