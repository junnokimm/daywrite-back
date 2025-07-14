import MainScript from "../../../models/mainScriptSchema.js";

export const register = async (req, res) => {
  console.log("register 요청 들어왔음!😁")

  const {title} = req.body;

  const main = {
    title: title,
  }

  // 
  try {
    await MainScript.create(main)
  } catch (error) {
    console.error(`todoController register ${error}`)
    return res.status(500).json({
      message : "데이터를 추가하는 중 오류 발생"
    })
  }

  res.status(200).json({
    message: "할 일 추가가 완료되었습니다.😊"
  })
}