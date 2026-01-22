
import React, { useState } from 'react';
import { FlowType } from './types';
import { GeminiService } from './geminiService';
import { 
  BarChart3, 
  Lightbulb, 
  Upload, 
  Copy, 
  CheckCircle2, 
  Zap,
  Clock,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Hash,
  Activity,
  Type as FontIcon,
  AlignLeft,
  Video,
  Settings2,
  Terminal
} from 'lucide-react';

const gemini = new GeminiService();

interface CopyBubbleProps {
  label: string;
  content: string;
  icon: React.ReactNode;
  id: string;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  highlight?: boolean;
}

const CopyBubble: React.FC<CopyBubbleProps> = ({ label, content, icon, id, onCopy, copiedId, highlight }) => (
  <div className={`glass-panel rounded-[1.5rem] p-5 flex flex-col gap-3 group border-white/5 transition-all duration-300 ${highlight ? 'border-[#25F4EE]/30 bg-[#25F4EE]/5' : 'hover:border-white/10'}`}>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-lg ${highlight ? 'bg-[#25F4EE]/20 text-[#25F4EE]' : 'bg-white/5 text-white/40'}`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-[#25F4EE]' : 'text-white/30'}`}>{label}</span>
      </div>
      <button 
        onClick={() => onCopy(content, id)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
          copiedId === id 
            ? 'bg-green-500 text-white' 
            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
        }`}
      >
        {copiedId === id ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copiedId === id ? 'Kopiert' : 'Copy'}
      </button>
    </div>
    <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 min-h-[48px] flex items-center">
      <p className="text-[13px] font-bold text-white/90 leading-relaxed whitespace-pre-wrap">
        {content || 'Lade Matrix...'}
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FlowType>(FlowType.ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(0);

  const [niche, setNiche] = useState('Standard');
  const [goal, setGoal] = useState('Views');
  const [mood, setMood] = useState('Lustig');
  const [region, setRegion] = useState('DE');

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [hashtagTopic, setHashtagTopic] = useState('');
  const [hashtagVisuals, setHashtagVisuals] = useState('');

  const formatErrorMessage = (err: any) => {
    const msg = err?.message || String(err);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return "KI-LIMIT ERREICHT: Dein Gratis-Limit von Google ist für heute oder diese Minute aufgebraucht. Bitte 1-2 Minuten warten oder einen anderen Key nutzen.";
    }
    return `FEHLER: ${msg}`;
  };

  const handleCopy = (text: string, id: string) => {
    const cleanText = text.replace(/📋 /g, '').replace(/\[|\]/g, '').replace(/\*/g, '').trim();
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      let videoBase64;
      if (videoFile) {
        const reader = new FileReader();
        videoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
          reader.readAsDataURL(videoFile);
        });
      }
      const data = await gemini.analyzeVideo(niche, region, goal, mood, videoBase64);
      setResult(data || 'Keine Daten empfangen.');
    } catch (err: any) {
      setResult(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!category) return;
    setLoading(true);
    setResult(null);
    setSelectedIdeaIndex(0);
    try {
      const data = await gemini.generateIdeas(category, niche, region, goal, mood);
      setResult(data || 'Keine Ideen generiert.');
    } catch (err: any) {
      setResult(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!hashtagTopic || !hashtagVisuals) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await gemini.generateHashtags(hashtagTopic, hashtagVisuals, niche, goal, mood, region);
      setResult(data || 'Keine Tags gefunden.');
    } catch (err: any) {
      setResult(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const GlobalSelectors = () => (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2 mb-1">
        <Settings2 className="w-3.5 h-3.5 text-[#25F4EE]" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Matrix Parameter</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Nische</label>
          <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full glass-panel rounded-xl px-3 py-3 text-[11px] font-bold text-white border-white/10 outline-none">
            <option value="Standard">Standard</option>
            <option value="Edits/Clips">Edits/Clips</option>
            <option value="Business">Business</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Ziel</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full glass-panel rounded-xl px-3 py-3 text-[11px] font-bold text-white border-white/10 outline-none">
            <option value="Views">Views</option>
            <option value="Follower">Follower</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Mood</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full glass-panel rounded-xl px-3 py-3 text-[11px] font-bold text-white border-white/10 outline-none">
            <option value="Lustig">Lustig</option>
            <option value="Ernst">Ernst</option>
            <option value="Ästhetisch">Ästhetisch</option>
            <option value="Aggressiv">Aggressiv</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[8px] font-black text-white/20 uppercase tracking-widest ml-1">Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full glass-panel rounded-xl px-3 py-3 text-[11px] font-bold text-white border-white/10 outline-none">
            <option value="DE">DE</option>
            <option value="Global">Global</option>
          </select>
        </div>
      </div>
    </div>
  );

  const getField = (text: string, key: string) => {
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`${escapedKey}:?\\s*(?:📋\\s*)?\\[?([^\\]\\n]+)\\]?`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const parseScanResult = (text: string) => {
    if (text.includes('FEHLER') || text.includes('KI-LIMIT')) return null;
    return {
      code: getField(text, 'VIRAL-CODE'),
      score: getField(text, 'SCORE').replace('%', ''),
      inhalt: getField(text, 'INHALT'),
      videoText: getField(text, 'VIDEO-TEXT'),
      caption: getField(text, 'CAPTION'),
      hashtags: getField(text, 'HASHTAGS'),
      time: getField(text, 'POST-ZEIT')
    };
  };

  const parseIdeas = (text: string) => {
    if (text.includes('FEHLER') || text.includes('KI-LIMIT')) return [];
    const blocks = text.split(/## IDEA \d/i).filter(b => b.trim().length > 10);
    return blocks.map(block => ({
      code: getField(block, 'VIRAL-CODE'),
      score: getField(block, 'SCORE').replace('%', ''),
      videoText: getField(block, 'VIDEO-TEXT'),
      caption: getField(block, 'CAPTIONS') || getField(block, 'CAPTION'),
      hashtags: getField(block, 'HASHTAGS'),
      time: getField(block, 'POST-ZEIT')
    }));
  };

  const ideas = activeTab === FlowType.IDEAS && result ? parseIdeas(result) : [];
  const scanData = activeTab === FlowType.ANALYSIS && result ? parseScanResult(result) : null;

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans selection:bg-[#FE2C55] selection:text-white relative pb-20">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[1] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="relative z-10 flex-1 max-w-md mx-auto w-full px-6 pt-12 flex flex-col">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6 border-white/10">
            <Activity className="w-3 h-3 text-[#25F4EE]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/80">Algorithm 2026 Live</span>
          </div>
          <h1 className="text-5xl font-[1000] tracking-tighter tiktok-gradient-text uppercase leading-none">Viral Strategist</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mt-3">Advanced Strategy Matrix</p>
        </header>

        <nav className="flex p-1 glass-panel rounded-2xl mb-8 border-white/20 sticky top-4 z-50 backdrop-blur-3xl">
          {[
            { id: FlowType.ANALYSIS, icon: BarChart3, label: 'Scan' },
            { id: FlowType.IDEAS, icon: Lightbulb, label: 'Ideen' },
            { id: FlowType.HASHTAGS, icon: Hash, label: 'Tags' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as FlowType); setResult(null); }}
              className={`flex-1 flex flex-col items-center py-3.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-white/40 hover:text-white'}`}
            >
              <tab.icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="flex-1">
          {!result && !loading && (
            <div className="animate-in fade-in duration-500 space-y-6">
              {activeTab === FlowType.ANALYSIS && (
                <>
                  <div className="relative group">
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" id="v-up" />
                    <label htmlFor="v-up" className="w-full flex flex-col items-center justify-center py-10 rounded-3xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                      {videoFile ? (
                        <div className="text-center px-4">
                          <CheckCircle2 className="w-8 h-8 text-[#25F4EE] mx-auto mb-2" />
                          <p className="text-[11px] font-bold text-white/90 truncate max-w-[200px]">{videoFile.name}</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <Upload className="w-4 h-4 text-white/60" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Upload Source</span>
                        </>
                      )}
                    </label>
                  </div>
                  <GlobalSelectors />
                  <button onClick={handleAnalyze} className="w-full py-5 tiktok-button rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    KI-Analyse Starten <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === FlowType.IDEAS && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Video Thema / Fokus</label>
                      <input 
                        type="text" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full glass-panel rounded-2xl px-6 py-5 text-sm font-bold text-white border-white/10 outline-none placeholder:text-white/10 focus:border-[#25F4EE]/30" 
                        placeholder="Worum geht es in deinem Video?" 
                      />
                    </div>
                    <GlobalSelectors />
                  </div>
                  <button onClick={handleGenerateIdeas} className="w-full py-5 tiktok-button rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    KI-Ideen Generieren <Sparkles className="w-4 h-4" />
                  </button>
                </>
              )}

              {activeTab === FlowType.HASHTAGS && (
                <>
                  <div className="space-y-4">
                    <input type="text" value={hashtagTopic} onChange={(e) => setHashtagTopic(e.target.value)} className="w-full glass-panel rounded-2xl px-5 py-5 text-sm font-bold text-white border-white/10 outline-none" placeholder="Video-Thema..." />
                    <input type="text" value={hashtagVisuals} onChange={(e) => setHashtagVisuals(e.target.value)} className="w-full glass-panel rounded-2xl px-5 py-5 text-sm font-bold text-white border-white/10 outline-none" placeholder="Was sieht man genau?" />
                    <GlobalSelectors />
                  </div>
                  <button onClick={handleGenerateHashtags} className="w-full py-5 tiktok-button rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    Hashtag Boost <Hash className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-white/10 rounded-full flex items-center justify-center">
                   <div className="w-20 h-20 border-t-2 border-[#25F4EE] rounded-full animate-spin"></div>
                </div>
                <Zap className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#25F4EE] animate-pulse">Syncing Matrix...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 pb-20">
              {activeTab === FlowType.ANALYSIS && (
                scanData ? (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1 glass-panel rounded-[2rem] p-6 border-t-2 border-[#FE2C55]">
                        <p className="text-[10px] font-black text-[#FE2C55] uppercase tracking-widest mb-1">Viral Score</p>
                        <p className="text-5xl font-[1000] tracking-tighter text-white tabular-nums">{scanData.score}%</p>
                      </div>
                      <div className="flex-1 glass-panel rounded-[2rem] p-6 border-t-2 border-[#25F4EE] flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[#25F4EE] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xl font-black tabular-nums">{scanData.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Post-Zeit</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <CopyBubble label="Viral Code" content={scanData.code} icon={<Terminal className="w-3.5 h-3.5" />} id="s-code" onCopy={handleCopy} copiedId={copiedId} highlight />
                      <CopyBubble label="Inhalt des Videos" content={scanData.inhalt} icon={<Video className="w-3.5 h-3.5" />} id="s-content" onCopy={handleCopy} copiedId={copiedId} />
                      <CopyBubble label="Textvorschlag Video" content={scanData.videoText} icon={<FontIcon className="w-3.5 h-3.5" />} id="s-v-text" onCopy={handleCopy} copiedId={copiedId} />
                      <CopyBubble label="Caption" content={scanData.caption} icon={<AlignLeft className="w-3.5 h-3.5" />} id="s-caption" onCopy={handleCopy} copiedId={copiedId} />
                      <CopyBubble label="Hashtags" content={scanData.hashtags} icon={<Hash className="w-3.5 h-3.5" />} id="s-tags" onCopy={handleCopy} copiedId={copiedId} />
                    </div>
                  </>
                ) : (
                  <div className="glass-panel p-8 rounded-3xl border-red-500/20 text-center">
                    <AlertCircle className="w-8 h-8 text-[#FE2C55] mx-auto mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest text-[#FE2C55] mb-2">Matrix Interrupt</p>
                    <p className="text-[13px] font-bold text-white/80 leading-relaxed">{result}</p>
                    <button onClick={() => setResult(null)} className="mt-6 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">Erneut versuchen</button>
                  </div>
                )
              )}

              {activeTab === FlowType.IDEAS && (
                ideas.length > 0 ? (
                  <>
                    <div className="flex p-1.5 glass-panel rounded-full overflow-hidden mb-4 border-white/5">
                      {ideas.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setSelectedIdeaIndex(i)} 
                          className={`flex-1 py-3 text-[10px] font-[1000] uppercase tracking-widest transition-all rounded-full ${selectedIdeaIndex === i ? 'bg-white text-black shadow-xl' : 'text-white/40 hover:text-white'}`}
                        >
                          Idee {i + 1}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1 glass-panel rounded-[2rem] p-6 border-t-2 border-[#25F4EE]">
                        <p className="text-[10px] font-black text-[#25F4EE] uppercase tracking-widest mb-1">Potenzial</p>
                        <p className="text-5xl font-[1000] tracking-tighter text-white tabular-nums">{ideas[selectedIdeaIndex].score}%</p>
                      </div>
                      <div className="flex-1 glass-panel rounded-[2rem] p-6 border-t-2 border-[#FE2C55] flex flex-col justify-center">
                        <div className="flex items-center gap-2 text-[#FE2C55] mb-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-xl font-black tabular-nums">{ideas[selectedIdeaIndex].time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Startzeit</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <CopyBubble label="Idea Viral Code" content={ideas[selectedIdeaIndex].code} icon={<Terminal className="w-3.5 h-3.5" />} id="i-code" onCopy={handleCopy} copiedId={copiedId} highlight />
                      <CopyBubble label="Textvorschlag In-Video" content={ideas[selectedIdeaIndex].videoText} icon={<FontIcon className="w-3.5 h-3.5" />} id="i-v-text" onCopy={handleCopy} copiedId={copiedId} />
                      <CopyBubble label="Captions" content={ideas[selectedIdeaIndex].caption} icon={<AlignLeft className="w-3.5 h-3.5" />} id="i-caption" onCopy={handleCopy} copiedId={copiedId} />
                      <CopyBubble label="Hashtags" content={ideas[selectedIdeaIndex].hashtags} icon={<Hash className="w-3.5 h-3.5" />} id="i-tags" onCopy={handleCopy} copiedId={copiedId} />
                    </div>
                  </>
                ) : (
                  <div className="glass-panel p-8 rounded-3xl border-red-500/20 text-center">
                    <AlertCircle className="w-8 h-8 text-[#FE2C55] mx-auto mb-3" />
                    <p className="text-[13px] font-bold text-white/80">{result}</p>
                    <button onClick={() => setResult(null)} className="mt-6 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5">Erneut versuchen</button>
                  </div>
                )
              )}

              {activeTab === FlowType.HASHTAGS && (
                <div className="glass-panel rounded-[2rem] p-8 border border-[#25F4EE]/10">
                  <div className="flex items-center gap-2 mb-6">
                    <Hash className="w-4 h-4 text-[#25F4EE]" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Booster Tag Matrix</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {result?.includes('LIMIT') || result?.includes('FEHLER') ? (
                      <div className="text-center py-4">
                        <AlertCircle className="w-6 h-6 text-[#FE2C55] mx-auto mb-2" />
                        <p className="text-white/80 text-[11px] font-bold leading-relaxed">{result}</p>
                        <button onClick={() => setResult(null)} className="mt-4 text-[10px] font-black uppercase text-[#25F4EE]">Zurück</button>
                      </div>
                    ) : (
                      (() => {
                        const tags = result?.match(/#[\w\d]+/g) || [];
                        if (tags.length === 0 && result) {
                          return (
                            <div className="space-y-4">
                              <p className="text-white/40 text-[10px] text-center italic">Keine Hashtags erkannt. Roh-Antwort:</p>
                              <p className="text-[12px] text-white/60 bg-white/5 p-4 rounded-xl">{result}</p>
                            </div>
                          );
                        }
                        if (!result) return <p className="text-white/20 text-[10px] text-center italic">Warte auf Matrix-Stream...</p>;
                        
                        return tags.map((tag, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleCopy(tag, `ht-${i}`)}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all border border-white/5 ${copiedId === `ht-${i}` ? 'bg-green-500/20 border-green-500/50' : 'bg-white/5 hover:bg-white/10'}`}
                          >
                            <span className="text-lg font-black tracking-tight">{tag}</span>
                            <div className={`p-2 rounded-lg ${copiedId === `ht-${i}` ? 'bg-green-500 text-white' : 'bg-white/10 text-white/30'}`}>
                              {copiedId === `ht-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </div>
                          </button>
                        ));
                      })()
                    )}
                  </div>
                </div>
              )}

              <button onClick={() => setResult(null)} className="w-full py-8 mt-4 text-[10px] font-black text-white/20 hover:text-[#25F4EE] uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-3">
                <AlertCircle className="w-4 h-4" /> New Matrix Analysis
              </button>
            </div>
          )}
        </main>
      </div>
      
      <footer className="fixed bottom-0 left-0 w-full py-6 text-center z-50 pointer-events-none">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">v1.0 • Strategy Lab Matrix</p>
      </footer>
    </div>
  );
};

export default App;
