import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createWorker } from 'tesseract.js';
import { AlertTriangle, ArrowRight, Check, ChevronDown, CircleHelp, FileImage, Heart, LoaderCircle, LockKeyhole, ScanLine, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';
import './style.css';

const options = [
  { id: 'peanut', label: 'Peanuts', kind: 'Allergy', terms: ['peanut', 'groundnut', 'arachis'] },
  { id: 'tree-nut', label: 'Tree nuts', kind: 'Allergy', terms: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'] },
  { id: 'milk', label: 'Milk', kind: 'Allergy', terms: ['milk', 'whey', 'casein', 'butter', 'cream', 'ghee', 'lactose'] },
  { id: 'egg', label: 'Egg', kind: 'Allergy', terms: ['egg', 'albumin', 'mayonnaise'] },
  { id: 'soy', label: 'Soy', kind: 'Allergy', terms: ['soy', 'soya', 'edamame', 'lecithin'] },
  { id: 'wheat', label: 'Wheat', kind: 'Allergy', terms: ['wheat', 'semolina', 'durum', 'spelt'] },
  { id: 'sesame', label: 'Sesame', kind: 'Allergy', terms: ['sesame', 'tahini'] },
  { id: 'lactose', label: 'Lactose', kind: 'Intolerance', terms: ['lactose', 'milk powder', 'whey', 'milk solids'] },
];

function App() {
  const [selected, setSelected] = useState([]);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('idle');
  const [notice, setNotice] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);
  const hits = useMemo(() => {
    const lower = text.toLowerCase();
    return options.map((item) => ({ ...item, matchedTerms: item.terms.filter((term) => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i').test(lower)) })).filter((item) => selected.includes(item.id) && item.matchedTerms.length > 0);
  }, [text, selected]);

  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const readImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Choose an image file to scan.'); return; }
    setFileName(file.name);
    setNotice('');
    setPhase('reading');
    let worker;
    try {
      worker = await createWorker('eng', 1, { logger: (m) => { if (m.status === 'recognizing text') setNotice(`Reading label · ${Math.round((m.progress || 0) * 100)}%`); } });
      const { data } = await worker.recognize(file);
      setText(data.text.trim());
      setNotice(data.text.trim() ? 'Label text is ready to review.' : 'We could not read this image. Try a sharper, closer photo or paste the ingredients.');
      setPhase('done');
    } catch {
      setNotice('The label reader could not start. You can still paste the ingredient text below.');
      setPhase('error');
    } finally {
      if (worker) await worker.terminate();
    }
  };

  const reset = () => { setText(''); setFileName(''); setNotice(''); setPhase('idle'); if (inputRef.current) inputRef.current.value = ''; };
  const trySample = () => { setSelected(['peanut']); setText('Rolled oats, cane sugar, peanut oil, sea salt.'); setFileName('Sample ingredient list'); setPhase('done'); setNotice('Example label loaded.'); };

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="LabelKind home"><span className="brand-mark"><Heart size={17} fill="currentColor" /></span><span>labelkind</span></a><div className="privacy"><LockKeyhole size={14} /> Private by design</div></header>
    <section className="hero" id="top">
      <div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> A little more confidence at the table</div><h1>Know what’s<br/>in the <em>label.</em></h1><p className="intro">A gentle second pair of eyes for ingredient lists. Pick what you avoid, then scan or paste a label to spot a possible match.</p><div className="hero-note"><ShieldCheck size={17} /><span>Your preferences stay in this browser session.</span></div></div>
      <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-leaf leaf-one">✳</div><div className="art-leaf leaf-two">✳</div><div className="label-card"><div className="label-card-top"><span>INGREDIENTS</span><span className="tiny-bars">≋</span></div><div className="label-line wide"/><div className="label-line"/><div className="label-line long"/><div className="label-highlight"><span>peanut oil</span><span className="match-tag"><Check size={12}/></span></div><div className="label-line wide"/><div className="label-line short"/><div className="scan-corner corner-a"/><div className="scan-corner corner-b"/></div><div className="art-caption"><Sparkles size={14}/> A clearer look, right in your hands</div></div>
    </section>

    <section className="workspace" aria-label="Ingredient label checker">
      <div className="section-heading"><div><div className="eyebrow small-eyebrow">YOUR CHECK</div><h2>What should we look for?</h2></div><div className="step-label"><span>01</span><span className="step-line"/><span>02</span></div></div>
      <div className="checker-grid">
        <section className="panel preferences"><div className="panel-heading"><div className="panel-icon mint"><Heart size={17}/></div><div><h3>Your avoid list</h3><p>Choose ingredients to flag.</p></div><button className="help-button" title="Choose only what applies to you" aria-label="About the avoid list"><CircleHelp size={17}/></button></div>
          <div className="chip-list">{options.map((item) => <button key={item.id} onClick={() => toggle(item.id)} className={`choice-chip ${selected.includes(item.id) ? 'chosen' : ''}`} aria-pressed={selected.includes(item.id)}><span className="chip-check">{selected.includes(item.id) && <Check size={12}/>}</span>{item.label}<span className="chip-kind">{item.kind}</span></button>)}</div>
          <div className="preference-foot"><LockKeyhole size={13}/><span>Saved only until you close this tab</span><ChevronDown size={14}/></div>
        </section>
        <section className="panel scan-panel"><div className="panel-heading"><div className="panel-icon peach"><ScanLine size={17}/></div><div><h3>Read an ingredient list</h3><p>Take a clear photo or paste the text.</p></div></div>
          <button className={`dropzone ${phase === 'reading' ? 'is-reading' : ''}`} onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); readImage(e.dataTransfer.files?.[0]); }} disabled={phase === 'reading'}>
            <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => readImage(e.target.files?.[0])}/>
            <span className="upload-icon">{phase === 'reading' ? <LoaderCircle className="spin" size={21}/> : <Upload size={20}/>}</span><span className="upload-main">{phase === 'reading' ? 'Reading your label…' : fileName || 'Drop a photo here or browse'}</span><span className="upload-meta">PNG, JPG · processed on your device</span>
          </button>
          <div className="or-divider"><span/>or paste the ingredients<span/></div>
          <label className="sr-only" htmlFor="ingredients">Ingredient list text</label><textarea id="ingredients" value={text} onChange={(e) => { setText(e.target.value); setPhase('done'); setNotice(''); }} placeholder="e.g. oats, sugar, peanut oil, sea salt…" rows="4" />
          <div className="scan-actions"><span className={`status ${notice && phase !== 'error' ? 'active' : ''}`}>{notice || 'We’ll highlight words to double-check.'}</span><div className="action-links">{!text && <button className="clear-button sample-button" onClick={trySample}>Try a sample</button>}{text && <button className="clear-button" onClick={reset}>Clear <X size={13}/></button>}</div></div>
        </section>
      </div>
      {text && <section className={`result-card ${hits.length ? 'has-hits' : 'no-hits'}`} aria-live="polite"><div className="result-icon">{hits.length ? <AlertTriangle size={20}/> : <Check size={20}/>}</div><div className="result-copy"><div className="result-kicker">{hits.length ? 'WORTH A CLOSER LOOK' : 'NO SELECTED TERMS FOUND'}</div><h3>{hits.length ? `We spotted ${hits.length} possible ${hits.length === 1 ? 'match' : 'matches'}.` : 'No selected ingredients matched.'}</h3><p>{hits.length ? 'The label text may contain something on your list. Check the original packaging and ask the manufacturer if anything is unclear.' : 'OCR can miss small print or similar ingredient names. Always verify against the original package.'}</p><div className="match-list">{hits.map((hit) => <span key={hit.id} className="match-pill"><span>{hit.matchedTerms.map((term) => `“${term}”`).join(', ')}</span><small>{hit.label} · {hit.kind === 'Allergy' ? 'possible allergen' : 'intolerance'}</small></span>)}</div></div><div className="result-decoration"><ArrowRight size={18}/></div></section>}
    </section>
    <section className="honesty"><div className="honesty-icon"><AlertTriangle size={18}/></div><div><strong>A helpful check, never a safety guarantee.</strong><p>LabelKind can miss text and cannot detect cross-contact, recipe changes, or undeclared ingredients. For severe allergies, always read the package and contact the manufacturer when unsure.</p></div></section>
    <footer><span>Made with care, for someone you care about.</span><span className="footer-tech"><FileImage size={14}/> Open-source Tesseract LSTM OCR <span className="footer-dot">·</span> Local inference</span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);

