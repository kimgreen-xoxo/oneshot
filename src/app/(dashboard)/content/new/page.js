"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

const channels = [
  "Instagram",
  "YouTube",
  "TikTok",
  "네이버 블로그",
  "카카오 채널",
];
const contentTypes = ["이미지", "영상", "카드뉴스"];

export default function NewContentPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    client: "",
    channel: "",
    type: "",
    keyword: "",
  });
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [imageOptions, setImageOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("idle"); // idle | saving | approved | rejected
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // "버전 1", "버전 2", "버전 3" 형태의 텍스트를 배열로 분리
  // 첫 "버전 N" 등장 이전의 서두 텍스트(인사말 등)는 버린다
  const parseVersions = (text) => {
    if (!text) return [];
    const firstMarker = text.search(/\*{0,2}버전\s*\d+\*{0,2}/);
    const body = firstMarker >= 0 ? text.slice(firstMarker) : text;
    const parts = body
      .split(/\*{0,2}버전\s*\d+\*{0,2}/g)
      .map((p) => p.replace(/^[-:\s]+/, "").trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : [text.trim()];
  };

  // 구글시트에서 고객 목록 불러오기
  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setClients(data.data.map((c) => c.clientName).filter(Boolean));
        }
      })
      .catch((err) => console.error("고객 목록 오류:", err));
  }, []);

  // 라이트박스 열려있을 때 키보드로 제어 (←/→: 이동, ESC: 닫기)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex(
          (prev) => (prev - 1 + imageOptions.length) % imageOptions.length,
        );
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev + 1) % imageOptions.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, imageOptions.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!form.client || !form.channel || !form.type || !form.keyword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    setStatus("loading");
    setResult(null);
    setImageOptions([]);
    setSelectedImage(0);
    setSavedId(null);
    setReviewStatus("idle");

    try {
      // 텍스트는 콘텐츠 유형과 무관하게 항상 생성
      const textResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.client,
          keyword: form.keyword,
          channelSettings: { [form.channel]: {} },
        }),
      });
      const textData = await textResponse.json();
      if (!textData.success) {
        alert("텍스트 생성 실패: " + textData.error);
        setStatus("idle");
        return;
      }
      setResult(textData.data);
      setVersions(parseVersions(textData.data));
      setSelectedVersion(0);

      // 선택한 유형(이미지/카드뉴스)을 3장 병렬 생성
      if (form.type === "이미지" || form.type === "카드뉴스") {
        const requests = [1, 2, 3].map(() =>
          fetch("/api/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientName: form.client,
              keyword: form.keyword,
              channel: form.channel,
            }),
          }).then((res) => res.json()),
        );
        const results = await Promise.all(requests);
        const images = results
          .filter((r) => r.success)
          .map((r) => `data:${r.image.mimeType};base64,${r.image.base64}`);

        if (images.length === 0) {
          alert(
            "이미지 생성 실패: " + (results[0]?.error || "알 수 없는 오류"),
          );
          setStatus("idle");
          return;
        }
        setImageOptions(images);
        setStatus("done");
      } else {
        // 영상은 아직 미구현
        setTimeout(() => setStatus("done"), 2000);
      }
    } catch (error) {
      alert("오류 발생: " + error.message);
      setStatus("idle");
    }
  };

  // 선택된 버전/이미지를 콘텐츠로 저장 (status: 검수대기로 우선 생성)
  const saveContentIfNeeded = async () => {
    if (savedId) return savedId; // 이미 저장됐으면 재사용

    const selectedText = versions[selectedVersion] || result;
    const selectedImg = imageOptions[selectedImage] || "";

    const response = await fetch("/api/contents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: form.client,
        channel: form.channel,
        type: form.type,
        prompt: "",
        result: selectedText,
        status: "검수대기",
        imageUrl: selectedImg,
      }),
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "저장 실패");
    }
    return data.id;
  };

  const handleApprove = async () => {
    setReviewStatus("saving");
    try {
      const id = await saveContentIfNeeded();
      setSavedId(id);
      const res = await fetch("/api/contents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "승인완료" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setReviewStatus("approved");
    } catch (error) {
      alert("승인 처리 중 오류: " + error.message);
      setReviewStatus("idle");
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      alert("반려 이유를 입력해주세요.");
      return;
    }
    setReviewStatus("saving");
    try {
      const id = await saveContentIfNeeded();
      setSavedId(id);
      const res = await fetch("/api/contents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "반려",
          rejectionReason: rejectReason,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setReviewStatus("rejected");
      setShowRejectModal(false);
    } catch (error) {
      alert("반려 처리 중 오류: " + error.message);
      setReviewStatus("idle");
    }
  };

  // 승인/반려 처리 완료 후 "새로 만들기" - 폼과 결과를 모두 초기화
  const handleStartNew = () => {
    setStatus("idle");
    setResult(null);
    setVersions([]);
    setSelectedVersion(0);
    setImageOptions([]);
    setSelectedImage(0);
    setSavedId(null);
    setReviewStatus("idle");
    setRejectReason("");
    setForm({ client: "", channel: "", type: "", keyword: "" });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>새 콘텐츠 생성</h2>

      <div className={styles.layout}>
        {/* 입력 패널 */}
        <div className={styles.inputPanel}>
          <h3 className={styles.panelTitle}>생성 설정</h3>

          <div className={styles.field}>
            <label className={styles.label}>고객 선택</label>
            <select
              name="client"
              value={form.client}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">선택하세요</option>
              {clients.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>채널</label>
            <select
              name="channel"
              value={form.channel}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">선택하세요</option>
              {channels.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>콘텐츠 유형</label>
            <div className={styles.typeGroup}>
              {contentTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((prev) => ({ ...prev, type: t }))}
                  className={`${styles.typeBtn} ${form.type === t ? styles.typeBtnActive : ""}`}
                >
                  {t === "이미지" ? "🖼️" : t === "영상" ? "🎬" : "🗞️"} {t}
                </button>
              ))}
            </div>
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

          <button
            onClick={handleGenerate}
            className={styles.generateBtn}
            disabled={status === "loading"}
          >
            {status === "loading" ? "⏳ 생성 중..." : "✨ AI 생성 시작"}
          </button>
        </div>

        {/* 결과 패널 */}
        <div className={styles.resultPanel}>
          <h3 className={styles.panelTitle}>생성 결과</h3>

          {status === "idle" && (
            <div className={styles.emptyState}>
              <p>생성 설정 후 AI 생성 시작 버튼을 누르세요.</p>
            </div>
          )}

          {status === "loading" && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>AI가 콘텐츠를 생성하고 있습니다...</p>
            </div>
          )}

          {status === "done" && (
            <div className={styles.doneState}>
              {(reviewStatus === 'idle' || reviewStatus === 'saving') && (
                <div className={styles.resultPreview}>
                {/* 텍스트는 버전별로 분리해서 선택 가능하게 표시 */}
                {versions.length > 0 && (
                  <div className={styles.versionSection}>
                    <p className={styles.versionGuide}>
                      👇 아래 3가지 버전 중 하나를 선택하세요
                    </p>
                    <div className={styles.versionList}>
                      {versions.map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedVersion(i)}
                          className={`${styles.versionCard} ${selectedVersion === i ? styles.versionCardActive : ""}`}
                        >
                          <div className={styles.versionHeader}>
                            <span className={styles.radioCircle}>
                              {selectedVersion === i && (
                                <span className={styles.radioDot} />
                              )}
                            </span>
                            <span className={styles.versionLabel}>
                              버전 {i + 1}
                            </span>
                            {selectedVersion === i && (
                              <span className={styles.versionCheck}>
                                ✓ 선택됨
                              </span>
                            )}
                          </div>
                          <p className={styles.versionText}>{v}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(form.type === "이미지" || form.type === "카드뉴스") &&
                  imageOptions.length > 0 && (
                    <div className={styles.versionSection}>
                      <p className={styles.versionGuide}>
                        👇 아래 3가지 이미지 중 하나를 선택하세요
                      </p>
                      <div className={styles.imageOptionGrid}>
                        {imageOptions.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedImage(i)}
                            className={`${styles.imageOptionCard} ${selectedImage === i ? styles.imageOptionCardActive : ""}`}
                          >
                            <img
                              src={img}
                              alt={`AI 생성 이미지 ${i + 1}`}
                              className={styles.resultImage}
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxIndex(i);
                              }}
                            />
                            <div className={styles.imageOptionFooter}>
                              <span className={styles.radioCircle}>
                                {selectedImage === i && (
                                  <span className={styles.radioDot} />
                                )}
                              </span>
                              <span className={styles.versionLabel}>
                                이미지 {i + 1}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                {form.type === '영상' && (
                  <div className={styles.videoPlaceholder}>
                    🎬 AI 영상 생성 완료
                    <p>{form.keyword} 관련 영상</p>
                  </div>
                )}
              </div>
              )}

              {reviewStatus === "idle" && (
                <div className={styles.actions}>
                  <button
                    className={styles.btnApprove}
                    onClick={handleApprove}
                    disabled={reviewStatus === "saving"}
                  >
                    ✅ 승인
                  </button>
                  <button
                    className={styles.btnReject}
                    onClick={() => setShowRejectModal(true)}
                    disabled={reviewStatus === "saving"}
                  >
                    ❌ 반려
                  </button>
                  <button
                    className={styles.btnRegenerate}
                    onClick={handleGenerate}
                  >
                    🔄 재생성
                  </button>
                </div>
              )}

              {reviewStatus === "saving" && (
                <p className={styles.reviewStatusText}>⏳ 처리 중...</p>
              )}

              {reviewStatus === 'approved' && (
                <div className={styles.reviewDoneBox}>
                  <p className={styles.reviewStatusApproved}>✅ 승인 완료! 콘텐츠 관리에서 발행 대기 중입니다.</p>
                  <button className={styles.btnStartNew} onClick={handleStartNew}>
                    ➕ 새로 만들기
                  </button>
                </div>
              )}

              {reviewStatus === 'rejected' && (
                <div className={styles.reviewDoneBox}>
                  <p className={styles.reviewStatusRejected}>❌ 반려되었습니다. 콘텐츠 관리에서 확인할 수 있습니다.</p>
                  <button className={styles.btnStartNew} onClick={handleStartNew}>
                    ➕ 새로 만들기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 이미지 확대보기 라이트박스 (좌우 슬라이드 가능) */}
      {lightboxIndex !== null && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="닫기"
          >
            ✕
          </button>

          {imageOptions.length > 1 && (
            <button
              type="button"
              className={styles.lightboxPrev}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(
                  (prev) =>
                    (prev - 1 + imageOptions.length) % imageOptions.length,
                );
              }}
              aria-label="이전 이미지"
            >
              ‹
            </button>
          )}

          <img
            src={imageOptions[lightboxIndex]}
            alt={`AI 생성 이미지 ${lightboxIndex + 1}`}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />

          {imageOptions.length > 1 && (
            <button
              type="button"
              className={styles.lightboxNext}
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev + 1) % imageOptions.length);
              }}
              aria-label="다음 이미지"
            >
              ›
            </button>
          )}

          {imageOptions.length > 1 && (
            <div className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {imageOptions.length}
            </div>
          )}
        </div>
      )}

      {/* 반려 이유 입력 모달 */}
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
            <p className={styles.modalDesc}>
              입력하신 이유는 다음 생성 시 참고되어 더 나은 결과물을 만드는 데
              활용됩니다.
            </p>
            <textarea
              className={styles.modalTextarea}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: 톤이 너무 딱딱해요 / 키워드가 자연스럽지 않아요 / 이미지가 컨셉과 안 맞아요"
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
                disabled={reviewStatus === "saving"}
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
