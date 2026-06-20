const wordInput = document.querySelector("#wordInput");
const buildButton = document.querySelector("#buildButton");
const resetButton = document.querySelector("#resetButton");
const resultPanel = document.querySelector("#resultPanel");
const resultBadge = document.querySelector("#resultBadge");
const resultTitle = document.querySelector("#resultTitle");
const resultSummary = document.querySelector("#resultSummary");
const processList = document.querySelector("#processList");
const evidenceTable = document.querySelector("#evidenceTable");
const noticeBox = document.querySelector("#noticeBox");

const autoDictionary = {
  귀찮다: ["state", "no", "no", "yes", "no", "no"],
  배고프다: ["state", "no", "no", "yes", "no", "no"],
  아프다: ["state", "no", "no", "yes", "no", "no"],
  슬프다: ["state", "no", "no", "yes", "no", "no"],
  기쁘다: ["state", "no", "no", "yes", "no", "no"],
  바쁘다: ["state", "no", "no", "yes", "no", "no"],
  부럽다: ["state", "no", "no", "yes", "no", "no"],
  무섭다: ["state", "no", "no", "yes", "no", "no"],
  덥다: ["state", "no", "no", "yes", "no", "no"],
  춥다: ["state", "no", "no", "yes", "no", "no"],
  쉽다: ["state", "no", "no", "yes", "no", "no"],
  어렵다: ["state", "no", "no", "yes", "no", "no"],
  가볍다: ["state", "no", "no", "yes", "no", "no"],
  무겁다: ["state", "no", "no", "yes", "no", "no"],
  고맙다: ["state", "no", "no", "yes", "no", "no"],
  반갑다: ["state", "no", "no", "yes", "no", "no"],
  즐겁다: ["state", "no", "no", "yes", "no", "no"],
  괴롭다: ["state", "no", "no", "yes", "no", "no"],
  외롭다: ["state", "no", "no", "yes", "no", "no"],
  새롭다: ["state", "no", "no", "yes", "no", "no"],
  날카롭다: ["state", "no", "no", "yes", "no", "no"],
  아름답다: ["state", "no", "no", "yes", "no", "no"],
  우습다: ["state", "no", "no", "yes", "no", "no"],
  시끄럽다: ["state", "no", "no", "yes", "no", "no"],
  어둡다: ["state", "no", "no", "yes", "no", "no"],
};

const knownVerbs = new Set([
  "가다",
  "오다",
  "먹다",
  "읽다",
  "쓰다",
  "보다",
  "듣다",
  "걷다",
  "뛰다",
  "자다",
  "웃다",
  "울다",
  "만들다",
  "공부하다",
  "운동하다",
  "크다",
  "늦다",
  "밝다",
]);

const knownAdjectives = new Set([
  "예쁘다",
  "좋다",
  "싫다",
  "빠르다",
  "느리다",
  "높다",
  "낮다",
  "많다",
  "적다",
  "작다",
  "넓다",
  "좁다",
  "길다",
  "짧다",
  "밝다",
  "깨끗하다",
  "조용하다",
  "맛있다",
  "재미있다",
  "안녕하다",
  "크다",
  "늦다",
]);

const invalidWords = new Set([
  "사과",
  "학교",
  "학생",
  "책",
  "나무",
  "오늘",
  "매우",
  "아주",
  "그리고",
  "은",
  "는",
  "이",
  "가",
  "을",
  "를",
  "에",
  "에서",
  "으로",
  "와",
  "과",
  "바다",
  "소다",
  "마다",
  "게다가",
]);

