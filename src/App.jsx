import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================
// 포켓몬 초고난도 퀴즈 웹앱 (단일 파일)
// - 프레임워크: React (단일 컴포넌트)
// - 스타일: Tailwind CSS (CDN) - 없으면 기본 동작
// - 데이터: 샘플 포켓몬 일부 (확장/붙여넣기 지원)
// - 기능:
//    1) 초성으로 포켓몬 맞추기
//    2) 포켓몬을 보고 타입 맞추기
//    3) 포켓몬을 보고 종족값(6스탯) 맞추기
// - 난이도: 매우 어려움(짧은 제한시간, 정답 일치 기준, 감점)
// - 기타: 로컬 리더보드, JSON 데이터 붙여넣기 임포트, 이미지 URL 지원
// =============================

// ===== 유틸: 한글 초성 추출 =====
const CHO = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ",
  "ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
];
function getChoseong(str){
  let out = "";
  for(const ch of str){
    const code = ch.charCodeAt(0);
    if(code >= 0xAC00 && code <= 0xD7A3){
      const base = code - 0xAC00;
      const choIndex = Math.floor(base / (21 * 28));
      out += CHO[choIndex];
    } else if(/[A-Za-z0-9]/.test(ch)) {
      out += ch.toUpperCase();
    } else if(/[ㄱ-ㅎ]/.test(ch)) {
      out += ch;
    } else {
      // 공백/기호는 유지하지 않음
    }
  }
  return out;
}

// ===== 타입(한국어) 표준 집합 =====
const KOR_TYPES = [
  "노말","불꽃","물","전기","풀","얼음","격투","독","땅","비행",
  "에스퍼","벌레","바위","고스트","드래곤","악","강철","페어리"
];

