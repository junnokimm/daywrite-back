import CollectionList from "../../../models/collectionListSchema.js";
import { getCurrentTime } from "../../../utils/utils.js";

export const collectionTyped = async (req, res) => {

  try {
      const collectionTyped = await CollectionList.find()

      res.status(200).json({
        message : "collectionTyped 조회 완료",
        collectionTyped : collectionTyped
      })

    } catch (error) {
      console.err(`ControllerTyped ${error}`)
      res.status(500).json({message: "알 수 없는 예외 발생!"})
    }

}

export const collectionPlayed = async (req, res) => {

    try {
        const collectionPlayed = await CollectionList.find()

        res.status(200).json({
            message : "collectionPlayed 조회 완료",
            collectionPlayed : collectionPlayed
        })
    } catch (error) {
        console.err(`ControllerPlaed ${error}`)
        res.status(500).json({message : "알 수 없는 예외 발생!"})
    }

}

export const collectionTypedRemove = async (req, res) => {
    const collectionTypedId = req.params.id;
    
    try {
        await CollectionList.deleteMany({_id : collectionTypedId})
        res.status(200).json({
            message : "정상적으로 삭제 완료"
        })
    } catch (error) {
        console.log("collectonTyped remove error!!")
        res.status(500).json({
            message : "삭제 시 오류가 발생했습니다."
        })
    }
}
