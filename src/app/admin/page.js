"use client";

import { useState } from "react";
import styles from "./page.module.css";

const mockPastContents = {
  1: [
    {
      id: 1,
      date: "2026-04-22",
      type: "이미지",
      result: "https://placehold.co/300x300?text=past1",
    },
    {
      id: 2,
      date: "2026-04-19",
      type: "텍스트",
      result: "강남 아파트 매매 전문. 10년 경력 공인중개사.",
    },
  ],
  2: [
    {
      id: 1,
      date: "2026-04-22",
      type: "텍스트",
      result: "코성형 상담 후기. 자연스러운 결과에 만족합니다.",
    },
    {
      id: 2,
      date: "2026-04-19",
      type: "이미지",
      result: "https://placehold.co/300x300?text=past2",
    },
  ],
  3: [
    {
      id: 1,
      date: "2026-04-22",
      type: "이미지",
      result: "https://placehold.co/300x300?text=past3",
    },
    {
      id: 2,
      date: "2026-04-19",
      type: "텍스트",
      result: "수학 성적 향상 보장. 지금 바로 상담하세요.",
    },
  ],
};

const mockReviews = [
  {
    id: 1,
    client: "김철수",
    industry: "부동산",
    channel: "Instagram",
    schedule: "3일에 1번",
    contents: [
      {
        id: 101,
        day: "1일차",
        date: "2026-04-25",
        type: "이미지",
        prompt: "강남 아파트 매매 전문 부동산 홍보 이미지",
        result: "https://placehold.co/600x400?text=1일차",
        status: "검수대기",
      },
      {
        id: 102,
        day: "2일차",
        date: "2026-04-28",
        type: "텍스트",
        prompt: "강남 아파트 매매 관련 블로그 글",
        result:
          "강남에서 아파트 매매를 고민하고 계신가요? 10년 경력의 전문 공인중개사가 직접 상담합니다.",
        status: "검수대기",
      },
      {
        id: 103,
        day: "3일차",
        date: "2026-05-01",
        type: "이미지",
        prompt: "강남 아파트 시세 정보 카드뉴스",
        result: "https://placehold.co/600x400?text=3일차",
        status: "검수대기",
      },
    ],
  },
  {
    id: 2,
    client: "이영희",
    industry: "병원/클리닉",
    channel: "네이버 블로그",
    schedule: "3일에 1번",
    contents: [
      {
        id: 201,
        day: "1일차",
        date: "2026-04-25",
        type: "텍스트",
        prompt: "강남 코성형 후기 블로그 글",
        result:
          "강남에서 코성형을 고민하고 계신가요? 저희 병원은 10년 경력의 전문의가 직접 상담합니다.",
        status: "검수대기",
      },
      {
        id: 202,
        day: "2일차",
        date: "2026-04-28",
        type: "이미지",
        prompt: "코성형 전후 비교 카드뉴스",
        result: "https://placehold.co/600x400?text=2일차",
        status: "검수대기",
      },
      {
        id: 203,
        day: "3일차",
        date: "2026-05-01",
        type: "텍스트",
        prompt: "코성형 비용 안내 블로그 글",
        result:
          "코성형 비용이 궁금하신가요? 상담부터 수술까지 투명하게 안내해드립니다.",
        status: "검수대기",
      },
    ],
  },
  {
    id: 3,
    client: "박민수",
    industry: "학원/교육",
    channel: "YouTube",
    schedule: "3일에 1번",
    contents: [
      {
        id: 301,
        day: "1일차",
        date: "2026-04-25",
        type: "영상",
        prompt: "수학 학원 홍보 영상",
        result: "https://placehold.co/600x400?text=1일차",
        status: "검수대기",
      },
      {
        id: 302,
        day: "2일차",
        date: "2026-04-28",
        type: "이미지",
        prompt: "수학 학원 합격 후기 카드뉴스",
        result: "https://placehold.co/600x400?text=2일차",
        status: "검수대기",
      },
      {
        id: 303,
        day: "3일차",
        date: "2026-05-01",
        type: "텍스트",
        prompt: "수학 학원 커리큘럼 소개 글",
        result:
          "체계적인 커리큘럼으로 성적 향상을 보장합니다. 지금 바로 상담 신청하세요.",
        status: "검수대기",
      },
    ],
  },
];

