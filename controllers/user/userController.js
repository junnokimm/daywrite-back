import User from "../../models/userSchema.js";

// 회원가입
export const register = async (req,res) => {

    // 회원 유무 확인
    const foundUser = await User.findOne({email: req.body.email}).lean() // .lean() Js에 직접 객체로 바꾸기 위한 메소드

    // 회원이 있을 때
    if(foundUser){
      console.log("요청확인!!!!!!")
      return req.status(409).json({ //mdn 상태코드 409 충돌 에러
          registerStatus : false,
          message : `이미 존재하는 이메일입니다. (${foundUser.provider})`
      })
    }else {
      // 회원 정보가 없을 때 유저를 등록
      const {email, password, nickname, name} = req.body
      await User.create({
        email : email,
        password : password,
        nickname : nickname,
        // name : name
      })

      // 상태를 화면으로 보낸다.
      res.status(201).json({
        registerSuccess : true,
        message : "축하합니다. 회원가입이 완료 되었습니다."
      })
    }

};