// ===== 샘플 데이터 =====
const SAMPLE_POKEMON = [
  {
    dex: 25,
    korean_name: "피카츄",
    english_name: "Pikachu",
    types: ["전기"],
    base_stats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    image_url: ""
  },
  {
    dex: 1,
    korean_name: "이상해씨",
    english_name: "Bulbasaur",
    types: ["풀","독"],
    base_stats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    image_url: ""
  },
  {
    dex: 4,
    korean_name: "파이리",
    english_name: "Charmander",
    types: ["불꽃"],
    base_stats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    image_url: ""
  },
  {
    dex: 7,
    korean_name: "꼬부기",
    english_name: "Squirtle",
    types: ["물"],
    base_stats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    image_url: ""
  },
  {
    dex: 130,
    korean_name: "갸라도스",
    english_name: "Gyarados",
    types: ["물","비행"],
    base_stats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
    image_url: ""
  },
  {
    dex: 94,
    korean_name: "팬텀",
    english_name: "Gengar",
    types: ["고스트","독"],
    base_stats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    image_url: ""
  },
  {
    dex: 149,
    korean_name: "망나뇽",
    english_name: "Dragonite",
    types: ["드래곤","비행"],
    base_stats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
    image_url: ""
  },
  {
    dex: 133,
    korean_name: "이브이",
    english_name: "Eevee",
    types: ["노말"],
    base_stats: { hp: 55, atk: 55, def: 50, spa: 45, spd: 65, spe: 55 },
    image_url: ""
  },
  {
    dex: 448,
    korean_name: "루카리오",
    english_name: "Lucario",
    types: ["격투","강철"],
    base_stats: { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90 },
    image_url: ""
  },
  {
    dex: 6,
    korean_name: "리자몽",
    english_name: "Charizard",
    types: ["불꽃","비행"],
    base_stats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    image_url: ""
  },
  {
    "dex": 430,
    "korean_name": "돈크로우",
    "english_name": "Honchkrow",
    "types": [
      "악",
      "비행"
    ],
    "base_stats": {
      "hp": 100,
      "atk": 125,
      "def": 52,
      "spa": 105,
      "spd": 52,
      "spe": 71
    },
    "image_url": ""
  },
  {
    "dex": 229,
    "korean_name": "헬가",
    "english_name": "Houndoom",
    "types": [
      "악",
      "불꽃"
    ],
    "base_stats": {
      "hp": 75,
      "atk": 90,
      "def": 50,
      "spa": 110,
      "spd": 80,
      "spe": 95
    },
    "image_url": ""
  },
  {
    "dex": 19,
    "korean_name": "꼬렛",
    "english_name": "Rattata",
    "types": [
      "노말"
    ],
    "base_stats": {
      "hp": 30,
      "atk": 56,
      "def": 35,
      "spa": 25,
      "spd": 35,
      "spe": 72
    },
    "image_url": ""
  },
  {
    "dex": 381,
    "korean_name": "라티오스",
    "english_name": "Latios",
    "types": [
      "드래곤",
      "에스퍼"
    ],
    "base_stats": {
      "hp": 80,
      "atk": 90,
      "def": 80,
      "spa": 130,
      "spd": 110,
      "spe": 110
    },
    "image_url": ""
  },
  {
    "dex": 380,
    "korean_name": "라티아스",
    "english_name": "Latias",
    "types": [
      "드래곤",
      "에스퍼"
    ],
    "base_stats": {
      "hp": 80,
      "atk": 80,
      "def": 90,
      "spa": 110,
      "spd": 130,
      "spe": 110
    },
    "image_url": ""
  },
  {
    "dex": 95,
    "korean_name": "롱스톤",
    "english_name": "Onix",
    "types": [
      "바위",
      "땅"
    ],
    "base_stats": {
      "hp": 35,
      "atk": 45,
      "def": 160,
      "spa": 30,
      "spd": 45,
      "spe": 70
    },
    "image_url": ""
  },
  {
    "dex": 157,
    "korean_name": "블레이범",
    "english_name": "Typhlosion",
    "types": [
      "불꽃"
    ],
    "base_stats": {
      "hp": 78,
      "atk": 84,
      "def": 78,
      "spa": 109,
      "spd": 85,
      "spe": 100
    },
    "image_url": ""
  },
  {
    "dex": 823,
    "korean_name": "아머까오",
    "english_name": "Corviknight",
    "types": [
      "비행",
      "강철"
    ],
    "base_stats": {
      "hp": 98,
      "atk": 87,
      "def": 105,
      "spa": 53,
      "spd": 85,
      "spe": 67
    },
    "image_url": ""
  },
  {
    "dex": 658,
    "korean_name": "개굴닌자",
    "english_name": "Greninja",
    "types": [
      "물",
      "악"
    ],
    "base_stats": {
      "hp": 72,
      "atk": 95,
      "def": 67,
      "spa": 103,
      "spd": 71,
      "spe": 122
    },
    "image_url": ""
  },
  {
    "dex": 121,
    "korean_name": "아쿠스타",
    "english_name": "Starmie",
    "types": [
      "물",
      "에스퍼"
    ],
    "base_stats": {
      "hp": 60,
      "atk": 75,
      "def": 85,
      "spa": 100,
      "spd": 85,
      "spe": 115
    },
    "image_url": ""
  },
  {
    "dex": 217,
    "korean_name": "링곰",
    "english_name": "Ursaring",
    "types": [
      "노말"
    ],
    "base_stats": {
      "hp": 90,
      "atk": 130,
      "def": 75,
      "spa": 75,
      "spd": 75,
      "spe": 55
    },
    "image_url": ""
  }
];

// ===== 로컬 스토리지 키 =====
const LS_DATA_KEY = "pokemon_quiz_data_v1";
const LS_SCORE_KEY = "pokemon_quiz_scores_v1";

function useLocalStorage(key, initial){
  const [state, setState] = useState(()=>{
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    }catch{
      return initial;
    }
  });
  useEffect(()=>{
    try{
      localStorage.setItem(key, JSON.stringify(state));
    }catch{}
  },[key,state]);
  return [state, setState];
}

