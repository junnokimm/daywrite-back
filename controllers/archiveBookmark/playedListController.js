import PlayList from "../../models/bookmark/playListSchema.js";

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