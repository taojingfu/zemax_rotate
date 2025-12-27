
import React, { useState, useEffect, useCallback } from 'react';
import { parseMatrixString, decomposeMatrix, formatPrecision } from './services/mathUtils';
import { analyzeSpatialContext } from './services/geminiService';
import { DecompositionResult } from './types';

// Icons
const ClipboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const App: React.FC = () => {
  const [input, setInput] = useState('9: 1.00000000 0.00000000 0.00000000 0.00000000 0.00000000 0.99975536 -0.02211853 35.79052608 0.00000000 0.02211853 0.99975536 302.07035776');
  const [result, setResult] = useState<DecompositionResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [precision, setPrecision] = useState(10);
  const [copied, setCopied] = useState(false);

  const handleDecompose = useCallback(() => {
    const parsed = parseMatrixString(input);
    if (parsed) {
      const decomp = decomposeMatrix(parsed);
      setResult(decomp);
      setAnalysis('');
    } else {
      setResult(null);
    }
  }, [input]);

  useEffect(() => {
    handleDecompose();
  }, [handleDecompose]);

  const runAnalysis = async () => {
    if (!result) return;
    setIsAnalyzing(true);
    const aiResponse = await analyzeSpatialContext(result);
    setAnalysis(aiResponse || "No analysis available.");
    setIsAnalyzing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Matrix Precision Analyzer</h1>
            <p className="text-slate-500 mt-1">High-fidelity 3x4 transformation matrix decomposition</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Precision:</label>
            <select 
              value={precision} 
              onChange={(e) => setPrecision(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            >
              {[6, 8, 10, 12, 14].map(p => <option key={p} value={p}>{p} Decimals</option>)}
            </select>
          </div>
        </header>

        {/* Input Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
            Input Matrix String (3x4)
          </label>
          <div className="relative group">
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="9: 1.00000000 0.00000000 ..."
            />
            <button
              onClick={() => copyToClipboard(input)}
              className="absolute top-3 right-3 p-2 bg-white text-slate-400 hover:text-blue-500 rounded-lg border border-slate-100 shadow-sm transition-colors opacity-0 group-hover:opacity-100"
              title="Copy input"
            >
              <ClipboardIcon />
            </button>
          </div>
          {!result && input.trim() !== '' && (
            <p className="text-red-500 text-xs mt-2 font-medium">Invalid matrix format. Expected 12 space-separated numbers.</p>
          )}
        </section>

        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Results Display */}
            <div className="space-y-6">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Rotation (Euler Angles)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Roll (X)', val: result.eulerDegrees.roll },
                    { label: 'Pitch (Y)', val: result.eulerDegrees.pitch },
                    { label: 'Yaw (Z)', val: result.eulerDegrees.yaw },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-1">{item.label}</p>
                      <p className="text-lg font-mono font-bold text-slate-900 break-all">
                        {formatPrecision(item.val, precision)}°
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Translation Vector
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'X Axis', val: result.translation.x },
                    { label: 'Y Axis', val: result.translation.y },
                    { label: 'Z Axis', val: result.translation.z },
                  ].map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 mb-1">{item.label}</p>
                      <p className="text-lg font-mono font-bold text-slate-900 break-all">
                        {formatPrecision(item.val, precision)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 overflow-x-auto">
                <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Rotation Matrix [3x3]
                </h3>
                <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] md:text-xs text-indigo-300 leading-relaxed overflow-x-auto">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-2 min-w-[300px]">
                    <span className="text-white">{formatPrecision(result.matrix.r11, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r12, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r13, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r21, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r22, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r23, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r31, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r32, precision)}</span>
                    <span className="text-white">{formatPrecision(result.matrix.r33, precision)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* AI Analysis Section */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Spatial Context Analysis
                </h3>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-purple-100"
                >
                  {isAnalyzing ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <SearchIcon />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Expert Insight'}
                </button>
              </div>

              <div className="flex-grow bg-slate-50 rounded-2xl p-6 border border-slate-100 overflow-y-auto min-h-[300px]">
                {analysis ? (
                  <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {analysis}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <SearchIcon />
                    <p className="mt-2 text-sm">Click 'Expert Insight' for a professional analysis of this transformation.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Global Feedback */}
        {copied && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white text-sm rounded-full shadow-2xl animate-bounce">
            Copied to clipboard!
          </div>
        )}

        {/* Footer Info */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-slate-400 text-xs">
            Using Tait-Bryan ZYX rotation sequence for Euler decomposition. 
            Precision verified for 64-bit float representations.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