// ===== 난이도/채점 규칙 =====
const DIFFICULTY = {
  timePerQuestionSec: 15,
  wrongPenalty: -2,
  correctReward: 5,
  statExactOnly: true,
};

// ===== 공통 UI 컴포넌트 =====
function Panel({title, children, right}){
  return (
    <div className="w-full rounded-2xl shadow p-4 md:p-6 bg-white/80 backdrop-blur border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div>{right}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Badge({children}){
  return <span className="inline-block px-2 py-0.5 text-xs rounded-full border bg-white/70">{children}</span>;
}

function StatRow({label, value}){
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

// ===== 메인 앱 =====
export default function App(){
  const [data, setData] = useLocalStorage(LS_DATA_KEY, SAMPLE_POKEMON);
  const [mode, setMode] = useState("choseong"); // "choseong" | "types" | "stats"
  const [running, setRunning] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [order, setOrder] = useState([]); // 섞인 인덱스 배열
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(DIFFICULTY.timePerQuestionSec);
  const [answer, setAnswer] = useState("");
  const [typeAnswers, setTypeAnswers] = useState(["",""]);
  const [statAnswers, setStatAnswers] = useState({hp:"", atk:"", def:"", spa:"", spd:"", spe:""});
  const [history, setHistory] = useLocalStorage(LS_SCORE_KEY, []);

  const timerRef = useRef(null);

  const shuffledData = useMemo(()=>{
    const idx = data.map((_,i)=>i);
    for(let i=idx.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  },[data]);

  useEffect(()=>{ setOrder(shuffledData); },[shuffledData]);

  useEffect(()=>{
    if(!running) return;
    setTimeLeft(DIFFICULTY.timePerQuestionSec);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => {
        if(t <= 1){
          handleSubmit("TIMEOUT");
          return DIFFICULTY.timePerQuestionSec;
        }
        return t-1;
      });
    },1000);
    return ()=> timerRef.current && clearInterval(timerRef.current);
  },[running, qIndex, mode]);

  const current = order.length ? data[order[qIndex % order.length]] : null;

  function resetGame(){
    setScore(0);
    setLives(3);
    setQIndex(0);
    setAnswer("");
    setTypeAnswers(["",""]);
    setStatAnswers({hp:"", atk:"", def:"", spa:"", spd:"", spe:""});
    setRunning(false);
  }

  function start(){
    setRunning(true);
    setScore(0);
    setLives(3);
    setQIndex(0);
  }

  function finishIfDead(nextLives){
    if(nextLives <= 0){
      setRunning(false);
      setHistory(h => [{
        ts: Date.now(), mode, score
      }, ...h].slice(0,50));
    }
  }

  function handleSubmit(reason="SUBMIT"){
    if(!current) return;
    let correct = false;

    if(mode === "choseong"){
      const user = normalizeKor(answer);
      const truth = normalizeKor(current.korean_name);
      correct = (user === truth);
    }

    if(mode === "types"){
      const userTypes = typeAnswers.map(t => t.trim()).filter(Boolean);
      const truth = current.types;
      correct = (userTypes.length === truth.length) &&
                userTypes.every(t => truth.includes(t));
    }

    if(mode === "stats"){
      const keys = ["hp","atk","def","spa","spd","spe"];
      correct = keys.every(k => String(parseInt(statAnswers[k]||"",10)) === String(current.base_stats[k]));
    }

    if(correct){
      setScore(s => s + DIFFICULTY.correctReward);
      setQIndex(i => i+1);
      setAnswer("");
      setTypeAnswers(["",""]);
      setStatAnswers({hp:"", atk:"", def:"", spa:"", spd:"", spe:""});
      setTimeLeft(DIFFICULTY.timePerQuestionSec);
    } else {
      setScore(s => s + DIFFICULTY.wrongPenalty);
      setLives(l => {
        const next = l-1;
        finishIfDead(next);
        return next;
      });
      setQIndex(i => i+1);
      setAnswer("");
      setTypeAnswers(["",""]);
      setStatAnswers({hp:"", atk:"", def:"", spa:"", spd:"", spe:""});
      setTimeLeft(DIFFICULTY.timePerQuestionSec);
    }
  }

  function normalizeKor(s){
    return s.replace(/\s+/g, "").trim();
  }

  function importJson(){
    const raw = prompt("포켓몬 JSON 배열을 붙여넣으세요 (덮어쓰기). 예시 구조는 화면 우측 상단의 i 버튼 참고.");
    if(!raw) return;
    try{
      const parsed = JSON.parse(raw);
      if(!Array.isArray(parsed)) throw new Error("배열이 아님");
      for(const p of parsed){
        if(typeof p.korean_name !== 'string' || !Array.isArray(p.types) || !p.base_stats){
          throw new Error("필수 필드 누락: korean_name, types[], base_stats");
        }
      }
      setData(parsed);
      alert(`가져오기 완료! ${parsed.length}마리 적용.`);
    }catch(e){
      alert("가져오기 실패: " + e.message);
    }
  }

  function exportJson(){
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pokemon_quiz_data.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 to-indigo-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">포켓몬 초고난도 퀴즈</h1>
          <div className="flex items-center gap-2">
            <button onClick={exportJson} className="px-3 py-1.5 rounded-xl border bg-white/70">데이터 내보내기</button>
            <button onClick={importJson} className="px-3 py-1.5 rounded-xl border bg-white">데이터 가져오기</button>
            <InfoPopover />
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          <Panel title="모드">
            <div className="flex flex-wrap gap-2">
              <ModeButton label="초성 퀴즈" active={mode==="choseong"} onClick={()=>setMode("choseong")} />
              <ModeButton label="타입 맞추기" active={mode==="types"} onClick={()=>setMode("types")} />
              <ModeButton label="종족값 맞추기" active={mode==="stats"} onClick={()=>setMode("stats")} />
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <p>⏱️ 문항당 {DIFFICULTY.timePerQuestionSec}초 • ✅ 정답 +{DIFFICULTY.correctReward} • ❌ 오답 {DIFFICULTY.wrongPenalty}</p>
            </div>
          </Panel>

          <Panel title="진행 상태" right={<Badge>매우 어려움</Badge>}>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-600">점수</div>
                <div className="text-2xl font-bold">{score}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">목숨</div>
                <div className="text-2xl font-bold">{"❤".repeat(Math.max(lives,0)) || "✖"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600">남은시간</div>
                <div className={`text-2xl font-bold ${timeLeft<=5?"text-red-600":""}`}>{running? timeLeft : "-"}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {!running ? (
                <button onClick={start} className="w-full px-3 py-2 rounded-xl bg-indigo-600 text-white">시작</button>
              ): (
                <>
                  <button onClick={()=>handleSubmit()} className="w-1/2 px-3 py-2 rounded-xl bg-emerald-600 text-white">제출</button>
                  <button onClick={resetGame} className="w-1/2 px-3 py-2 rounded-xl border bg-white">포기</button>
                </>
              )}
            </div>
          </Panel>

          <Panel title="리더보드">
            <Leaderboard history={history} />
          </Panel>
        </div>

        <Panel title="문제">
          {!current ? (
            <div>데이터가 없습니다. 우측 상단의 데이터 가져오기를 이용하세요.</div>
          ) : (
            <QuestionView
              mode={mode}
              pokemon={current}
              index={qIndex+1}
              choseong={getChoseong(current.korean_name)}
              answer={answer}
              setAnswer={setAnswer}
              typeAnswers={typeAnswers}
              setTypeAnswers={setTypeAnswers}
              statAnswers={statAnswers}
              setStatAnswers={setStatAnswers}
            />
          )}
        </Panel>

        <Panel title="현재 포켓몬 정보 (학습/검증용 — 실제 라운드 중엔 스스로 보지 마세요!)">
          {current && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm">도감번호 #{current.dex}</div>
                <div className="text-lg font-semibold">{current.korean_name} <span className="text-gray-500">/ {current.english_name}</span></div>
                <div className="flex gap-2">
                  {current.types.map((t,i)=>(<Badge key={i}>{t}</Badge>))}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 max-w-xs">
                  <StatRow label="HP" value={current.base_stats.hp} />
                  <StatRow label="Atk" value={current.base_stats.atk} />
                  <StatRow label="Def" value={current.base_stats.def} />
                  <StatRow label="SpA" value={current.base_stats.spa} />
                  <StatRow label="SpD" value={current.base_stats.spd} />
                  <StatRow label="Spe" value={current.base_stats.spe} />
                </div>
                <div className="text-sm text-gray-600">BST 합계: {Object.values(current.base_stats).reduce((a,b)=>a+b,0)}</div>
              </div>
              <div className="flex items-center justify-center">
                {current.image_url ? (
                  <img src={current.image_url} alt={current.korean_name} className="max-h-64 object-contain"/>
                ) : (
                  <div className="h-48 w-48 rounded-2xl border grid place-items-center text-gray-500">이미지 없음</div>
                )}
              </div>
            </div>
          )}
        </Panel>

        <Panel title="데이터 관리 / 규격">
          <p className="text-sm text-gray-700 leading-relaxed">
            JSON 배열로 포켓몬을 임포트할 수 있습니다. 각 항목은 다음 필드를 권장합니다.<br/>
            <code className="bg-gray-100 px-1 py-0.5 rounded">{`{ dex:number, korean_name:string, english_name:string, types:string[], base_stats:{hp,atk,def,spa,spd,spe}, image_url?:string }`}</code><br/>
            <span className="text-gray-500">타입은 한국어 표기(예: 전기, 풀, 독, 비행...)로 입력하세요. 정답 판정은 순서 무시 일치입니다.</span>
          </p>
        </Panel>
      </div>
    </div>
  );
}

