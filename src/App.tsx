/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  X, 
  Copy, 
  Check, 
  RotateCcw,
  Info,
  Calculator,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants & Types ---

type Direction = 'up' | 'down';

interface Level {
  percent: string;
  coeff: number;
}

const BASE_LEVELS: Level[] = [
  { percent: '38.2%', coeff: 0.382 },
  { percent: '50.0%', coeff: 0.5 },
  { percent: '61.8%', coeff: 0.618 },
];

const EXTENDED_LEVELS: Level[] = [
  { percent: '23.6%', coeff: 0.236 },
  { percent: '78.6%', coeff: 0.786 },
  { percent: '127.2%', coeff: 1.272 },
  { percent: '161.8%', coeff: 1.618 },
  { percent: '261.8%', coeff: 2.618 },
];

// --- Components ---

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block w-full" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#2c2f33] text-white text-xs rounded shadow-xl whitespace-nowrap pointer-events-none border border-[#3a3f45]"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#2c2f33]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ResultCard = ({ 
  percent, 
  value, 
  formula, 
  type, 
  coeff 
}: { 
  percent: string; 
  value: number; 
  formula: string; 
  type: 'correction' | 'extension';
  coeff: number;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value.toFixed(2).replace('.', ','));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isExtension = type === 'extension';
  const borderColor = isExtension ? 'border-[#4caf92]/30' : 'border-[#f44336]/30';

  return (
    <Tooltip text={formula}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={handleCopy}
        className={`bg-[#1e1f22] rounded-xl p-4 cursor-pointer transition-all border ${borderColor} active:bg-[#2c2f33] mb-3`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#9b9b9b]">{percent}</span>
          <span className="text-sm font-medium text-[#9b9b9b]">{coeff}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">
            {value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {copied && <Check size={16} className="text-[#4caf92]" />}
        </div>
      </motion.div>
    </Tooltip>
  );
};

export default function App() {
  const [pointA, setPointA] = useState<string>('15599');
  const [pointB, setPointB] = useState<string>('84000');
  const [direction, setDirection] = useState<Direction>('up');
  const [showExtended, setShowExtended] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => {
    const a = parseFloat(pointA);
    const b = parseFloat(pointB);

    if (isNaN(a) || isNaN(b)) return null;
    if (a === b) return null;

    const diff = Math.abs(a - b);
    const levels = showExtended ? [...BASE_LEVELS, ...EXTENDED_LEVELS].sort((x, y) => x.coeff - y.coeff) : BASE_LEVELS;

    const corrections = levels.filter(l => l.coeff <= 1.0).map(level => {
      const val = direction === 'up' ? b - (diff * level.coeff) : b + (diff * level.coeff);
      const formula = direction === 'up' 
        ? `${b} - (${diff} × ${level.coeff})` 
        : `${b} + (${diff} × ${level.coeff})`;
      return { ...level, value: val, formula };
    });

    const extensions = levels.map(level => {
      const val = direction === 'up' ? b + (diff * level.coeff) : b - (diff * level.coeff);
      const formula = direction === 'up' 
        ? `${b} + (${diff} × ${level.coeff})` 
        : `${b} - (${diff} × ${level.coeff})`;
      return { ...level, value: val, formula };
    });

    return { diff, corrections, extensions };
  }, [pointA, pointB, direction, showExtended]);

  useEffect(() => {
    const a = parseFloat(pointA);
    const b = parseFloat(pointB);
    if (pointA && pointB && a === b) {
      setError('Точки должны отличаться');
    } else {
      setError(null);
    }
  }, [pointA, pointB]);

  const handleReset = () => {
    setPointA('');
    setPointB('');
    setDirection('up');
    setShowExtended(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0f10] text-white font-sans">
      <div className="max-w-[480px] mx-auto px-4 py-6">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Fibonacci Master</h1>
          <button 
            onClick={() => setShowHelp(true)}
            className="text-[#9b9b9b] hover:text-white transition-colors"
          >
            <HelpCircle size={24} />
          </button>
        </header>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#1e1f22] rounded-2xl p-4">
            <label className="text-xs font-medium text-[#9b9b9b] mb-2 block">Точка А</label>
            <input 
              type="number" 
              value={pointA}
              onChange={(e) => setPointA(e.target.value)}
              className="w-full bg-transparent text-xl font-bold focus:outline-none placeholder-[#3a3f45]"
              placeholder="0"
            />
          </div>
          <div className="bg-[#1e1f22] rounded-2xl p-4">
            <label className="text-xs font-medium text-[#9b9b9b] mb-2 block">Точка Б</label>
            <input 
              type="number" 
              value={pointB}
              onChange={(e) => setPointB(e.target.value)}
              className="w-full bg-transparent text-xl font-bold focus:outline-none placeholder-[#3a3f45]"
              placeholder="0"
            />
          </div>
        </div>

        {/* Direction */}
        <div className="bg-[#1e1f22] rounded-2xl p-4 mb-4">
          <label className="text-xs font-medium text-[#9b9b9b] mb-3 block">Направление тренда</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setDirection('up')}
              className={`flex-1 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 border-2 ${
                direction === 'up' 
                  ? 'bg-[#166534] border-[#22c55e] text-white' 
                  : 'bg-[#2c2f33] border-transparent text-[#9b9b9b]'
              }`}
            >
              <TrendingUp size={18} />
              <span>Вверх</span>
            </button>
            <button 
              onClick={() => setDirection('down')}
              className={`flex-1 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 border-2 ${
                direction === 'down' 
                  ? 'bg-[#3b2b2b] border-[#f44336] text-white' 
                  : 'bg-[#2c2f33] border-transparent text-[#9b9b9b]'
              }`}
            >
              <TrendingDown size={18} />
              <span>Вниз</span>
            </button>
          </div>
        </div>

        {/* Extended Toggle */}
        <div 
          onClick={() => setShowExtended(!showExtended)}
          className="bg-[#1e1f22] rounded-2xl p-4 mb-4 flex items-center justify-between cursor-pointer"
        >
          <div>
            <div className="text-base font-bold text-white">Расширенные уровни</div>
            <div className="text-xs text-[#9b9b9b]">0.236, 0.786, 2.618</div>
          </div>
          <div className={`w-12 h-6 rounded-full relative transition-colors ${showExtended ? 'bg-[#4caf92]' : 'bg-[#2c2f33]'}`}>
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showExtended ? 'translate-x-6' : ''}`} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-8">
          <button 
            onClick={() => {}} // Calculation is reactive
            className="flex-[4] bg-[#3b82f6] text-white py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Calculator size={20} />
            <span>Рассчитать</span>
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 bg-[#2c2f33] text-[#9b9b9b] hover:text-white rounded-2xl flex items-center justify-center transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="bg-[#1e1f22]/50 rounded-2xl p-6 text-center">
                <div className="text-base font-bold text-white mb-1">
                  Разница: <span className="font-mono">{results.diff.toLocaleString('ru-RU')}</span>
                </div>
                <div className="text-xs text-[#9b9b9b]">Нажмите на карточку для копирования</div>
              </div>

              {/* Corrections */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowDown size={18} className="text-[#f44336]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">КОРРЕКЦИЯ (откат)</h2>
                </div>
                {results.corrections.map((level, idx) => (
                  <ResultCard key={`corr-${idx}`} {...level} type="correction" />
                ))}
              </section>

              {/* Extensions */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUp size={18} className="text-[#4caf92]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">РАСШИРЕНИЕ (цели)</h2>
                </div>
                {results.extensions.map((level, idx) => (
                  <ResultCard key={`ext-${idx}`} {...level} type="extension" />
                ))}
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-[#3b2b2b] border border-[#f44336]/30 rounded-xl text-[#f44336] text-sm flex items-center gap-2">
            <Info size={16} />
            {error}
          </div>
        )}

        {/* Help Screen */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-[#0d0f10] overflow-y-auto p-5"
            >
              <div className="flex justify-between items-center mb-8 pt-2">
                <h2 className="text-2xl font-bold text-white">Как это работает?</h2>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-[#9b9b9b] hover:text-white transition-colors"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-white mb-4">Почему направление важно?</h3>
                  <p className="text-sm text-[#b0b3b8] leading-relaxed mb-6">
                    Рынок может двигаться вверх или вниз, и уровни Фибоначчи считаются по-разному:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-[#1e1f22] rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-white font-bold mb-4">
                        <TrendingUp size={20} className="text-[#4caf92]" />
                        <span>Тренд ВВЕРХ (бычий)</span>
                      </div>
                      <div className="text-sm text-[#b0b3b8] space-y-2">
                        <p>Точка А — это дно, точка Б — вершина.</p>
                        <p>• Коррекция (откат вниз): от Б минус коэффициент</p>
                        <p>• Расширение (продолжение роста): от Б плюс коэффициент</p>
                      </div>
                    </div>

                    <div className="bg-[#1e1f22] rounded-2xl p-6">
                      <div className="flex items-center gap-2 text-white font-bold mb-4">
                        <TrendingDown size={20} className="text-[#f44336]" />
                        <span>Тренд ВНИЗ (медвежий)</span>
                      </div>
                      <div className="text-sm text-[#b0b3b8] space-y-2">
                        <p>Точка А — это вершина, точка Б — дно.</p>
                        <p>• Коррекция (откат вверх): от Б плюс коэффициент</p>
                        <p>• Расширение (продолжение падения): от Б минус коэффициент</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-white mb-4">Пример</h3>
                  <div className="text-sm text-[#b0b3b8] space-y-2">
                    <p>Если Биткоин падает с 100 000 до 50 000:</p>
                    <p>• Коррекция вверх: 50 000 + (50 000 × 0.382) = 69 100</p>
                    <p>• Расширение вниз: 50 000 - (50 000 × 0.618) = 19 100</p>
                  </div>
                </section>
              </div>

              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-10 bg-[#2c2f33] text-white py-4 rounded-2xl font-bold hover:bg-[#3a3f45] transition-colors"
              >
                ПОНЯТНО
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
