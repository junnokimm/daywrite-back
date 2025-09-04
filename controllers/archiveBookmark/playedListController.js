import mongoose from "mongoose";
import PlayList from "../../models/bookmark/playListSchema.js";
import BookmarkPlayedFolder from "../../models/bookmark/bookmarkPlayedFolderSchema.js";

// 좋아요 저장
export const saveLikedSongs = async (req, res) => {
  try {
    // const { songs } = req.body;
    const { songs, userId } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    if (!songs || songs.length === 0) {
      return res.status(400).json({ message: "노래가 비어 있습니다." });
    }

    // const inserted = await PlayList.insertMany(songs); // 배열로 저장
    // const payload = songs.map(s => ({ ...s, userId }));
    // ✅ 필드 정규화: 어떤 키로 와도 imageUrl에 모아 저장
    const payload = songs.map((s) => ({
      title: s.title || s.songTitle,
      artist: s.artist || s.singer,
      imageUrl: s.imageUrl || s.img || s.albumArt || null,
      img: s.img ?? null,
      albumArt: s.albumArt ?? null,
      albumTitle: s.albumTitle || s.album || null,
      userId,
    }));

    const inserted = await PlayList.insertMany(payload);

    res.status(201).json({ message: "저장 완료", data: inserted });
  } catch (err) {
    console.error("좋아요 저장 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 좋아요 취소
export const unlikeSong = async (req, res) => {
  // const { title, artist } = req.body;
  const { title, artist, userId } = req.body;
  if (!title || !artist) return res.status(400).json({ message: "정보 누락" });

  // const deleted = await PlayList.deleteOne({ title, artist });
  const cond = userId ? { title, artist, userId } : { title, artist };
  const deleted = await PlayList.deleteOne(cond);
  res.status(200).json({ message: "좋아요 취소됨", deletedCount: deleted.deletedCount });
};

export const getLikedSongs = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const songs = await PlayList.find(query).sort({ createdAt: -1 });
    res.status(200).json(songs);
  } catch (err) {
    console.error("좋아요 목록 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

const normalizeThumbStr = (t) => {
  if (!t) return null;
  t = String(t).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(t)) return t;     // 절대 URL은 그대로
  if (t.startsWith("/uploads/")) return t;   // /uploads/... 유지
  if (t.startsWith("uploads/")) return `/${t}`;
  return `/uploads/${t.replace(/^\/+/, "")}`;
};

// const toUploadsFromAnyPath = (p) => {
//   if (!p) return null;
//   const s = String(p).replace(/\\/g, "/");
//   const after = s.split("/uploads/")[1];
//   return after ? `/uploads/${after}` : normalizeThumbStr(s);
// };

const toUploadsFromAnyPath = (p) => {
  if (!p) return null;
  const s = String(p).replace(/\\/g, "/");

  // 1) 절대 URL이면 그대로 사용 (CDN/외부 URL 지원)
  if (/^https?:\/\//i.test(s)) return s;

  // 2) 경로 어딘가에 '/uploads/'가 포함되어 있으면 그 뒤로만 잘라 '/uploads/...' 로
  const idx = s.indexOf("/uploads/");
  if (idx !== -1) return s.slice(idx);

  // 3) 'uploads/...'로 시작하면 앞에 슬래시만 붙여 정규화
  if (s.startsWith("uploads/")) return `/${s}`;

  // 4) 여기까지 못 잡으면 알 수 없는 경로 → null (잘못된 입력 방지)
  return null;
};

// 폴더 생성
export const createPlayedFolder = async (req, res) => {
  try {
    const {
      title,
      type = "곡",
      playlistIds,
      thumbnailUrl,   // 문자열로 올 수도 있음
      imageUpload,    // 선택
      ownerId,
      userId,
    } = req.body;

    const actualUserId = ownerId || userId;
    if (!actualUserId) return res.status(400).json({ message: "userId(=ownerId) 필요" });
    if (!mongoose.Types.ObjectId.isValid(actualUserId)) return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    if (!title?.trim()) return res.status(400).json({ message: "title 필요" });
    if (!Array.isArray(playlistIds) || playlistIds.length === 0) return res.status(400).json({ message: "playlistIds 배열 필요" });

    // 🔑 여기서 ‘무조건’ 표준화
    let computedThumb = null;
    if (req.file?.path) {
      // multer로 받은 실제 파일 경로 → /uploads/... 로 변환
      computedThumb = toUploadsFromAnyPath(req.file.path);
    } else {
      // 프론트에서 문자열로 온 경우 → /uploads/... 또는 절대 URL로
      // computedThumb = normalizeThumbStr(thumbnailUrl);
      computedThumb = toUploadsFromAnyPath(thumbnailUrl);
    }

    const folder = await BookmarkPlayedFolder.create({
      title,
      type,
      playlistIds,
      thumbnailUrl: computedThumb,  // ← 표준화된 경로만 저장
      imageUpload,
      user: actualUserId,
    });

    res.status(201).json({ message: "북마크 폴더 생성 완료", folder });
  } catch (err) {
    console.error("북마크 폴더 생성 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 모든 Played 폴더 조회 (내 것 + 타입옵션)
export const getAllPlayedFolders = async (req, res) => {
  try {
    const ownerId = (req.query.userId || "").trim();
    if (!ownerId) return res.status(400).json({ message: "userId 필요" });
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }

    const type = (req.query.type || "").trim(); // "곡" (선택)
    const query = { user: ownerId };
    if (type) query.type = type;

    const folders = await BookmarkPlayedFolder.find(query)
      .populate("playlistIds")
      .populate("user", "nickname")
      .sort({ createdAt: -1 })
      .lean();

    const result = folders.map(folder => ({
      id: folder._id,
      title: folder.title,
      thumbnailUrl: normalizeThumbStr(folder.thumbnailUrl),
      // thumbnailUrl: folder.thumbnailUrl,  // 이미 /uploads/... 라고 가정
      type: folder.type,                  // "곡"
      count: folder.playlistIds?.length || 0,
      likeCount: folder.likeCount ?? 0,   // 스키마에 없으면 항상 0
      userNickname: folder.user?.nickname || "알 수 없음",
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Played 폴더 전체 조회 실패:", err);
    res.status(500).json({ message: "조회 실패" });
  }
};

// ✅ played 폴더 상세
export const getPlayedFolderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "유효하지 않은 폴더 ID입니다." });
    }

    const folder = await BookmarkPlayedFolder.findById(id)
      .populate("playlistIds")
      .lean();

    if (!folder) {
      return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });
    }

    // const thumbnailUrl = normalizeThumb(folder);
    const thumbnailUrl = normalizeThumbStr(folder.thumbnailUrl);

    // --- 핵심: populate 실패(또는 과거 데이터) 대비 폴백 ---
    let songs = [];
    const rawList = Array.isArray(folder.playlistIds) ? folder.playlistIds : [];
    if (rawList.length === 0) {
      songs = [];
    } else if (typeof rawList[0] === "object" && rawList[0]?._id) {
      // populate가 된 경우
      songs = rawList;
    } else {
      // ObjectId(or 문자열) 배열만 들어있는 경우 → 직접 조회
      const ids = rawList
        .map((v) => {
          try { return new mongoose.Types.ObjectId(String(v)); }
          catch { return null; }
        })
        .filter(Boolean);
      if (ids.length) {
        songs = await PlayList.find({ _id: { $in: ids } })
          .sort({ createdAt: -1 })
          .lean();
      } else {
        songs = [];
      }
    }

    // 프론트 카드가 다양한 키를 허용하긴 하지만, imageUrl 키를 하나 만들어 주면 더 안전
    // const items = (folder.playlistIds || []).map((p) => ({
    const items = (songs || []).map((p) => ({
      ...p,
      imageUrl: p.imageUrl || p.img || p.albumArt || null,
    }));

    res.json({
      id: String(folder._id),
      title: folder.title,
      type: folder.type,         // "곡"
      thumbnailUrl,              // '/uploads/...' 형태
      count: items.length,
      items,                     // 곡 배열
    });
  } catch (err) {
    console.error("played 폴더 상세 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// ⭐ 공개 Top 5
export const getTopPlayedFolders = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5)); // 1~50
    const folders = await BookmarkPlayedFolder.find({ type: "곡" })
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const result = folders.map((f) => ({
      id: String(f._id),
      title: f.title,
      type: f.type,
      thumbnailUrl: normalizeThumbStr(f.thumbnailUrl),
      count: Array.isArray(f.playlistIds) ? f.playlistIds.length : 0,
      likeCount: f.likeCount ?? 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Top played folders 조회 실패:", err);
    res.status(500).json({ message: "조회 실패" });
  }
};

// 폴더 제목 변경 (Played)
export const updatePlayedFolderTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, userId } = req.body; // 토큰 미들웨어 없으면 userId 함께 받기

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "유효하지 않은 폴더 ID" });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title 필요" });
    }

    const folder = await BookmarkPlayedFolder.findById(id);
    if (!folder) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });

    // 소유자 체크: Played는 소유자 필드가 user 임
    const owner = String(folder.user || "");
    const me = String(req.user?.id || userId || req.query?.userId || "");
    if (owner && me && owner !== me) {
      return res.status(403).json({ message: "권한 없음" });
    }

    folder.title = title.trim();
    await folder.save();

    res.json({ id: String(folder._id), title: folder.title });
  } catch (err) {
    console.error("updatePlayedFolderTitle 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 폴더 삭제 (Played)
export const deletePlayedFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId =
      req.user?.id ||
      req.body?.userId ||
      req.query?.userId ||
      null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "유효하지 않은 폴더 ID" });
    }
    if (!userId /* || !mongoose.Types.ObjectId.isValid(userId) */) {
      return res.status(401).json({ message: "로그인이 필요합니다." });
    }

    const folder = await BookmarkPlayedFolder.findById(id).select("user").lean();
    if (!folder) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });

    if (String(folder.user || "") !== String(userId || "")) {
      return res.status(403).json({ message: "삭제 권한이 없습니다." });
    }

    await BookmarkPlayedFolder.deleteOne({ _id: id });
    return res.json({ ok: true });
  } catch (err) {
    console.error("deletePlayedFolder 실패:", err);
    return res.status(500).json({ message: "서버 에러", error: String(err?.message || err) });
  }
};