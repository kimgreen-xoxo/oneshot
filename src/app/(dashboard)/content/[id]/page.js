"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

const statusColors = {
  검수대기: styles.badgeWaiting,
  승인완료: styles.badgeApproved,
  발행완료: styles.badgeDone,
  반려: styles.badgeRejected,
};

const timeSlotHours = {
  morning: 8, // 오전 7~9시 → 8시로 표시
  lunch: 12, // 점심 12~13시
  evening: 19, // 퇴근 18~20시
  night: 23, // 심야 22~24시
};

const scheduleDays = {
  매일: 1,
  "3일에 1번": 3,
  "주 2회": 3, // 정확한 요일 지정이 없어 3.5일 근사값(3일)으로 단순화
  "주 1회": 7,
};

// 오늘부터 가장 가까운 다음 발행 시각 계산 (시작일 무시, 단순 다음 슬롯 계산)
function calcNextPublishDate(schedule, publishTime) {
  if (!schedule || !publishTime) return null;

  const hour = timeSlotHours[publishTime];
  const intervalDays = scheduleDays[schedule];
  if (hour === undefined || intervalDays === undefined) return null;

  const now = new Date();
  const candidate = new Date(now);
  candidate.setHours(hour, 0, 0, 0);

  if (candidate <= now) {
    candidate.setDate(candidate.getDate() + intervalDays);
  }

  return candidate;
}

export default function ContentDetailPage() {
  const params = useParams();
  const { id } = params;

  const [content, setContent] = useState(null);
  const [clientSchedule, setClientSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("idle"); // idle | saving
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch(`/api/contents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContent(data.data);
          // 콘텐츠의 고객명으로 발행 스케줄(주기/시간대) 조회
          if (data.data.clientName) {
            fetch(
              `/api/clients?clientName=${encodeURIComponent(data.data.clientName)}`,
            )
              .then((res) => res.json())
              .then((clientData) => {
                if (clientData.success && clientData.data.length > 0) {
                  setClientSchedule(clientData.data[0]);
                }
              })
              .catch((err) => console.error("고객 스케줄 조회 오류:", err));
          }
        } else {
          setError(data.error || "콘텐츠를 불러올 수 없습니다.");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    setActionStatus("saving");
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "승인완료" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setContent((prev) => ({ ...prev, status: "승인완료" }));
    } catch (err) {
      alert("승인 처리 중 오류: " + err.message);
    } finally {
      setActionStatus("idle");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("반려 이유를 입력해주세요.");
      return;
    }
    setActionStatus("saving");
    try {
      const res = await fetch(`/api/contents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "반려", rejectionReason: rejectReason }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setContent((prev) => ({
        ...prev,
        status: "반려",
        rejectionReason: rejectReason,
      }));
      setShowRejectModal(false);
    } catch (err) {
      alert("반려 처리 중 오류: " + err.message);
    } finally {
      setActionStatus("idle");
    }
  };

  if (loading) {
    return <p className={styles.emptyText}>불러오는 중...</p>;
  }

  if (error || !content) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyText}>
          {error || "콘텐츠를 찾을 수 없습니다."}
        </p>
        <Link href="/content" className={styles.backLink}>
          ← 콘텐츠 관리로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href="/content" className={styles.backLink}>
        ← 콘텐츠 관리로 돌아가기
      </Link>

      <div className={styles.headerRow}>
        <h2 className={styles.title}>콘텐츠 상세보기</h2>
        <span className={`${styles.badge} ${statusColors[content.status]}`}>
          {content.status}
        </span>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>고객명</span>
          <span className={styles.infoValue}>{content.clientName || "-"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>채널</span>
          <span className={styles.infoValue}>{content.channel || "-"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>유형</span>
          <span className={styles.infoValue}>{content.type || "-"}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>생성일</span>
          <span className={styles.infoValue}>
            {content.createdAt
              ? new Date(content.createdAt).toLocaleString("ko-KR")
              : "-"}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>생성일</span>
          <span className={styles.infoValue}>
            {content.createdAt ? new Date(content.createdAt).toLocaleString('ko-KR') : '-'}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>업로드 예정</span>
          <span className={styles.infoValue}>
            {clientSchedule
              ? (() => {
                  const next = calcNextPublishDate(clientSchedule.schedule, clientSchedule.publishTime)
                  return next
                    ? next.toLocaleString('ko-KR', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : '발행 스케줄 미설정'
                })()
              : '고객 발행 스케줄 정보 없음'}
          </span>
        </div>
      </div>

      {content.imageUrl && (
        <div className={styles.contentCard}>
          <h3 className={styles.sectionTitle}>이미지</h3>
          <img
            src={content.imageUrl}
            alt="콘텐츠 이미지"
            className={styles.contentImage}
          />
        </div>
      )}

      <div className={styles.contentCard}>
        <h3 className={styles.sectionTitle}>텍스트 내용</h3>
        <p className={styles.contentText}>{content.result || "내용 없음"}</p>
      </div>

      {content.status === "반려" && content.rejectionReason && (
        <div className={styles.rejectionCard}>
          <h3 className={styles.sectionTitle}>반려 이유</h3>
          <p className={styles.rejectionText}>{content.rejectionReason}</p>
        </div>
      )}

      {content.status === "검수대기" && (
        <div className={styles.actions}>
          <button
            className={styles.btnApprove}
            onClick={handleApprove}
            disabled={actionStatus === "saving"}
          >
            ✅ 승인
          </button>
          <button
            className={styles.btnReject}
            onClick={() => setShowRejectModal(true)}
            disabled={actionStatus === "saving"}
          >
            ❌ 반려
          </button>
        </div>
      )}

      {showRejectModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.modalTitle}>반려 이유를 입력해주세요</h3>
            <textarea
              className={styles.modalTextarea}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: 톤이 너무 딱딱해요"
              rows={4}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowRejectModal(false)}
              >
                취소
              </button>
              <button
                className={styles.modalSubmitBtn}
                onClick={handleRejectSubmit}
                disabled={actionStatus === "saving"}
              >
                반려 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
