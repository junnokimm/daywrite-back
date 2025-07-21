import History from "../../models/historySchema.js";
import BookmarkFolder from "../../models/bookmark/bookmarkFolderSchema.js";

export const bookmarkFolder = async (req, res) => {
 
    try {
        const bookmarkFolder = await History.find()

        res.status(200).json({
            message : "bookmarkFolder 조회",
            bookmarkFolder : bookmarkFolder
        })

    } catch (error) {
        console.error(`bookmarkFolder ${error}`)
        res.status(500).json({message: "알 수 없는 예외 발생!"})
    }

}

// 폴더 생성
export const createFolder = async (req, res) => {
  try {
    const { title, type, historyIds, thumbnailUrl } = req.body;

    const newFolder = await BookmarkFolder.create({
      title,
      type,
      historyIds,
      thumbnailUrl,
    });

    res.status(201).json(newFolder);
  } catch (err) {
    console.error("폴더 생성 에러:", err);
    res.status(500).json({ message: "폴더 생성 실패" });
  }
};

// 모든 폴더 가져오기 (ex: 사용자 ID가 있다면 필터링도 가능)
export const getAllFolders = async (req, res) => {
  try {
    const folders = await BookmarkFolder.find().populate('historyIds');

    // history 개수 포함해서 정리
    const formatted = folders.map(folder => ({
      id: folder._id,
      title: folder.title,
      type: folder.type,
      thumbnailUrl: folder.thumbnailUrl,
      count: folder.historyIds.length,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("폴더 조회 에러:", err);
    res.status(500).json({ message: "폴더 불러오기 실패" });
  }
};