"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const industries = [
  "부동산",
  "병원/클리닉",
  "학원/교육",
  "법률/세무",
  "금융/보험",
  "음식점/카페",
  "쇼핑몰/이커머스",
  "뷰티/미용",
  "운동/필라테스",
  "컨설팅",
];

const channels = [
  "Instagram",
  "YouTube",
  "TikTok",
  "네이버 블로그",
  "카카오 채널",
  "Facebook",
  "Threads",
];

const ranges = [
  "이미지",
  "영상",
  "텍스트",
  "랜딩페이지",
  "SNS 운영",
  "광고 집행",
];

const goals = [
  "DB 수집",
  "브랜드 인지",
  "즉시 구매/예약",
  "팬/회원 모집",
  "투자자 모집",
];

const tones = [
  "전문적/신뢰감",
  "친근한/따뜻한",
  "트렌디/젊은",
  "럭셔리/프리미엄",
  "유머러스/재미있는",
  "감성적/스토리텔링",
];
const toneMoods = {
  "전문적/신뢰감": {
    colors: ["#1A1A2E", "#2E3A59", "#FFFFFF", "#00C4FF"],
    desc: "신뢰감 있는 딥블루 계열. 깔끔하고 정돈된 레이아웃.",
    keywords: "명확한 정보 전달 · 여백 활용 · 세리프 폰트",
  },
  "친근한/따뜻한": {
    colors: ["#FF6B6B", "#FFD93D", "#FFF3E0", "#FF8C42"],
    desc: "따뜻한 오렌지/옐로우 계열. 부드럽고 친근한 느낌.",
    keywords: "둥근 모서리 · 밝은 배경 · 손글씨 느낌",
  },
  "트렌디/젊은": {
    colors: ["#0D0D0D", "#FF3B5C", "#00FFD1", "#7B2FFF"],
    desc: "다크 배경에 네온 포인트. 강렬하고 현대적인 느낌.",
    keywords: "대비 강조 · 그라디언트 · 굵은 폰트",
  },
  "럭셔리/프리미엄": {
    colors: ["#0A0A0A", "#1A1A1A", "#C9A84C", "#F5F5F0"],
    desc: "블랙/골드 계열. 고급스럽고 절제된 느낌.",
    keywords: "미니멀 · 골드 포인트 · 고급 타이포",
  },
  "유머러스/재미있는": {
    colors: ["#FF6EC7", "#FFE347", "#00D4FF", "#FF4500"],
    desc: "컬러풀한 팝아트 계열. 밝고 에너지 넘치는 느낌.",
    keywords: "다양한 컬러 · 팝아트 · 캐주얼 폰트",
  },
  "감성적/스토리텔링": {
    colors: ["#2C2C2C", "#8B7355", "#D4C5B0", "#F9F3EC"],
    desc: "그레이/베이지 무드. 감성적이고 따뜻한 분위기.",
    keywords: "필름 느낌 · 자연광 · 얇은 폰트",
  },
};

