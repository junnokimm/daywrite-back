import mongoose from "mongoose";
import PlayList from "../../models/bookmark/playListSchema.js";
import BookmarkPlayedFolder from "../../models/bookmark/bookmarkPlayedFolderSchema.js";
import path from "path";

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
    const payload = songs.map(s => ({ ...s, userId }));
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


// 저장된 곡 목록 전체 가져오기
// export const getLikedSongs = async (req, res) => {
//   try {
//     const songs = await PlayList.find().sort({ createdAt: -1 }); // 최근순
//     res.status(200).json(songs);
//   } catch (err) {
//     console.error("좋아요 목록 조회 실패:", err);
//     res.status(500).json({ message: "서버 오류" });
//   }
// };

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


// 폴더 생성
// export const createPlayedFolder = async (req, res) => {
  
//   try {
//     const { title, selectedIds, userId } = req.body;
//     // 유효한 ObjectId인지 검증
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
//     }
//   let playlistIds = [];
//   try {
//     playlistIds = JSON.parse(selectedIds);
//   } catch (err) {
//     return res.status(400).json({ message: "선택한 항목 형식이 올바르지 않습니다." });
//   }
//   // 썸네일 경로 구성
//   let thumbnailUrl = null;
//   if (req.file) {
//     const relativePath = path.relative(path.join(process.cwd(), "uploads"), req.file.path);
//     thumbnailUrl = `/uploads/${relativePath.replace(/\\/g, "/")}`;
//   }

//   const folder = await BookmarkPlayedFolder.create({
//     title,
//     thumbnailUrl,
//     playlistIds,
//     user: userId,
//     type: "곡",
//   });

//   res.status(201).json({ message: "북마크 폴더 생성 완료", folder });
//   } catch (err) {
//     console.error("북마크 폴더 생성 실패:", err);
//     res.status(500).json({ message: "서버 에러" });
//   }
// };
// 폴더 생성 (JSON 버전)
export const createPlayedFolder = async (req, res) => {
  try {
    const {
      title,
      type = "곡",              // 기본값 "곡"
      playlistIds,             // 배열이어야 함
      thumbnailUrl,            // /uploads/... (images/thumbnail 응답)
      imageUpload,             // 이미지 업로드 문서 _id (선택)
      ownerId,                 // 프론트에서 보내는 uid
      userId,                  // 예전 키도 허용 (둘 중 하나 받기)
    } = req.body;

    const actualUserId = ownerId || userId;
    if (!actualUserId) {
      return res.status(400).json({ message: "userId(=ownerId) 필요" });
    }
    if (!mongoose.Types.ObjectId.isValid(actualUserId)) {
      return res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
    }
    if (!title?.trim()) {
      return res.status(400).json({ message: "title 필요" });
    }
    if (!Array.isArray(playlistIds) || playlistIds.length === 0) {
      return res.status(400).json({ message: "playlistIds 배열 필요" });
    }

    // ObjectId 유효성 체크(선택)
    const invalid = playlistIds.some(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalid) {
      return res.status(400).json({ message: "playlistIds에 유효하지 않은 ID가 있습니다." });
    }

    const folder = await BookmarkPlayedFolder.create({
      title,
      type,               // "곡"
      playlistIds,
      thumbnailUrl,
      imageUpload,        // 스키마에 있으면 저장
      user: actualUserId, // BookmarkPlayedFolder는 user(ObjectId ref) 사용
    });

    res.status(201).json({ message: "북마크 폴더 생성 완료", folder });
  } catch (err) {
    console.error("북마크 폴더 생성 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};


// 모든 Played 폴더 조회
// export const getAllPlayedFolders = async (req, res) => {
//   try {
//     const folders = await BookmarkPlayedFolder.find().populate("playlistIds").populate("user", "nickname");;
//     const result = folders.map(folder => ({
//       id: folder._id,
//       title: folder.title,
//       thumbnailUrl: folder.thumbnailUrl,
//       type: folder.type,
//       count: folder.playlistIds.length,
//       likeCount: folder.likeCount,
//       userNickname: folder.user?.nickname || "알 수 없음", // ✅ 닉네임 추가
//     }));

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("Played 폴더 전체 조회 실패:", err);
//     res.status(500).json({ message: "조회 실패" });
//   }
// };

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
      thumbnailUrl: folder.thumbnailUrl,  // 이미 /uploads/... 라고 가정
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
