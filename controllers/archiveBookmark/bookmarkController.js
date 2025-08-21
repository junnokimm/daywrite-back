import History from "../../models/historySchema.js";
import BookmarkFolder from "../../models/bookmark/bookmarkFolderSchema.js";

// history카드 조회
export const bookmarkFolder = async (req, res) => {
//  console.log("GET /bookmarkFolder/newFolder 요청 도착");
    try {
        // const bookmarkFolder = await History.find()
        const userId = (req.query.userId || "").trim();
        if (!userId) return res.status(400).json({ message: "userId 필요" });

        const myHistories = await History.find({ userId })
        .sort({ createdAt: -1 })
        .lean();

        res.status(200).json({
            message : "bookmarkFolder 조회",
            bookmarkFolder : myHistories
        })

    } catch (error) {
        console.error(`bookmarkFolder ${error}`)
        res.status(500).json({message: "알 수 없는 예외 발생!"})
    }

}


export const createFolder = async (req, res) => {
  try {
   const { title, type, historyIds, thumbnailUrl, imageUpload, ownerId } = req.body;
    const newFolder = await BookmarkFolder.create({
     title, type, historyIds, thumbnailUrl, imageUpload, ownerId, // ✅ 저장
    });
    res.status(201).json(newFolder);
  } catch (err) {
    console.error("폴더 생성 에러:", err);
    res.status(500).json({ message: "폴더 생성 실패" });
  }
};

// ✅ 문자열을 '/uploads/...' 또는 절대 URL로 보정
const normalizeThumbStr = (t) => {
  if (!t) return null;
  t = String(t).replace(/\\/g, "/"); // 역슬래시 -> 슬래시
  if (/^https?:\/\//i.test(t)) return t;        // 이미 절대 URL
  if (t.startsWith("/uploads/")) return t;      // '/uploads/...'
  if (t.startsWith("uploads/")) return `/${t}`; // 'uploads/...'
  return `/uploads/${t.replace(/^\/+/, "")}`;   // 상대경로
};

// ✅ OS 절대경로에서 '/uploads/..' 부분만 추출
const toUploadsFromAnyPath = (p) => {
  if (!p) return null;
  const s = String(p).replace(/\\/g, "/");
  const after = s.split("/uploads/")[1];
  return after ? `/uploads/${after}` : normalizeThumbStr(s);
};


const normalizeThumb = (folder) => {
  // 1) imageUpload.path 가 있으면 최우선 사용
  if (folder.imageUpload?.path) {
    const normalized = String(folder.imageUpload.path).replace(/\\/g, "/");
    // "/.../uploads/..." 뒷부분만 살려서 "/uploads/..." 형태로 만들기
    const afterUploads = normalized.split("/uploads/")[1];
    if (afterUploads) return `/uploads/${afterUploads}`;
  }

  // 2) thumbnailUrl 필드가 "/uploads/..."면 그대로, "uploads/..."면 앞에 "/" 붙여주기
  if (folder.thumbnailUrl) {
    const t = String(folder.thumbnailUrl);
    if (t.startsWith("/uploads/")) return t;
    if (t.startsWith("uploads/")) return `/${t}`;
  }

  return null; // 없으면 null
};

export const getAllFolders = async (req, res) => {
  try {
    const ownerId = (req.query.userId || "").trim();
    if (!ownerId) return res.status(400).json({ message: "userId 필요" });

    const type = (req.query.type || "").trim(); // "글" | "곡" (선택)
    const query = { ownerId };
    if (type) query.type = type;

    const folders = await BookmarkFolder.find(query)
      .populate("historyIds")
      .populate("imageUpload")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = folders.map((folder) => {
      let thumbnailUrl = null;
      if (folder.imageUpload?.path && folder.imageUpload?.filename) {
        const normalizedPath = folder.imageUpload.path.replace(/\\/g, "/");
        const relativePath = normalizedPath.split("uploads/")[1];
        thumbnailUrl = relativePath || null;
      }
      return {
        id: folder._id,
        title: folder.title,
        type: folder.type,          // "글" or "곡"
        thumbnailUrl,
        count: folder.historyIds.length,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("폴더 조회 에러:", err);
    res.status(500).json({ message: "폴더 불러오기 실패" });
  }
};

// ✅ 폴더 상세: 메타 + 글 목록(historyIds populate)
export const getFolderDetail = async (req, res) => {
  try {
    const { id } = req.params; // 폴더 ObjectId
    const folder = await BookmarkFolder.findById(id)
      .populate("historyIds")   // 글 문서들
      .populate("imageUpload")  // 썸네일 업로드 문서
      .lean();

    if (!folder) return res.status(404).json({ message: "폴더를 찾을 수 없습니다." });

    const thumbnailUrl = normalizeThumb(folder);
    const items = Array.isArray(folder.historyIds) ? folder.historyIds : [];

    res.json({
      id: folder._id.toString(),
      title: folder.title,
      type: folder.type,                    // "글"
      thumbnailUrl,
      count: items.length,
      items,                                // ← 실제 글 배열
    });
  } catch (err) {
    console.error("폴더 상세 조회 실패:", err);
    res.status(500).json({ message: "폴더 상세 조회 실패" });
  }
};

export const getTopTypedFolders = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 5));
    const folders = await BookmarkFolder.find({ type: "글" })
      .populate("imageUpload")
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    const result = folders.map((f) => ({
      id: String(f._id),
      title: f.title,
      type: f.type,
      // 우선순위: imageUpload.path(절대경로일 수 있음) -> thumbnailUrl
      thumbnailUrl: toUploadsFromAnyPath(f.imageUpload?.path) ?? normalizeThumbStr(f.thumbnailUrl),
      count: Array.isArray(f.historyIds) ? f.historyIds.length : 0,
      likeCount: f.likeCount ?? 0,
    }));

    res.json(result);
  } catch (err) {
    console.error("Top typed folders 조회 실패:", err);
    res.status(500).json({ message: "조회 실패" });
  }
};
