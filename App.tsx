
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
  TrendingUp,
  Hash,
  Activity
} from 'lucide-react';

const gemini = new GeminiService();

interface ScoreBarProps {
  label: string;
  value: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FlowType>(FlowType.ANALYSIS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIdeaIndex, setSelectedIdeaIndex] = useState(0);

  // Form states
  const [niche, setNiche] = useState('Standard (normaler Benutzer, lustige clips, tänze, quotes einfach alles)');
  const [region, setRegion] = useState('DE');
  const [goal, setGoal] = useState('Combi');
  const [category, setCategory] = useState('');
  const [style, setStyle] = useState('General (alle arten von videos)');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Specific Hashtag states
  const [hashtagTopic, setHashtagTopic] = useState('');
  const [hashtagVisuals, setHashtagVisuals] = useState('');
  const [mood, setMood] = useState('Lustig');

  const handleCopy = (text: string, id: string) => {
    const cleanText = text.replace(/📋 /g, '').replace(/"/g, '').trim();
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
      const data = await gemini.analyzeVideo(niche, region, goal, videoBase64);
      setResult(data || '');
    } catch (err) {
      setResult('Analyse fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!category) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await gemini.generateIdeas(category, niche, region, style);
      setResult(data || '');
    } catch (err) {
      setResult('Generierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHashtags = async () => {
    if (!hashtagTopic || !hashtagVisuals) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await gemini.generateHashtags(hashtagTopic, hashtagVisuals, niche, goal, mood);
      setResult(data || '');
    } catch (err) {
      setResult('Tags fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar: React.FC<ScoreBarProps> = ({ label, value }) => {
    const numValue = parseInt(value.match(/\d+/)?.[0] || '0');
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">{label}</span>
          <span className="text-[12px] font-black text-[#25F4EE] tabular-nums">{numValue}%</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] transition-all duration-1000" style={{ width: `${numValue}%` }} />
        </div>
      </div>
    );
  };

  const parseIdeas = (text: string) => {
    const blocks = text.split(/## IDEA \d/g).filter(b => b.trim().length > 0);
    return blocks.map(block => ({
      score: block.match(/VIRAL POTENTIAL: (\d+)/)?.[1] || '0',
      storyboard: block.match(/### STORYBOARD:([\s\S]*?)(?=###|$)/)?.[1]?.trim() || '',
      caption: block.match(/CAPTION: 📋 ([\s\S]*?)(?=###|$)/)?.[1]?.trim() || '',
      time: block.match(/POSTING ZEIT: ([\d:]+)/)?.[1] || '--:--'
    }));
  };

  const parseHashtags = (text: string) => {
    const lines = text.match(/\d\..+/g) || [];
    return lines.map(line => ({
      type: line.match(/\[(.*?)\]/)?.[1] || 'TAG',
      tag: line.match(/📋\s*(#\w+)/)?.[1] || '#hashtag'
    }));
  };

  const ideas = activeTab === FlowType.IDEAS && result ? parseIdeas(result) : [];
  const hashtags = activeTab === FlowType.HASHTAGS && result ? parseHashtags(result) : [];

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col font-sans selection:bg-[#FE2C55] selection:text-white">
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      <div className="flex-1 max-w-md mx-auto w-full px-6 pt-12 pb-24">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6 border-white/20">
            <Activity className="w-3 h-3 text-[#25F4EE]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/90">Algorithm 2026 Live</span>
          </div>
          <h1 className="text-5xl font-[1000] tracking-tighter tiktok-gradient-text uppercase mb-2">Viral Matrix</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">Version 1.0 Release</p>
        </header>

        <nav className="flex p-1 glass-panel rounded-2xl mb-8 border-white/20">
          {[
            { id: FlowType.ANALYSIS, icon: BarChart3, label: 'Scan' },
            { id: FlowType.IDEAS, icon: Lightbulb, label: 'Ideen' },
            { id: FlowType.HASHTAGS, icon: Hash, label: 'Tags' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as FlowType); setResult(null); }}
              className={`flex-1 flex flex-col items-center py-3.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-white/60 hover:text-white/90'}`}
            >
              <tab.icon className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="min-h-[400px]">
          {!result && !loading && (
            <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
              {activeTab === FlowType.ANALYSIS && (
                <div className="space-y-6">
                  <div className="relative group">
                    <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" id="v-up" />
                    <label htmlFor="v-up" className="w-full flex flex-col items-center justify-center py-12 rounded-3xl border border-dashed border-white/30 bg-white/5 hover:bg-white/10 transition-all cursor-pointer">
                      {videoFile ? (
                        <div className="text-center px-4">
                          <CheckCircle2 className="w-8 h-8 text-[#25F4EE] mx-auto mb-2" />
                          <p className="text-[11px] font-bold text-white/90 truncate">{videoFile.name}</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <Upload className="w-4 h-4 text-white/80" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Video Scan</span>
                        </>
                      )}
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Nische</label>
                      <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full glass-panel rounded-2xl px-4 py-4 text-[12px] font-bold text-white border-white/20 outline-none">
                        <option value="Standard (normaler Benutzer, lustige clips, tänze, quotes einfach alles)">Standard (Alles)</option>
                        <option value="Clips">Clips</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Ziel</label>
                        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full glass-panel rounded-2xl px-4 py-4 text-[12px] font-bold text-white border-white/20 outline-none">
                          <option value="Combi">Combi</option>
                          <option value="Views">Views</option>
                          <option value="Likes">Likes</option>
                          <option value="Follower">Follower</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Region</label>
                        <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full glass-panel rounded-2xl px-4 py-4 text-[12px] font-bold text-white border-white/20 outline-none">
                          <option value="DE">DE</option>
                          <option value="Global">Global</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleAnalyze} className="w-full py-5 tiktok-button rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    Start AI Analyze <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTab === FlowType.IDEAS && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Thema</label>
                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full glass-panel rounded-2xl px-6 py-5 text-sm font-bold text-white border-white/20 outline-none placeholder:text-white/40" placeholder="z.B. Streetwear Design" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Style</label>
                      <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full glass-panel rounded-2xl px-4 py-4 text-[12px] font-bold text-white border-white/20 outline-none">
                        <option value="General (alle arten von videos)">General (Alle Arten)</option>
                        <option value="Clip">Clip</option>
                        <option value="Tanz">Tanz</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">Region</label>
                      <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full glass-panel rounded-2xl px-4 py-4 text-[12px] font-bold text-white border-white/20 outline-none">
                        <option value="DE">DE</option>
                        <option value="Global">Global</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleGenerateIdeas} className="w-full py-5 tiktok-button rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    Generate Viral Ideas <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}

              {activeTab === FlowType.HASHTAGS && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">1. Video Thema</label>
                    <input type="text" value={hashtagTopic} onChange={(e) => setHashtagTopic(e.target.value)} className="w-full glass-panel rounded-2xl px-5 py-4 text-[12px] font-bold text-white border-white/20 outline-none placeholder:text-white/40" placeholder="Worüber ist das Video?" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-widest ml-1">2. Visuelle Elemente</label>
                    <input type="text" value={hashtagVisuals} onChange={(e) => setHashtagVisuals(e.target.value)} className="w-full glass-panel rounded-2xl px-5 py-4 text-[12px] font-bold text-white border-white/20 outline-none placeholder:text-white/40" placeholder="Was sieht man?" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/70 uppercase tracking-widest ml-1">Nische</label>
                      <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full glass-panel rounded-xl px-2 py-3 text-[11px] font-bold text-white border-white/20 outline-none">
                        <option value="Standard (normaler Benutzer, lustige clips, tänze, quotes einfach alles)">Standard</option>
                        <option value="Clips">Clips</option>
                        <option value="Business">Business</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/70 uppercase tracking-widest ml-1">Ziel</label>
                      <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full glass-panel rounded-xl px-2 py-3 text-[11px] font-bold text-white border-white/20 outline-none">
                        <option value="Combi">Combi</option>
                        <option value="Views">Views</option>
                        <option value="Likes">Likes</option>
                        <option value="Follower">Follower</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-white/70 uppercase tracking-widest ml-1">Mood</label>
                      <select value={mood} onChange={(e) => setMood(e.target.value)} className="w-full glass-panel rounded-xl px-2 py-3 text-[11px] font-bold text-white border-white/20 outline-none">
                        <option value="Lustig">Lustig</option>
                        <option value="Chilled">Chilled</option>
                        <option value="Ernst">Ernst</option>
                        <option value="Traurig">Traurig</option>
                      </select>
                    </div>
                  </div>
                  <button onClick={handleGenerateHashtags} className="w-full py-5 tiktok-button rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    Boost Hashtags <Hash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center">
                   <div className="w-20 h-20 border-t-2 border-[#25F4EE] rounded-full animate-spin"></div>
                </div>
                <Zap className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#25F4EE] animate-pulse">Analyzing Algorithm Matrix...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
              {activeTab === FlowType.ANALYSIS && (
                <div className="space-y-6">
                  <div className="glass-panel rounded-3xl p-8 border-t-2 border-t-[#FE2C55]">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-[11px] font-black text-[#FE2C55] uppercase tracking-widest mb-1">Viral Potential</p>
                        <p className="text-6xl font-[1000] tracking-tighter tabular-nums text-white leading-none">{result.match(/VIRAL-SCORE: (\d+)/)?.[1] || '--'}</p>
                      </div>
                      <TrendingUp className="w-10 h-10 text-[#25F4EE] animate-pulse" />
                    </div>
                    <div className="space-y-5">
                      <ScoreBar label="Hook Strength" value={result.match(/Hook Strength: (\d+)/)?.[1] || '0'} />
                      <ScoreBar label="Replay Trigger" value={result.match(/Replay Trigger: (\d+)/)?.[1] || '0'} />
                      <ScoreBar label="Comment Bait" value={result.match(/Comment Bait: (\d+)/)?.[1] || '0'} />
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    <p className="text-[10px] font-black text-black/70 uppercase tracking-widest mb-4">Final Content Recommendation</p>
                    <p className="text-xl font-black text-black leading-tight tracking-tight mb-6">{result.split('✍️ CAPTION')[1]?.split('##')[0]?.trim().replace('📋 ', '')}</p>
                    <button onClick={() => handleCopy(result.split('✍️ CAPTION')[1]?.split('##')[0], 'c')} className={`w-full py-4 rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-2 transition-all ${copiedId === 'c' ? 'bg-green-600 text-white' : 'bg-black text-white'}`}>
                      {copiedId === 'c' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Recommendation
                    </button>
                  </div>
                </div>
              )}

              {activeTab === FlowType.IDEAS && ideas.length > 0 && (
                <div className="space-y-6">
                  <div className="flex p-1 glass-panel rounded-full overflow-hidden">
                    {ideas.map((_, i) => (
                      <button key={i} onClick={() => setSelectedIdeaIndex(i)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-full ${selectedIdeaIndex === i ? 'bg-white text-black shadow-lg' : 'text-white/80'}`}>Idee {i + 1}</button>
                    ))}
                  </div>
                  <div className="glass-panel rounded-3xl p-8 neon-glow-pink">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-4xl font-[1000] tracking-tighter text-white">{ideas[selectedIdeaIndex].score}%</p>
                      <div className="flex items-center gap-2 text-[#25F4EE]">
                        <Clock className="w-4 h-4" />
                        <span className="text-[14px] font-black">{ideas[selectedIdeaIndex].time}</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Storyboard / Flow</p>
                        {ideas[selectedIdeaIndex].storyboard.split('\n').filter(s => s.trim()).slice(0, 3).map((scene, i) => (
                          <div key={i} className="flex gap-4 items-center">
                            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[11px] font-black text-[#25F4EE]">{i + 1}</div>
                            <p className="text-[13px] font-bold text-white line-clamp-1">{scene.replace(/^\d\. /, '')}</p>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleCopy(ideas[selectedIdeaIndex].caption, 'ic')} className="w-full py-4 bg-white rounded-xl text-black font-black text-[11px] uppercase flex items-center justify-center gap-2">
                        {copiedId === 'ic' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy Script Set
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === FlowType.HASHTAGS && hashtags.length > 0 && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="glass-panel rounded-3xl p-8 border border-[#25F4EE]/20">
                    <div className="grid grid-cols-1 gap-3 mb-8">
                      {hashtags.map((h, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 group transition-all hover:bg-white/20">
                          <div className="space-y-1">
                            <p className="text-[9px] font-black text-[#25F4EE] uppercase tracking-[0.2em] opacity-90">{h.type}</p>
                            <p className="text-lg font-black tracking-tighter text-white">{h.tag}</p>
                          </div>
                          <button onClick={() => handleCopy(h.tag, `ht-${i}`)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copiedId === `ht-${i}` ? 'bg-green-500 text-white' : 'bg-white/10 text-white group-hover:bg-white/30'}`}>
                            {copiedId === `ht-${i}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => handleCopy(hashtags.map(h => h.tag).join(' '), 'ha')} className="w-full py-5 bg-white rounded-2xl text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl">
                       {copiedId === 'ha' ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />} Copy All Booster Tags
                    </button>
                  </div>
                </div>
              )}

              <button onClick={() => setResult(null)} className="w-full py-6 text-[11px] font-black text-white/50 uppercase tracking-[0.6em] hover:text-white/90 transition-all flex items-center justify-center gap-2">
                 <AlertCircle className="w-4 h-4" /> New Analysis
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-8 text-center pointer-events-none opacity-60 z-50">
        <p className="text-[10px] font-black uppercase tracking-[0.8em]">Matrix Strategist • Version 1.0 Final</p>
      </footer>
    </div>
  );
};

export default App;
