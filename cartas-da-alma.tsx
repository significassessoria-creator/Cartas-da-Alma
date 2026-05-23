import { useState, useRef, useEffect } from "react";

// Paleta Andréa Ribeiro — creme, marrom quente, dourado
const C = {
  bg:           "#f5f0e8",      // creme claro — fundo principal
  bgWarm:       "#ede6d8",      // creme mais quente — cards
  bgDeep:       "#e2d8c8",      // creme profundo — bordas suaves
  surface:      "#ffffff",      // branco puro — campos
  brown:        "#7a5c44",      // marrom principal
  brownDark:    "#5a3e2b",      // marrom escuro — títulos
  brownLight:   "#a47c5e",      // marrom médio — labels
  gold:         "#b8973a",      // dourado quente
  goldLight:    "#d4b86a",      // dourado suave
  rose:         "#a05050",      // terracota — desvalor
  sage:         "#5a7a60",      // verde sálvia — regulação
  blue:         "#4a6a8a",      // azul acinzentado — bíblico
  text:         "#3d2e1e",      // texto principal — marrom muito escuro
  textMid:      "#6b5040",      // texto médio
  textLight:    "#9a7a60",      // texto suave
  border:       "#d8cdb8",      // borda suave
  borderMid:    "#c4b49a",      // borda média
};

const SYSTEM_PROMPT = `Você é uma ferramenta terapêutica profunda chamada "Cartas da Alma", criada pela psicóloga Andréa Ribeiro — Especialista Cognitivo Comportamental (CRP 09/20938). Seu papel é acolher mulheres emocionalmente sensíveis que estão vivendo crises e precisam de regulação emocional — não de consolo vazio.

Você une:
- Terapia Cognitivo-Comportamental (TCC)
- Trauma emocional e sistema nervoso
- Apego emocional e dependência emocional
- Regulação emocional e somatização
- Fé cristã saudável e identidade em Deus

NUNCA use positividade tóxica. Nunca diga "vai ficar tudo bem", "você é perfeita", "ninguém vai te abandonar".

Use linguagem madura e reguladora como:
- "Mesmo que exista rejeição, isso não define meu valor."
- "A dor não precisa me fazer agir no desespero."
- "O comportamento do outro revela mais sobre ele do que sobre meu valor."
- "Meu sistema nervoso pode estar em ameaça, mas eu posso me regular."
- "Posso amar sem me abandonar."

Considere sempre: hipervigilância, trauma relacional, apego ansioso, medo de abandono, autocobrança, perfeccionismo, hiperresponsabilidade, somatização.

Quando receber a situação da pessoa, gere uma resposta estruturada em JSON com EXATAMENTE estes campos:

{
  "pensamento_automatico": "O pensamento automático mais provável baseado na situação descrita",
  "distorcao_cognitiva": "Nome da distorção + explicação gentil de 1 frase",
  "realidade_equilibrada": "A realidade — nem catastrófica nem positivamente tóxica. Verdadeira.",
  "acao_saudavel": "Uma ação pequena e real possível agora",
  "limite_saudavel": "O que precisa ser protegido emocionalmente aqui",
  "regulacao_nervoso": {
    "titulo": "Nome da técnica",
    "instrucoes": ["passo 1", "passo 2", "passo 3", "passo 4"]
  },
  "verdade_biblica": {
    "versiculo": "Texto do versículo",
    "referencia": "Livro Cap:Ver",
    "ancora": "Como essa verdade se aplica à dor dela agora — não como clichê, como âncora real"
  },
  "exemplo_biblico": {
    "pessoa": "Nome da pessoa bíblica",
    "paralelo": "O que ela viveu de parecido e o que isso ensina"
  },
  "frase_seguranca": "A frase de segurança emocional — verdade reguladora, não afirmação positiva",
  "crenca_ativada": "desvalor | desamor | desamparo",
  "acolhimento": "2-3 frases de abertura que acolhem sem minimizar a dor. Profundas, humanas, sem robótica."
}

Responda APENAS com o JSON. Sem texto antes ou depois. Sem markdown.`;

const breathingSteps = [
  { label: "Inspire",  duration: 4, color: C.sage },
  { label: "Segure",   duration: 4, color: C.gold },
  { label: "Expire",   duration: 6, color: C.rose },
  { label: "Descanse", duration: 2, color: C.blue },
];

