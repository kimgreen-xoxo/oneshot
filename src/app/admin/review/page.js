"use client";

import { useState } from "react";
import styles from "./page.module.css";


const mockReviews = [
  {
    id: 1,
    client: "김철수",
    industry: "부동산",
    type: "이미지",
    channel: "Instagram",
    prompt: "강남 아파트 매매 전문 부동산 홍보 이미지",
    result: "https://placehold.co/600x400?text=AI+생성+이미지",
    status: "검수대기",
  },
  {
    id: 2,
    client: "이영희",
    industry: "병원",
    type: "텍스트",
    channel: "네이버 블로그",
    prompt: "강남 코성형 후기 블로그 글",
    result:
      "강남에서 코성형을 고민하고 계신가요? 저희 병원은 10년 경력의 전문의가 직접 상담합니다. 자연스러운 결과로 많은 분들이 만족하고 계십니다.",
    status: "검수대기",
  },
];

export default function ReviewPage() {
  const [items, setItems] = useState(mockReviews);

  const handleApprove = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "승인완료" } : item,
      ),
    );
  };

  const handleReject = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "반려" } : item)),
    );
  };

  const handleRegenerate = (id) => {
    alert(`ID ${id} 재생성 요청`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>검수 화면</h2>

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.card}>
            {/* 헤더 */}
            <div className={styles.cardHeader}>
              <div className={styles.cardInfo}>
                <span className={styles.client}>{item.client}</span>
                <span className={styles.meta}>{item.industry}</span>
                <span className={styles.meta}>{item.type}</span>
                <span className={styles.meta}>{item.channel}</span>
              </div>
              <span
                className={`${styles.badge} ${
                  item.status === "승인완료"
                    ? styles.badgeApproved
                    : item.status === "반려"
                      ? styles.badgeRejected
                      : styles.badgeWaiting
                }`}
              >
                {item.status}
              </span>
            </div>

            {/* 프롬프트 */}
            <div className={styles.prompt}>
              <p className={styles.promptLabel}>프롬프트</p>
              <p className={styles.promptText}>{item.prompt}</p>
            </div>

            {/* 결과물 */}
            <div className={styles.result}>
              <p className={styles.resultLabel}>AI 생성 결과</p>
              {item.type === "이미지" ? (
                <img
                  src={item.result}
                  alt="AI 생성 이미지"
                  className={styles.resultImage}
                />
              ) : (
                <p className={styles.resultText}>{item.result}</p>
              )}
            </div>

            {/* 액션 버튼 */}
            {item.status === "검수대기" && (
              <div className={styles.actions}>
                <button
                  onClick={() => handleApprove(item.id)}
                  className={styles.btnApprove}
                >
                  승인
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className={styles.btnReject}
                >
                  반려
                </button>
                <button
                  onClick={() => handleRegenerate(item.id)}
                  className={styles.btnRegenerate}
                >
                  재생성
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
