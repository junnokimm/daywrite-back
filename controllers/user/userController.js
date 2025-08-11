import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";


// 회원가입
export const register = async (req,res) => {

    // 1. 회원 유무 확인
    const foundUser = await User.findOne({email: req.body.email}).lean() // .lean() Js에 직접 객체로 바꾸기 위한 메소드

    // 2. 회원이 있을 때 - 회원가입 할 수 없다.
    if(foundUser){
      console.log("요청확인!!!!!!")
      return res.status(409).json({ //mdn 상태코드 409 충돌 에러
          registerStatus : false,  //상태표시
          message : `이미 존재하는 이메일입니다. (${foundUser.provider})`
      })
    }else {
      // 3. 회원 정보가 없을 때 유저를 등록
      console.log(req.body)
      const {name, email, password, nickname, phonenum} = req.body
      
      // 4. 비밀번호 암호화 - 추가함
      // const hashedPassword = await bcrypt.hash(password, 10)
    const saltRouns = 10; // 해시 강도 (설정값이 높으면 더 안전하다. 그 대신 느려진다.)
    bcrypt.hash(password, saltRouns, async (err, hashedPassword) => {
      if(err){
        console.error(err)
      }else {
        // 5. 유저를 등록
        await User.create({
          name,
          phonenum,
          email,
          nickname,
          password: hashedPassword
        })

        // 6. 상태를 화면으로 보낸다.
        res.status(201).json({
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
        console.log("result", result)
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

// 아이디 찾기
export const findUserId = async (req, res) => {
  const { name, phonenum } = req.body;

  try {
    const user = await User.findOne({ name, phonenum }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "일치하는 사용자가 없습니다.",
      });
    }

    return res.json({
      success: true,
      email: user.email,
    });
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    return res.status(500).json({
      success: false,
      message: "서버 오류",
    });
  }
};


// 비밀번호 찾기
export const findUserPassword = async (req, res) => {
  const { name, phonenum, email } = req.body;

  try {
    const user = await User.findOne({ name, phonenum, email }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "일치하는 사용자가 없습니다." });
    }

    // 실제 서비스에서는 임시 비밀번호를 발송하거나 인증 후 비밀번호 재설정을 유도해야 합니다.
    return res.json({ success: true, message: "비밀번호 재설정 링크를 이메일로 보내드립니다." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};


// 비밀번호 재설정
export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: '존재하지 않는 이메일입니다.' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ success: true, message: '비밀번호가 재설정되었습니다.' });
  } catch (err) {
    console.error('비밀번호 재설정 오류:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
};


// 회원정보 수정
export const modifyUser = async (req, res) => {
  const { id } = req.params;
  const { nickname, password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    // 닉네임 수정
    if (nickname && typeof nickname === 'string') {
      user.nickname = nickname;
    }

    // 비밀번호 수정
    if (password && typeof password === 'string' && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // 프로필 이미지 수정
    if (req.file && req.file.filename) {
      user.profileImageUrl = `/uploads/profile/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    if (!updatedUser) {
      throw new Error("사용자 정보 저장 실패");
    }

    const { password: _, ...userWithoutPassword } = updatedUser.toObject();

    return res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error("회원정보 수정 오류:", err.message);
    return res.status(500).json({ message: "서버 오류", detail: err.message });
  }
};

export const checkNicknameDuplicate = async (req, res) => {
  try {
    const { nickname } = req.query;

    if (!nickname || nickname.trim() === '') {
      return res.status(400).json({ message: '닉네임을 입력해주세요.' });
    }

    const existing = await User.findOne({ nickname });

    if (existing) {
      return res.status(409).json({ message: '이미 사용 중인 닉네임입니다.' });
    }

    return res.status(200).json({ message: '사용 가능한 닉네임입니다.' });
  } catch (err) {
    console.error("닉네임 중복 확인 오류:", err);
    return res.status(500).json({ message: '서버 오류입니다.' });
  }
};


// 회원탈퇴
export const removeUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json({ message: "회원 탈퇴가 완료되었습니다." });
  } catch (err) {
    console.error("회원 탈퇴 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 프로필 변경
export const modifyPicture = (req, res) => {}
