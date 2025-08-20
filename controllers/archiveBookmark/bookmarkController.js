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

// 폴더 생성
// export const createFolder = async (req, res) => {
//   try {
//     const { title, type, historyIds, thumbnailUrl, imageUpload } = req.body;

//     const newFolder = await BookmarkFolder.create({
//       title,
//       type,
//       historyIds,
//       thumbnailUrl,
//       imageUpload,
//     });

//     res.status(201).json(newFolder);
//   } catch (err) {
//     console.error("폴더 생성 에러:", err);
//     res.status(500).json({ message: "폴더 생성 실패" });
//   }
// };

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