const scheduleOptions = ["매일", "3일에 1번", "주 2회", "주 1회"];
const timeOptions = [
  { label: "오전 (7~9시)", value: "morning" },
  { label: "점심 (12~13시)", value: "lunch" },
  { label: "퇴근 (18~20시)", value: "evening" },
  { label: "심야 (22~24시)", value: "night" },
];
export default function InputPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    clientName: "",
    industry: [],
    goal: [],
    target: "",
    keyword: "",
    region: "",
    bannedWords: "",
    range: [],
    channels: [],
    hasAd: false,
    adBudget: "",
    kpi: "",
    brandColor: "#FF3B5C",
    tone: [],
    refAccounts: "",
    refImages: [],
    schedule: "3일에 1번",
    publishTime: "evening",
    startDate: "",
  });

  const toggleItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const generatePrompt = () => {
    if (!form.clientName)
      return "고객명을 입력하면 AI 프롬프트가 자동 생성됩니다.";
    return `
[고객 정보]
고객명: ${form.clientName}
업종: ${form.industry.join(", ") || "미입력"}

[전략]
목표: ${form.goal.join(", ") || "미입력"}
타깃: ${form.target || "미입력"}
키워드: ${form.keyword || "미입력"}
지역: ${form.region || "미입력"}

[운영]
금지표현: ${form.bannedWords || "없음"}
제작범위: ${form.range.join(", ") || "미입력"}
채널: ${form.channels.join(", ") || "미입력"}
광고집행: ${form.hasAd ? `예 (예산: ${form.adBudget || "미입력"})` : "아니오"}

[KPI]
${form.kpi || "미입력"}

[발행 스케줄]
주기: ${form.schedule || '미입력'}
시간대: ${timeOptions.find(t => t.value === form.publishTime)?.label || '미입력'}
시작일: ${form.startDate || '미입력'}

[디자인 레퍼런스]
브랜드 컬러: ${form.brandColor}
톤앤매너: ${form.tone.join(", ") || "미입력"}
참고 계정: ${form.refAccounts || "미입력"}
레퍼런스 이미지: ${form.refImages.length > 0 ? `${form.refImages.length}장 업로드됨` : "없음"}
    `.trim();
  };

  const handleSubmit = () => {
    if (!form.clientName) {
      alert("고객명을 입력해주세요.");
      return;
    }
    if (form.industry.length === 0) {
      alert("업종을 선택해주세요.");
      return;
    }
    if (form.goal.length === 0) {
      alert("목표를 선택해주세요.");
      return;
    }
    if (!form.target) {
      alert("타깃을 입력해주세요.");
      return;
    }
    if (!form.keyword) {
      alert("키워드를 입력해주세요.");
      return;
    }
    if (form.channels.length === 0) {
      alert("채널을 선택해주세요.");
      return;
    }
    if (!form.kpi) {
      alert("KPI 목표를 입력해주세요.");
      return;
    }
    console.log("제출 데이터:", form);
    alert("고객 정보가 저장되었습니다.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <h2 className={styles.title}>고객 등록</h2>
        <button onClick={handleSubmit} className={styles.saveBtn}>
          저장하기
        </button>
      </div>

      <div className={styles.layout}>
        {/* 좌측 입력 패널 */}
        <div className={styles.inputPanel}>
          {/* 기본 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>기본 정보</h3>
            <div className={styles.field}>
              <label className={styles.label}>고객명</label>
              <input
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="고객명 입력"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>업종 (복수 선택)</label>
              <div className={styles.tagGroup}>
                {industries.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleItem("industry", item)}
                    className={`${styles.tag} ${form.industry.includes(item) ? styles.tagActive : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 전략 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>전략 정보</h3>
            <div className={styles.field}>
              <label className={styles.label}>목표 (복수 선택)</label>
              <div className={styles.tagGroup}>
                {goals.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleItem("goal", item)}
                    className={`${styles.tag} ${form.goal.includes(item) ? styles.tagActive : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>타깃</label>
              <input
                name="target"
                value={form.target}
                onChange={handleChange}
                placeholder="예: 30대 여성, 강남 거주, 월 소득 500만원+"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>키워드</label>
              <input
                name="keyword"
                value={form.keyword}
                onChange={handleChange}
                placeholder="예: 강남 코성형, 비용, 후기"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>지역</label>
              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="예: 강남, 서초, 전국"
                className={styles.input}
              />
            </div>
          </div>

          {/* 운영 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>운영 정보</h3>
            <div className={styles.field}>
              <label className={styles.label}>금지 표현</label>
              <input
                name="bannedWords"
                value={form.bannedWords}
                onChange={handleChange}
                placeholder="예: 100% 보장, 최고, 1등"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>제작 범위 (복수 선택)</label>
              <div className={styles.tagGroup}>
                {ranges.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleItem("range", item)}
                    className={`${styles.tag} ${form.range.includes(item) ? styles.tagActive : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>채널 현황 (복수 선택)</label>
              <div className={styles.tagGroup}>
                {channels.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleItem("channels", item)}
                    className={`${styles.tag} ${form.channels.includes(item) ? styles.tagActive : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>광고 집행 여부</label>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="hasAd"
                  checked={form.hasAd}
                  onChange={handleChange}
                  id="hasAd"
                />
                <label htmlFor="hasAd" className={styles.checkboxLabel}>
                  광고 집행 예정
                </label>
              </div>
              {form.hasAd && (
                <input
                  name="adBudget"
                  value={form.adBudget}
                  onChange={handleChange}
                  placeholder="예: 월 100만원"
                  className={styles.input}
                />
              )}
            </div>
          </div>

          {/* KPI */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>KPI</h3>
            <div className={styles.field}>
              <label className={styles.label}>KPI 목표</label>
              <input
                name="kpi"
                value={form.kpi}
                onChange={handleChange}
                placeholder="예: DB 월 50건, ROAS 300%, CPA 1만원 이하"
                className={styles.input}
              />
            </div>
          </div>

{/* 발행 스케줄 */}
<div className={styles.section}>
  <h3 className={styles.sectionTitle}>발행 스케줄</h3>

  <div className={styles.field}>
    <label className={styles.label}>발행 주기</label>
    <div className={styles.tagGroup}>
      {scheduleOptions.map((item) => (
        <button
          key={item}
          onClick={() => setForm((prev) => ({ ...prev, schedule: item }))}
          className={`${styles.tag} ${form.schedule === item ? styles.tagActive : ''}`}
        >
          {item}
        </button>
      ))}
    </div>
  </div>

  <div className={styles.field}>
    <label className={styles.label}>발행 시간대</label>
    <div className={styles.tagGroup}>
      {timeOptions.map((item) => (
        <button
          key={item.value}
          onClick={() => setForm((prev) => ({ ...prev, publishTime: item.value }))}
          className={`${styles.tag} ${form.publishTime === item.value ? styles.tagActive : ''}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  </div>

  <div className={styles.field}>
    <label className={styles.label}>시작일</label>
    <input
      type="date"
      name="startDate"
      value={form.startDate}
      onChange={handleChange}
      className={styles.input}
    />
  </div>
</div>

          {/* 디자인 레퍼런스 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>디자인 레퍼런스</h3>
            <div className={styles.field}>
              <label className={styles.label}>브랜드 컬러</label>
              <div className={styles.colorRow}>
                <input
                  type="color"
                  name="brandColor"
                  value={form.brandColor}
                  onChange={handleChange}
                  className={styles.colorPicker}
                />
                <span className={styles.colorValue}>{form.brandColor}</span>
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>톤앤매너 (복수 선택)</label>
              <div className={styles.tagGroup}>
                {tones.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleItem("tone", item)}
                    className={`${styles.tag} ${form.tone.includes(item) ? styles.tagActive : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>참고 계정 URL</label>
              <input
                name="refAccounts"
                value={form.refAccounts}
                onChange={handleChange}
                placeholder="예: https://instagram.com/계정명"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>레퍼런스 이미지 업로드</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const urls = files.map((f) => URL.createObjectURL(f));
                  setForm((prev) => ({ ...prev, refImages: urls }));
                }}
                className={styles.fileInput}
              />
              {form.refImages.length > 0 && (
                <div className={styles.imagePreview}>
                  {form.refImages.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`레퍼런스 ${i + 1}`}
                      className={styles.refImage}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 우측 미리보기 패널 */}
        <div className={styles.previewPanel}>
          <h3 className={styles.sectionTitle}>AI 프롬프트 미리보기</h3>
          <p className={styles.previewDesc}>
            입력한 정보를 기반으로 AI 프롬프트가 자동 생성됩니다.
          </p>
          <pre className={styles.promptBox}>{generatePrompt()}</pre>

          {/* 톤앤매너 미리보기 */}
          {form.tone.length > 0 && (
            <div className={styles.moodSection}>
              <h4 className={styles.moodTitle}>톤앤매너 스타일 미리보기</h4>
              <div className={styles.moodList}>
                {form.tone.map((t) => {
                  const mood = toneMoods[t];
                  if (!mood) return null;
                  return (
                    <div key={t} className={styles.moodCard}>
                      <div className={styles.moodHeader}>
                        <span className={styles.moodName}>{t}</span>
                      </div>
                      <div className={styles.colorPalette}>
                        {mood.colors.map((color, i) => (
                          <div
                            key={i}
                            className={styles.paletteColor}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <p className={styles.moodDesc}>{mood.desc}</p>
                      <p className={styles.moodKeywords}>{mood.keywords}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            className={styles.generateBtn}
            onClick={() => {
              if (!form.clientName) {
                alert("고객명을 먼저 입력해주세요.");
                return;
              }
              router.push("/admin/content/new");
            }}
          >
            ✨ AI 콘텐츠 생성 시작
          </button>
        </div>
      </div>
    </div>
  );
}