const verbSuffixRules = [
  {
    suffix: "는구나",
    score: 4,
    label: "-는구나",
    description: "현재 시제 선어말 어미 '-는-'이 들어간 감탄형이므로 동사 근거입니다.",
  },
  {
    suffix: "느냐",
    score: 3,
    label: "-느냐",
    description: "현재 시제 선어말 어미 '-느-' 계열이 드러나므로 동사 근거입니다.",
  },
  {
    suffix: "는다",
    score: 4,
    label: "-는다",
    description: "현재 시제 선어말 어미 '-는-'과 평서형 어미가 결합했으므로 동사 근거입니다.",
  },
  {
    suffix: "어라",
    score: 4,
    label: "-어라",
    description: "명령형 어미와 결합했으므로 동사 근거입니다.",
  },
  {
    suffix: "아라",
    score: 4,
    label: "-아라",
    description: "명령형 어미와 결합했으므로 동사 근거입니다.",
  },
  {
    suffix: "자",
    score: 4,
    label: "-자",
    description: "청유형 어미와 결합했으므로 동사 근거입니다.",
  },
  {
    suffix: "는",
    score: 3,
    label: "-는",
    description: "현재 시제 관형사형 어미 '-는'과 결합했으므로 동사 근거입니다.",
  },
];

const adjectiveSuffixRules = [
  {
    suffix: "구나",
    score: 4,
    label: "-구나",
    description: "선어말 어미 '-는-' 없이 감탄형 어미 '-구나'와 결합했으므로 형용사 근거입니다.",
  },
  {
    suffix: "은",
    score: 3,
    label: "-은",
    description: "현재 시제 관형사형 어미 '-(으)ㄴ' 계열과 결합했으므로 형용사 근거입니다.",
  },
];

function trimInput(value) {
  return value.trim().replace(/\s+/g, "");
}

function isValidKoreanText(text) {
  return /^[가-힣]+$/.test(text);
}

function hasFinalConsonant(text, consonantIndex) {
  if (!text) return false;
  const code = text.charCodeAt(text.length - 1);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 === consonantIndex;
}

function endsWithFinalNieun(text) {
  return hasFinalConsonant(text, 4);
}

function isPresentPlainWithNieun(text) {
  if (!text.endsWith("다") || text.length < 2) return false;
  const beforeDa = text.slice(0, -1);
  return endsWithFinalNieun(beforeDa);
}

function analyzeWord() {
  const input = trimInput(wordInput.value);

  if (!input) {
    wordInput.focus();
    return;
  }

  const analysis = analyzeEnding(input);
  renderAnalysis(analysis);
}

function analyzeEnding(input) {
  if (!isValidKoreanText(input) || invalidWords.has(input)) {
    return makeInvalidAnalysis(input);
  }

  const evidence = [];

  for (const rule of verbSuffixRules) {
    if (input.endsWith(rule.suffix)) {
      evidence.push(makeEvidence("verb", rule, input));
      break;
    }
  }

  const hasVerbSuffixEvidence = evidence.some((item) => item.kind === "verb");
  if (!hasVerbSuffixEvidence && isPresentPlainWithNieun(input)) {
    evidence.push(
      makeEvidence("verb", {
        score: 4,
        label: "-ㄴ다",
        description: "현재 시제 선어말 어미 '-ㄴ-'과 평서형 어미가 결합했으므로 동사 근거입니다.",
      }, input),
    );
  }

  if (!evidence.some((item) => item.kind === "verb")) {
    for (const rule of adjectiveSuffixRules) {
      if (input.endsWith(rule.suffix)) {
        evidence.push(makeEvidence("adjective", rule, input));
        break;
      }
    }
  }

  if (!evidence.some((item) => item.kind === "verb") && endsWithFinalNieun(input) && !input.endsWith("은")) {
    evidence.push(
      makeEvidence("adjective", {
        score: 3,
        label: "-ㄴ",
        description: "현재 시제 관형사형 어미 '-ㄴ'과 결합한 형태로 보이므로 형용사 근거입니다.",
      }, input),
    );
  }

  if (hasDecisiveEvidence(evidence)) {
    return makeAnalysis(input, evidence);
  }

  if (evidence.length === 0) {
    return analyzeBaseForm(input);
  }

  return makeAnalysis(input, evidence);
}