export default function ReviewPage() {
  const [clients, setClients] = useState(mockReviews);
  const [openId, setOpenId] = useState(null);

  const toggleOpen = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const updateStatus = (clientId, contentId, status) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              contents: c.contents.map((item) =>
                item.id === contentId ? { ...item, status } : item,
              ),
            }
          : c,
      ),
    );
  };

  const approveAll = (clientId) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              contents: c.contents.map((item) => ({
                ...item,
                status: "승인완료",
              })),
            }
          : c,
      ),
    );
  };

  const getClientStatus = (contents) => {
    const total = contents.length;
    const approved = contents.filter((c) => c.status === "승인완료").length;
    const rejected = contents.filter((c) => c.status === "반려").length;
    if (approved === total)
      return { label: "전체승인", style: styles.badgeApproved };
    if (rejected > 0)
      return { label: `반려 ${rejected}건`, style: styles.badgeRejected };
    return { label: `대기 ${total - approved}건`, style: styles.badgeWaiting };
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>검수 대기</h2>
      <div className={styles.list}>
        {clients.map((client) => {
          const clientStatus = getClientStatus(client.contents);
          const isOpen = openId === client.id;
          return (
            <div key={client.id} className={styles.clientCard}>
              <div
                className={styles.clientHeader}
                onClick={() => toggleOpen(client.id)}
              >
                <div className={styles.clientInfo}>
                  <span className={styles.clientName}>{client.client}</span>
                  <span className={styles.clientMeta}>{client.industry}</span>
                  <span className={styles.clientMeta}>{client.channel}</span>
                  <span className={styles.clientMeta}>{client.schedule}</span>
                </div>
                <div className={styles.clientRight}>
                  <span className={`${styles.badge} ${clientStatus.style}`}>
                    {clientStatus.label}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      approveAll(client.id);
                    }}
                    className={styles.approveAllBtn}
                  >
                    전체 승인
                  </button>
                  <span className={styles.arrow}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
              {isOpen && (
                <div className={styles.contentWrapper}>
                  <div className={styles.contentList}>
                    {client.contents.map((item) => (
                      <div key={item.id} className={styles.contentItem}>
                        <div className={styles.contentHeader}>
                          <div className={styles.contentInfo}>
                            <span className={styles.contentDay}>
                              {item.day}
                            </span>
                            <span className={styles.contentDate}>
                              {item.date}
                            </span>
                            <span className={styles.contentType}>
                              {item.type}
                            </span>
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
                        <p className={styles.prompt}>{item.prompt}</p>
                        {item.type === "텍스트" ? (
                          <p className={styles.resultText}>{item.result}</p>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.result}
                            alt="AI 생성 결과"
                            className={styles.resultImage}
                          />
                        )}
                        {item.status === "검수대기" && (
                          <div className={styles.actions}>
                            <button
                              onClick={() =>
                                updateStatus(client.id, item.id, "승인완료")
                              }
                              className={styles.btnApprove}
                            >
                              ✅ 승인
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(client.id, item.id, "반려")
                              }
                              className={styles.btnReject}
                            >
                              ❌ 반려
                            </button>
                            <button
                              onClick={() =>
                                updateStatus(client.id, item.id, "검수대기")
                              }
                              className={styles.btnRegenerate}
                            >
                              🔄 재생성
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.pastPanel}>
                    <h4 className={styles.pastTitle}>지난 게시물</h4>
                    <p className={styles.pastDesc}>톤앤매너 참고용</p>
                    <div className={styles.pastList}>
                      {(mockPastContents[client.id] || []).map((past) => (
                        <div key={past.id} className={styles.pastItem}>
                          <div className={styles.pastItemHeader}>
                            <span className={styles.pastDate}>{past.date}</span>
                            <span className={styles.pastType}>{past.type}</span>
                          </div>
                          {past.type === "텍스트" ? (
                            <p className={styles.pastText}>{past.result}</p>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={past.result}
                              alt="지난 게시물"
                              className={styles.pastImage}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
