import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";

// 회원가입
export const register = async (req,res) => {

    // 회원 유무 확인
    const foundUser = await User.findOne({email: req.body.email}).lean() // .lean() Js에 직접 객체로 바꾸기 위한 메소드

    // 회원이 있을 때
    if(foundUser){
      console.log("요청확인!!!!!!")
      return res.status(409).json({ //mdn 상태코드 409 충돌 에러
          registerStatus : false,
          message : `이미 존재하는 이메일입니다. (${foundUser.provider})`
      })
    }else {
      // 회원 정보가 없을 때 유저를 등록
      console.log(req.body)
      const {email, password, nickname, name} = req.body

      // // 비밀번호 암호화 - 추가함
      // const hashedPassword = await bcrypt.hash(password, 10)
    const saltRouns = 10; // 해시 강도 (설정값이 높으면 더 안전하다. 그 대신 느려진다.)
    bcrypt.hash(password, saltRouns, async (err, hashedPassword) => {
      if(err){
        console.error(err)
      }else {
        // 유저를 등록
      await User.create({
        email,
        // password : password,
        password: hashedPassword,  // 암호화된 비밀번호로 저장 - 수정함
        nickname,
        name
      })

      // 상태를 화면으로 보낸다.
      res.status(200).json({
        registerSuccess : true,
        message : "축하합니다. 회원가입이 완료 되었습니다."
      })
    }
    })
  }
};


// 로그인
export const loginUser = async (req, res) => {
  const {email, password} = req.body

  // 1. 회원 찾는다.
  const foundUser = await User.findOne({email: email}).lean()

  if(!foundUser){
    return res.status(401).json({
      loginSuccess : false,
      message : "존재하지 않는 이메일입니다."
    })
  }else {
    // 유저가 있다면
    // 비밀번호 검사
    const hashedPassword = foundUser.password;
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if(err){
        console.error(err)
      }else if(result){
        // 비밀번호 일치
        const {password, ...currentUser} = foundUser;
        
        return res.status(200).json({
          currentUser : currentUser,
          isLogin : true,
          message : "로그인이 완료되었습니다."
        })

      }else {
        // 비밀번호 불일치
          return res.status(401).json({
          isLogin : false,
          message : "비밀번호를 확인해주세요."
        })

      }
    })
  }


}

// 회원정보 수정
export const modifyUser = (req, res) => {}

// 회원탈퇴
export const removeUser = (req, res) => {}

// 프로필 변경
export const modifyPicture = (req, res) => {}