function analyzeBaseForm(input) {
  if (!input.endsWith("다")) {
    return makeInvalidAnalysis(input);
  }

  const inVerbDictionary = knownVerbs.has(input);
  const inAdjectiveDictionary = knownAdjectives.has(input) || Boolean(autoDictionary[input]);

  if (inVerbDictionary && inAdjectiveDictionary) {
    return makeAnalysis(input, [
      {
        kind: "hold",
        score: 0,
        label: "품사 통용어 기본형",
        description: "동사와 형용사로 모두 쓰이는 단어입니다. 기본형만으로는 판정할 수 없습니다.",
        example: input,
      },
    ]);
  }

  if (inVerbDictionary) {
    return makeAnalysis(input, [
      {
        kind: "verb",
        score: 3,
        label: "동사 사전 기본형",
        description: "활용형 어미 근거가 없고, 내장 동사 사전에만 등록된 기본형입니다.",
        example: input,
      },
    ]);
  }

  if (inAdjectiveDictionary) {
    return makeAnalysis(input, [
      {
        kind: "adjective",
        score: 3,
        label: autoDictionary[input] ? "형용사 자동화 사전 기본형" : "형용사 사전 기본형",
        description: "활용형 어미 근거가 없고, 내장 형용사 사전에만 등록된 기본형입니다.",
        example: input,
      },
    ]);
  }

  return makeAnalysis(input, [
    {
      kind: "hold",
      score: 0,
      label: "미등록 기본형",
      description: "사전에 등록되지 않은 단어입니다. 판정할 수 없으므로 활용형을 입력해야 합니다.",
      example: input,
    },
  ]);
}

function makeEvidence(kind, rule, input) {
  return {
    kind,
    score: rule.score,
    label: rule.label,
    description: rule.description,
    example: input,
  };
}

function makeInvalidAnalysis(input) {
  return {
    input,
    result: "invalid",
    verbScore: 0,
    adjectiveScore: 0,
    evidence: [],
    invalid: true,
  };
}

function hasDecisiveEvidence(evidence) {
  const verbScore = sumEvidence(evidence, "verb");
  const adjectiveScore = sumEvidence(evidence, "adjective");
  return Math.abs(verbScore - adjectiveScore) >= 2 && (verbScore > 0 || adjectiveScore > 0);
}

function makeAnalysis(input, evidence) {
  const verbScore = sumEvidence(evidence, "verb");
  const adjectiveScore = sumEvidence(evidence, "adjective");
  const result = decideResult(verbScore, adjectiveScore, evidence);

  return {
    input,
    result,
    verbScore,
    adjectiveScore,
    evidence,
    invalid: result === "invalid",
  };
}

function sumEvidence(evidence, kind) {
  return evidence
    .filter((item) => item.kind === kind)
    .reduce((sum, item) => sum + item.score, 0);
}

function decideResult(verbScore, adjectiveScore, evidence) {
  if (evidence.some((item) => item.kind === "hold")) return "hold";
  if (verbScore === 0 && adjectiveScore === 0) return "invalid";
  if (Math.abs(verbScore - adjectiveScore) < 2) return "hold";
  return verbScore > adjectiveScore ? "verb" : "adjective";
}

function renderAnalysis(analysis) {
  if (analysis.invalid || analysis.result === "invalid") {
    renderInvalid(analysis.input);
    return;
  }

  const labels = {
    verb: "동사",
    adjective: "형용사",
    hold: "판정 유보",
  };

  setResultState(analysis.result);
  resultTitle.textContent = `결론: ${labels[analysis.result]}`;
  resultSummary.textContent = makeSummary(analysis);
  processList.innerHTML = makeProcessItems(analysis);
  evidenceTable.innerHTML = makeEvidenceRows(analysis);
  noticeBox.textContent = makeNotice(analysis);
  resultPanel.classList.remove("hidden");
}

function renderInvalid(input) {
  setResultState("invalid");
  resultTitle.textContent = "결론: 판별 불가";
  resultSummary.textContent = `‘${input}’는 용언의 활용형이 아니므로 문맥 판별을 할 수 없습니다.`;
  processList.innerHTML = `
    <li>입력값이 한글 용언 활용형인지 확인했습니다.</li>
    <li>동사/형용사 어미 규칙에 해당하는 형태를 찾지 못해 분석을 중단했습니다.</li>
  `;
  evidenceTable.innerHTML = `
    <tr>
      <td>동사</td>
      <td>0</td>
      <td>발견된 활용 어미 없음</td>
    </tr>
    <tr>
      <td>형용사</td>
      <td>0</td>
      <td>발견된 활용 어미 없음</td>
    </tr>
  `;
  noticeBox.textContent = "예: 먹는다, 예쁜, 크는구나, 귀찮다처럼 용언의 활용형이나 기본형을 입력하세요.";
  resultPanel.classList.remove("hidden");
}