function ModeButton({label, active, onClick}){
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-xl border ${active?"bg-indigo-600 text-white":"bg-white"}`}>{label}</button>
  );
}

function QuestionView({mode, pokemon, index, choseong, answer, setAnswer, typeAnswers, setTypeAnswers, statAnswers, setStatAnswers}){
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Q{index}</div>
        <Badge>{mode === 'choseong' ? '초성' : mode === 'types' ? '타입' : '종족값'}</Badge>
      </div>

      {mode === 'choseong' && (
        <div className="space-y-3">
          <div className="text-5xl font-black tracking-widest select-none">{getChoseong(pokemon.korean_name)}</div>
          <input
            autoFocus
            value={answer}
            onChange={e=>setAnswer(e.target.value)}
            placeholder="정답(한국어 전체 이름)"
            className="w-full px-3 py-2 rounded-xl border"
          />
          <div className="text-xs text-gray-500">공백 무시, 정확 일치</div>
        </div>
      )}

      {mode === 'types' && (
        <div className="space-y-3">
          <PreviewOrName pokemon={pokemon} />
          <div className="grid grid-cols-2 gap-2 max-w-xl">
            {[0,1].map(i=> (
              <input key={i} value={typeAnswers[i]}
                onChange={e=>{
                  const next = [...typeAnswers]; next[i] = e.target.value; setTypeAnswers(next);
                }}
                placeholder={i===0?"1타입 (예: 전기)":"2타입 (없으면 비워두기)"}
                list="type-list"
                className="px-3 py-2 rounded-xl border"
              />
            ))}
          </div>
          <datalist id="type-list">
            {KOR_TYPES.map(t=>(<option key={t} value={t} />))}
          </datalist>
          <div className="text-xs text-gray-500">순서 무시, 정확 일치 (2타입 포켓몬은 둘 다 입력)</div>
        </div>
      )}

      {mode === 'stats' && (
        <div className="space-y-3">
          <PreviewOrName pokemon={pokemon} />
          <div className="grid grid-cols-3 gap-2 max-w-xl">
            <StatInput label="HP"  value={statAnswers.hp}  onChange={v=>setStatAnswers(s=>({...s,hp:v}))} />
            <StatInput label="Atk" value={statAnswers.atk} onChange={v=>setStatAnswers(s=>({...s,atk:v}))} />
            <StatInput label="Def" value={statAnswers.def} onChange={v=>setStatAnswers(s=>({...s,def:v}))} />
            <StatInput label="SpA" value={statAnswers.spa} onChange={v=>setStatAnswers(s=>({...s,spa:v}))} />
            <StatInput label="SpD" value={statAnswers.spd} onChange={v=>setStatAnswers(s=>({...s,spd:v}))} />
            <StatInput label="Spe" value={statAnswers.spe} onChange={v=>setStatAnswers(s=>({...s,spe:v}))} />
          </div>
          <div className="text-xs text-gray-500">완전 일치만 정답 (부분 점수 없음)</div>
        </div>
      )}
    </div>
  );
}

function PreviewOrName({pokemon}){
  return (
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 rounded-2xl border grid place-items-center bg-white">
        {pokemon.image_url ? (
          <img src={pokemon.image_url} alt={pokemon.korean_name} className="h-24 object-contain" />
        ) : (
          <span className="text-xs text-gray-500">이미지 없음</span>
        )}
      </div>
      <div>
        <div className="text-lg font-semibold">{pokemon.korean_name}</div>
        <div className="text-gray-500">#{pokemon.dex} / {pokemon.english_name}</div>
      </div>
    </div>
  );
}

function StatInput({label, value, onChange}){
  return (
    <label className="text-sm">
      <div className="text-gray-600 mb-1">{label}</div>
      <input inputMode="numeric" pattern="[0-9]*" value={value}
             onChange={e=>onChange(e.target.value.replace(/[^0-9]/g, ''))}
             placeholder="숫자"
             className="w-full px-3 py-2 rounded-xl border" />
    </label>
  );
}

function Leaderboard({history}){
  if(!history.length) return <div className="text-sm text-gray-500">기록 없음</div>;
  return (
    <div className="space-y-2 max-h-56 overflow-auto pr-1">
      {history.map((h,i)=> (
        <div key={i} className="flex items-center justify-between text-sm border rounded-xl px-3 py-2 bg-white/60">
          <div className="truncate">{new Date(h.ts).toLocaleString()}</div>
          <div className="flex items-center gap-2">
            <Badge>{h.mode === 'choseong' ? '초성' : h.mode === 'types' ? '타입' : '종족값'}</Badge>
            <span className="font-semibold">{h.score}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoPopover(){
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="px-2.5 py-1.5 rounded-xl border bg-white text-sm">i</button>
      {open && (
        <div className="absolute right-0 mt-2 w-[28rem] max-w-[90vw] p-4 rounded-2xl shadow bg-white text-sm border z-10">
          <div className="font-semibold mb-1">데이터 입력 규격</div>
          <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">{`
[
  {
    "dex": 25,
    "korean_name": "피카츄",
    "english_name": "Pikachu",
    "types": ["전기"],
    "base_stats": {"hp":35, "atk":55, "def":40, "spa":50, "spd":50, "spe":90},
    "image_url": "https://...optional..."
  }
]
`}</pre>
          <div className="mt-2 text-gray-600">• 타입 표기(한국어): {KOR_TYPES.join(", ")}</div>
          <div className="mt-1">• "종족값 맞추기"는 여섯 스탯이 모두 정확해야 정답 처리됩니다.</div>
          <div className="mt-1">• 이미지는 저작권을 준수하며 직접 제공한 URL만 표시합니다.</div>
        </div>
      )}
    </div>
  );
}