// ── Butterfly SVG (traço fino, estilo Andréa) ──────────────────────────
function Butterfly({ size = 28, color = C.brownLight }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 48 36" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 18 C20 10, 8 4, 4 10 C0 16, 8 22, 24 18Z" />
      <path d="M24 18 C28 10, 40 4, 44 10 C48 16, 40 22, 24 18Z" />
      <path d="M24 18 C21 24, 12 28, 10 24 C8 20, 16 18, 24 18Z" />
      <path d="M24 18 C27 24, 36 28, 38 24 C40 20, 32 18, 24 18Z" />
      <line x1="24" y1="6" x2="22" y2="2" />
      <line x1="24" y1="6" x2="26" y2="2" />
      <circle cx="24" cy="18" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

// ── Respiração guiada ──────────────────────────────────────────────────
function BreathingCircle({ onClose }) {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(breathingSteps[0].duration);
  const [cycles, setCycles] = useState(0);
  const [active, setActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(p => {
            const next = (p + 1) % breathingSteps.length;
            if (next === 0) setCycles(c => c + 1);
            return next;
          });
          return breathingSteps[(phase + 1) % breathingSteps.length].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, phase]);

  const cur = breathingSteps[phase];
  const progress = active ? 1 - (count - 1) / (cur.duration - 1) : 0;

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(61,46,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(6px)" }}>
      <div style={{ background:C.surface, borderRadius:24, padding:"48px 40px", maxWidth:380, width:"90%", textAlign:"center", position:"relative", boxShadow:"0 20px 60px rgba(61,46,30,0.15)" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:20, background:"none", border:"none", color:C.textLight, cursor:"pointer", fontSize:20, lineHeight:1 }}>✕</button>
        <Butterfly size={24} color={C.brownLight} />
        <p style={{ color:C.textLight, fontSize:11, letterSpacing:3, margin:"12px 0 32px", textTransform:"uppercase" }}>Regulação do Sistema Nervoso</p>

        <div style={{ position:"relative", width:180, height:180, margin:"0 auto 28px" }}>
          <svg width="180" height="180" style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
            <circle cx="90" cy="90" r="78" fill="none" stroke={C.bgDeep} strokeWidth="3" />
            <circle cx="90" cy="90" r="78" fill="none" stroke={cur.color}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 78}`}
              strokeDashoffset={`${2 * Math.PI * 78 * (1 - progress)}`}
              style={{ transition:"stroke-dashoffset 1s linear, stroke 0.5s ease" }}
            />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:44, fontWeight:300, color:cur.color, lineHeight:1, fontFamily:"Cormorant Garamond, Georgia, serif" }}>{count}</span>
            <span style={{ fontSize:14, color:C.textMid, marginTop:6, letterSpacing:1 }}>{cur.label}</span>
          </div>
        </div>

        {cycles > 0 && <p style={{ color:C.sage, fontSize:13, marginBottom:12 }}>{cycles} {cycles===1?"ciclo completo":"ciclos completos"} ✓</p>}
        <p style={{ color:C.textLight, fontSize:12, marginBottom:24, lineHeight:1.7 }}>Inspire 4s · Segure 4s · Expire 6s · Descanse 2s</p>

        <button onClick={() => setActive(!active)} style={{ background: active ? "transparent" : C.sage, border:`1.5px solid ${C.sage}`, color: active ? C.sage : "#fff", padding:"12px 36px", borderRadius:40, cursor:"pointer", fontSize:14, letterSpacing:1, fontFamily:"inherit", transition:"all 0.2s" }}>
          {active ? "Pausar" : "Começar"}
        </button>
      </div>
    </div>
  );
}

// ── Histórico ─────────────────────────────────────────────────────────
function CrisesHistory({ crises, onClose, onSelect }) {
  const crencaColor = (c) => c === "desvalor" ? C.rose : c === "desamor" ? C.gold : C.blue;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(61,46,30,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(6px)" }}>
      <div style={{ background:C.surface, borderRadius:24, padding:40, maxWidth:560, width:"90%", maxHeight:"80vh", overflow:"auto", position:"relative", boxShadow:"0 20px 60px rgba(61,46,30,0.15)" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:20, background:"none", border:"none", color:C.textLight, cursor:"pointer", fontSize:20 }}>✕</button>
        <Butterfly size={22} color={C.brownLight} />
        <h2 style={{ color:C.brownDark, fontSize:22, fontWeight:400, margin:"10px 0 4px", fontFamily:"Cormorant Garamond, Georgia, serif" }}>Histórico de Crises</h2>
        <p style={{ color:C.textLight, fontSize:13, marginBottom:32 }}>{crises.length} {crises.length===1?"entrada registrada":"entradas registradas"}</p>

        {crises.length === 0
          ? <p style={{ color:C.textLight, textAlign:"center", padding:"40px 0" }}>Nenhuma crise registrada ainda.</p>
          : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[...crises].reverse().map((c, i) => (
                <div key={i} onClick={() => { onSelect(c); onClose(); }} style={{ background:C.bgWarm, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 20px", cursor:"pointer", transition:"border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.boxShadow = "0 4px 16px rgba(184,151,58,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontSize:10, letterSpacing:2, textTransform:"uppercase", color: crencaColor(c.resposta?.crenca_ativada) }}>{c.resposta?.crenca_ativada || "crise"}</span>
                    <span style={{ color:C.textLight, fontSize:12 }}>{c.data}</span>
                  </div>
                  <p style={{ color:C.textMid, fontSize:14, lineHeight:1.55, margin:0 }}>{c.situacao.slice(0,120)}{c.situacao.length>120?"…":""}</p>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  );
}

// ── Card de resposta ──────────────────────────────────────────────────
function RCard({ label, children, accent }) {
  return (
    <div style={{ borderLeft:`2.5px solid ${accent||C.gold}`, paddingLeft:20, marginBottom:28 }}>
      <p style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:accent||C.brownLight, marginBottom:8 }}>{label}</p>
      <div style={{ color:C.textMid, fontSize:15, lineHeight:1.8 }}>{children}</div>
    </div>
  );
}

// ── Campo de texto ────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, rows, filled }) {
  return (
    <div style={{ marginBottom:20 }}>
      <label style={{ display:"block", fontSize:10, letterSpacing:3, color: filled ? C.brown : C.textLight, marginBottom:9, textTransform:"uppercase", transition:"color 0.2s" }}>{label}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows||3}
        style={{ width:"100%", background:C.surface, border:`1.5px solid ${filled ? C.borderMid : C.border}`, borderRadius:12, padding:"14px 18px", color:C.text, fontSize:15, lineHeight:1.75, fontFamily:"Crimson Text, Georgia, serif", outline:"none", resize:"none", transition:"border-color 0.2s", boxSizing:"border-box" }}
        onFocus={e => e.target.style.borderColor = C.brownLight}
        onBlur={e => e.target.style.borderColor = filled ? C.borderMid : C.border}
      />
    </div>
  );
}

// ── App principal ─────────────────────────────────────────────────────
export default function CartasDaAlma() {
  const [step, setStep] = useState("form");
  const [situacao, setSituacao]   = useState("");
  const [pensamento, setPensamento] = useState("");
  const [emocao, setEmocao]       = useState("");
  const [reacao, setReacao]       = useState("");
  const [resposta, setResposta]   = useState(null);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showHistory, setShowHistory]     = useState(false);
  const [crises, setCrises] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cartas_crises_ar") || "[]"); } catch { return []; }
  });

  const canSubmit = situacao.trim().length > 5 && pensamento.trim().length > 3 && emocao.trim().length > 3 && reacao.trim().length > 3;

  async function handleSubmit() {
    if (!canSubmit) return;
    setStep("loading");
    const msg = `Situação vivida: ${situacao}\nO que pensei: ${pensamento}\nO que senti: ${emocao}\nComo reagi: ${reacao}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:[{role:"user",content:msg}] })
      });
      const data = await res.json();
      const text = data.content.map(i => i.text||"").join("");
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setResposta(parsed);
      const nova = { situacao, pensamento, emocao, reacao, resposta:parsed, data: new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) };
      const lista = [...crises, nova];
      setCrises(lista);
      try { localStorage.setItem("cartas_crises_ar", JSON.stringify(lista)); } catch {}
      setStep("response");
    } catch { setStep("error"); }
  }

  function reset() { setSituacao(""); setPensamento(""); setEmocao(""); setReacao(""); setResposta(null); setStep("form"); }
  function loadCrise(c) { setSituacao(c.situacao); setPensamento(c.pensamento||""); setEmocao(c.emocao||""); setReacao(c.reacao||""); setResposta(c.resposta); setStep("response"); }

  const cColor = resposta?.crenca_ativada === "desvalor" ? C.rose : resposta?.crenca_ativada === "desamor" ? C.gold : C.blue;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Crimson Text', Georgia, serif", color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
        textarea { outline:none; resize:none; }
        textarea::placeholder { color:${C.textLight}; opacity:1; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .fu  { animation: fadeUp 0.55s ease both; }
        .fu2 { animation: fadeUp 0.55s 0.12s ease both; }
        .fu3 { animation: fadeUp 0.55s 0.24s ease both; }
        .fu4 { animation: fadeUp 0.55s 0.36s ease both; }
        .fu5 { animation: fadeUp 0.55s 0.48s ease both; }
        .dot { animation: pulse 1.4s ease-in-out infinite; }
        .dot:nth-child(2){animation-delay:0.2s}
        .dot:nth-child(3){animation-delay:0.4s}
        .btn-outline:hover { background: ${C.bgWarm} !important; }
      `}</style>

      {showBreathing && <BreathingCircle onClose={() => setShowBreathing(false)} />}
      {showHistory   && <CrisesHistory crises={crises} onClose={() => setShowHistory(false)} onSelect={c => { loadCrise(c); setShowHistory(false); }} />}

      {/* ── HEADER ── */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 12px rgba(61,46,30,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Butterfly size={26} color={C.brownLight} />
          <div>
            <h1 style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontWeight:400, fontSize:20, letterSpacing:1, color:C.brownDark }}>
              Cartas <em style={{ color:C.gold }}>da Alma</em>
            </h1>
            <p style={{ fontSize:10, color:C.textLight, letterSpacing:2.5, marginTop:1 }}>ANDRÉA RIBEIRO · CRP 09/20938</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {[
            { label:"◯ Respirar",   action:() => setShowBreathing(true), hoverColor:C.sage  },
            { label:`◎ Histórico${crises.length > 0 ? ` (${crises.length})` : ""}`, action:() => setShowHistory(true), hoverColor:C.gold },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} className="btn-outline" style={{ background:"none", border:`1px solid ${C.border}`, color:C.textLight, padding:"7px 15px", borderRadius:40, cursor:"pointer", fontSize:12, letterSpacing:0.5, fontFamily:"inherit", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = btn.hoverColor; e.currentTarget.style.color = btn.hoverColor; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; }}
            >{btn.label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:660, margin:"0 auto", padding:"44px 20px 80px" }}>

        {/* ── FORMULÁRIO ── */}
        {step === "form" && (
          <div>
            <div className="fu" style={{ marginBottom:40, textAlign:"center" }}>
              <Butterfly size={32} color={C.brownLight} />
              <h2 style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontWeight:300, fontSize:34, lineHeight:1.3, color:C.brownDark, margin:"16px 0 10px" }}>
                Você não precisa entender tudo<br /><em>para pedir ajuda agora.</em>
              </h2>
              <p style={{ color:C.textLight, fontSize:15, lineHeight:1.75, maxWidth:480, margin:"0 auto" }}>
                Preencha os quatro campos com honestidade. Cada um deles é necessário — a ferramenta só consegue te acolher de verdade quando sabe o que você viveu, pensou, sentiu e como reagiu.
              </p>
            </div>

            <div className="fu2" style={{ background:C.bgWarm, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 18px", marginBottom:28 }}>
              <p style={{ color:C.textMid, fontSize:13.5, lineHeight:1.7 }}>
                <strong style={{ color:C.brown }}>Todos os campos são necessários.</strong> A IA não consegue gerar uma carta real sem saber o que você viveu, pensou, sentiu e como reagiu.
              </p>
            </div>

            <div className="fu3">
              <Field label="A situação — o que aconteceu" value={situacao} onChange={setSituacao} rows={5} filled={situacao.length > 2}
                placeholder="Descreva a situação que gerou a crise. Pode ser um evento, uma fala, um comportamento do outro, uma sensação que veio do nada..." />
              <Field label="O que você pensou" value={pensamento} onChange={setPensamento} filled={pensamento.length > 2}
                placeholder="O que passou pela sua mente? Pode ser um pensamento rápido, uma frase, uma conclusão sobre você ou sobre a situação..." />
            </div>

            <div className="fu4" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Field label="O que você sentiu" value={emocao} onChange={setEmocao} filled={emocao.length > 2}
                placeholder="Ansiedade, raiva, tristeza, vergonha, vazio... pode ser no corpo também." />
              <Field label="Como você reagiu" value={reacao} onChange={setReacao} filled={reacao.length > 2}
                placeholder="O que você fez ou quis fazer? Fugiu, confrontou, se fechou, chorou..." />
            </div>

            <div className="fu5" style={{ marginTop:32 }}>
              <button onClick={handleSubmit} disabled={!canSubmit} style={{ width:"100%", padding:"17px 32px", background: canSubmit ? C.brown : C.border, border:"none", borderRadius:12, color: canSubmit ? "#fff" : C.textLight, fontSize:14, letterSpacing:2, textTransform:"uppercase", fontFamily:"Crimson Text, Georgia, serif", cursor: canSubmit ? "pointer" : "not-allowed", transition:"background 0.3s", boxShadow: canSubmit ? "0 4px 20px rgba(122,92,68,0.25)" : "none" }}>
                Receber minha carta →
              </button>
              {!canSubmit && <p style={{ textAlign:"center", color:C.textLight, fontSize:13, marginTop:10 }}>Preencha os quatro campos para continuar</p>}
            </div>
          </div>
        )}

        {/* ── LOADING ── */}
        {step === "loading" && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <Butterfly size={36} color={C.brownLight} />
            <div style={{ display:"flex", justifyContent:"center", gap:8, margin:"28px 0 20px" }}>
              {[0,1,2].map(i => <div key={i} className="dot" style={{ width:8, height:8, borderRadius:"50%", background:C.gold }} />)}
            </div>
            <p style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontSize:24, fontWeight:300, color:C.brownDark, marginBottom:8 }}>Escrevendo sua carta...</p>
            <p style={{ color:C.textLight, fontSize:14, marginBottom:24 }}>Enquanto espera, respire fundo.</p>
            <button onClick={() => setShowBreathing(true)} style={{ background:"none", border:`1px solid ${C.sage}`, color:C.sage, padding:"10px 26px", borderRadius:40, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>◯ Respiração guiada agora</button>
          </div>
        )}

        {/* ── ERRO ── */}
        {step === "error" && (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <p style={{ color:C.rose, marginBottom:16, fontSize:15 }}>Algo deu errado. Tente novamente.</p>
            <button onClick={() => setStep("form")} style={{ background:"none", border:`1px solid ${C.border}`, color:C.textMid, padding:"10px 24px", borderRadius:40, cursor:"pointer", fontFamily:"inherit", fontSize:14 }}>← Voltar</button>
          </div>
        )}

        {/* ── RESPOSTA ── */}
        {step === "response" && resposta && (
          <div>
            {/* Frase de segurança + crença */}
            <div className="fu" style={{ marginBottom:40 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"4px 14px", border:`1px solid ${cColor}`, borderRadius:40, marginBottom:20 }}>
                <span style={{ fontSize:10, letterSpacing:3, color:cColor, textTransform:"uppercase" }}>Crença ativada: {resposta.crenca_ativada}</span>
              </div>
              <blockquote style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontSize:24, fontWeight:300, fontStyle:"italic", color:C.brownDark, lineHeight:1.5, borderLeft:`3px solid ${cColor}`, paddingLeft:24, margin:0 }}>
                "{resposta.frase_seguranca}"
              </blockquote>
            </div>

            {/* Acolhimento */}
            <div className="fu2" style={{ background:C.bgWarm, borderRadius:16, padding:"26px 30px", marginBottom:36, border:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <Butterfly size={18} color={C.brownLight} />
                <p style={{ fontSize:10, letterSpacing:3, color:C.textLight, textTransform:"uppercase" }}>Para você</p>
              </div>
              <p style={{ fontSize:16, lineHeight:1.85, color:C.textMid, fontStyle:"italic" }}>{resposta.acolhimento}</p>
            </div>

            {/* Cards TCC */}
            <div className="fu3">
              <RCard label="Pensamento automático identificado" accent={C.rose}>{resposta.pensamento_automatico}</RCard>
              <RCard label="Distorção cognitiva" accent={C.rose}>{resposta.distorcao_cognitiva}</RCard>
              <RCard label="Realidade equilibrada" accent={C.gold}>{resposta.realidade_equilibrada}</RCard>
              <RCard label="Ação saudável possível agora" accent={C.sage}>{resposta.acao_saudavel}</RCard>
              <RCard label="Limite saudável a proteger" accent={C.sage}>{resposta.limite_saudavel}</RCard>
            </div>

            {/* Regulação */}
            <div className="fu4" style={{ background:C.bgWarm, border:`1.5px solid ${C.sage}40`, borderRadius:16, padding:"26px 30px", marginBottom:24 }}>
              <p style={{ fontSize:10, letterSpacing:3, color:C.sage, marginBottom:12, textTransform:"uppercase" }}>Regulação do Sistema Nervoso</p>
              <p style={{ fontSize:17, color:C.brownDark, marginBottom:18, fontFamily:"Cormorant Garamond, Georgia, serif" }}>{resposta.regulacao_nervoso?.titulo}</p>
              <ol style={{ paddingLeft:22 }}>
                {resposta.regulacao_nervoso?.instrucoes?.map((inst, i) => (
                  <li key={i} style={{ color:C.textMid, fontSize:15, lineHeight:1.8, marginBottom:6 }}>{inst}</li>
                ))}
              </ol>
              <button onClick={() => setShowBreathing(true)} style={{ marginTop:18, background:"none", border:`1px solid ${C.sage}`, color:C.sage, padding:"9px 24px", borderRadius:40, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>◯ Respiração guiada agora</button>
            </div>

            {/* Âncora Bíblica */}
            <div className="fu4" style={{ background:C.bgWarm, border:`1.5px solid ${C.blue}30`, borderRadius:16, padding:"26px 30px", marginBottom:24 }}>
              <p style={{ fontSize:10, letterSpacing:3, color:C.blue, marginBottom:16, textTransform:"uppercase" }}>Âncora Bíblica</p>
              <blockquote style={{ fontFamily:"Cormorant Garamond, Georgia, serif", fontSize:20, fontStyle:"italic", color:C.brownDark, lineHeight:1.6, borderLeft:`2px solid ${C.blue}`, paddingLeft:20, marginBottom:10 }}>
                "{resposta.verdade_biblica?.versiculo}"
              </blockquote>
              <p style={{ color:C.blue, fontSize:13, marginBottom:16, paddingLeft:20 }}>— {resposta.verdade_biblica?.referencia}</p>
              <p style={{ color:C.textMid, fontSize:15, lineHeight:1.75, paddingLeft:20 }}>{resposta.verdade_biblica?.ancora}</p>
            </div>

            {/* Exemplo Bíblico */}
            <div className="fu5" style={{ marginBottom:40 }}>
              <RCard label={`Exemplo bíblico · ${resposta.exemplo_biblico?.pessoa}`} accent={C.blue}>{resposta.exemplo_biblico?.paralelo}</RCard>
            </div>

            {/* Rodapé da carta */}
            <div style={{ background:C.bgDeep, borderRadius:12, padding:"18px 22px", marginBottom:28, border:`1px solid ${C.border}` }}>
              <p style={{ fontSize:10, letterSpacing:2, color:C.textLight, marginBottom:8, textTransform:"uppercase" }}>Situação registrada</p>
              <p style={{ color:C.textMid, fontSize:14, lineHeight:1.7 }}>{situacao}</p>
            </div>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <button onClick={reset} style={{ flex:1, minWidth:200, padding:"15px 24px", background:C.brown, border:"none", borderRadius:12, color:"#fff", fontSize:13, letterSpacing:1, fontFamily:"inherit", cursor:"pointer", boxShadow:"0 4px 16px rgba(122,92,68,0.2)" }}>
                + Nova crise
              </button>
              <button onClick={() => setShowHistory(true)} style={{ flex:1, minWidth:200, padding:"15px 24px", background:"none", border:`1px solid ${C.border}`, borderRadius:12, color:C.textMid, fontSize:13, letterSpacing:1, fontFamily:"inherit", cursor:"pointer" }}>
                ◎ Ver histórico
              </button>
            </div>

            <p style={{ textAlign:"center", color:C.textLight, fontSize:12, marginTop:32, letterSpacing:0.5 }}>
              Andréa Ribeiro · Especialista Cognitivo Comportamental · CRP 09/20938
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
