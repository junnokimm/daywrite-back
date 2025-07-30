import PlayList from "../../models/bookmark/playListSchema.js";
import BookmarkPlayedFolder from "../../models/bookmark/bookmarkPlayedFolderSchema.js";
import path from "path";

// 좋아요 저장
export const saveLikedSongs = async (req, res) => {
  try {
    const { songs } = req.body;

    if (!songs || songs.length === 0) {
      return res.status(400).json({ message: "노래가 비어 있습니다." });
    }

    const inserted = await PlayList.insertMany(songs); // 배열로 저장
    res.status(201).json({ message: "저장 완료", data: inserted });
  } catch (err) {
    console.error("좋아요 저장 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 좋아요 취소
export const unlikeSong = async (req, res) => {
  const { title, artist } = req.body;
  if (!title || !artist) return res.status(400).json({ message: "정보 누락" });

  const deleted = await PlayList.deleteOne({ title, artist });
  res.status(200).json({ message: "좋아요 취소됨", deletedCount: deleted.deletedCount });
};


// 저장된 곡 목록 전체 가져오기
export const getLikedSongs = async (req, res) => {
  try {
    const songs = await PlayList.find().sort({ createdAt: -1 }); // 최근순
    res.status(200).json(songs);
  } catch (err) {
    console.error("좋아요 목록 조회 실패:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 폴더 생성
export const createPlayedFolder = async (req, res) => {
  
  try {
    const { title, selectedIds } = req.body;

  let playlistIds = [];
  try {
    playlistIds = JSON.parse(selectedIds);
  } catch (err) {
    return res.status(400).json({ message: "선택한 항목 형식이 올바르지 않습니다." });
  }
  // 썸네일 경로 구성
  let thumbnailUrl = null;
  if (req.file) {
    const relativePath = path.relative(path.join(process.cwd(), "uploads"), req.file.path);
    thumbnailUrl = `/uploads/${relativePath.replace(/\\/g, "/")}`;
  }

  const folder = await BookmarkPlayedFolder.create({
    title,
    thumbnailUrl,
    playlistIds, // ✅ 이제 올바르게 전달됨
  });

  res.status(201).json({ message: "북마크 폴더 생성 완료", folder });
  } catch (err) {
    console.error("북마크 폴더 생성 실패:", err);
    res.status(500).json({ message: "서버 에러" });
  }
};

// 모든 Played 폴더 조회
export const getAllPlayedFolders = async (req, res) => {
  try {
    const folders = await BookmarkPlayedFolder.find().populate("playlistIds");
    const result = folders.map(folder => ({
      id: folder._id,
      title: folder.title,
      thumbnailUrl: folder.thumbnailUrl,
      type: folder.type,
      count: folder.playlistIds.length,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Played 폴더 전체 조회 실패:", err);
    res.status(500).json({ message: "조회 실패" });
  }
};