function setResultState(result) {
  resultBadge.className = `result-badge ${result}`;
  const labels = {
    verb: "동사",
    adjective: "형용사",
    hold: "판정 유보",
    invalid: "판별 불가",
  };
  resultBadge.textContent = labels[result] ?? "판정 대기";
}

function makeSummary(analysis) {
  const scoreText = `동사 ${analysis.verbScore}점, 형용사 ${analysis.adjectiveScore}점`;
  const strongest = analysis.evidence[0]?.label ?? "활용 어미";

  if (analysis.result === "verb") {
    return `‘${analysis.input}’에서 ${strongest} 근거가 발견되어 ${scoreText}으로 동사로 판정했습니다.`;
  }
  if (analysis.result === "adjective") {
    return `‘${analysis.input}’에서 ${strongest} 근거가 발견되어 ${scoreText}으로 형용사로 판정했습니다.`;
  }
  return `‘${analysis.input}’는 ${scoreText}입니다. ${strongest} 단계에서 판정이 유보되었습니다.`;
}

function makeProcessItems(analysis) {
  return analysis.evidence
    .map((item) => `<li>${item.label}: ‘${item.example}’ → ${item.description}</li>`)
    .join("");
}

function makeEvidenceRows(analysis) {
  return `
    <tr>
      <td>동사</td>
      <td>${analysis.verbScore}</td>
      <td>${collectReasons(analysis.evidence, "verb")}</td>
    </tr>
    <tr>
      <td>형용사</td>
      <td>${analysis.adjectiveScore}</td>
      <td>${collectReasons(analysis.evidence, "adjective")}</td>
    </tr>
  `;
}

function collectReasons(evidence, kind) {
  const reasons = evidence.filter((item) => item.kind === kind).map((item) => item.label);
  return reasons.length > 0 ? reasons.join(", ") : "뚜렷한 근거 없음";
}

function makeNotice(analysis) {
  if (analysis.result === "hold") {
    const holdEvidence = analysis.evidence.find((item) => item.kind === "hold");
    if (holdEvidence?.label === "미등록 기본형") {
      return "사전에 등록되지 않은 단어입니다. 판정불가. ‘-는다’, ‘-는’, ‘-구나’, ‘-(으)ㄴ’ 등이 결합한 활용형을 입력해주세요.";
    }
    return "동사와 형용사로 모두 쓰이는 단어입니다. 판정불가. ‘크는’, ‘큰’, ‘크는구나’, ‘크구나’처럼 문장 속 활용형을 입력해주세요.";
  }
  if (analysis.evidence.some((item) => item.label.includes("사전 기본형"))) {
    return "활용형 어미 근거가 없어서 내장 사전 대조 단계에서 판정했습니다. 어미 결합 근거가 있으면 그 결과를 최우선으로 사용합니다.";
  }
  return "이 결론은 입력 끝부분의 어미 결합 양상을 학교문법 기준으로 점수화해 산출한 결과입니다.";
}

function resetApp() {
  wordInput.value = "";
  resultPanel.classList.add("hidden");
  wordInput.focus();
}

let liveTimer = null;
function scheduleLiveAnalysis() {
  window.clearTimeout(liveTimer);
  const input = trimInput(wordInput.value);
  if (!input) {
    resultPanel.classList.add("hidden");
    return;
  }
  liveTimer = window.setTimeout(analyzeWord, 250);
}

buildButton.addEventListener("click", analyzeWord);
resetButton.addEventListener("click", resetApp);
wordInput.addEventListener("input", scheduleLiveAnalysis);

wordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    window.clearTimeout(liveTimer);
    analyzeWord();
  }
});

document.querySelectorAll("[data-example]").forEach((button) => {
  button.addEventListener("click", () => {
    wordInput.value = button.dataset.example;
    analyzeWord();
  });
});
