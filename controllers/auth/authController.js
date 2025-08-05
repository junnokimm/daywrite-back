import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const localStrategy = async (req, res, next) => {

    const error = req.error; // 오류
    const authenticatedUser = req.user; // 인증된 유저
    const info = req.info;
    console.log("authenticatedUser", authenticatedUser)

    if(error || !authenticatedUser){
        return res.status(400).json({message: info.message})
    }
    
    // jwt토큰을 발급 해주자!
    req.login(authenticatedUser, {session : false}, async (loginError) => {
        if(loginError) {
            return res.status(400).json({message : "알 수 없는 오류 발생!"})
        }

        // jwt.sign(토큰에 담을 정보, 시크릿 키, 옵션)
        const accessToken = jwt.sign(
            {
                email : authenticatedUser.email,
                issuer : 'daywrite',
            },
            JWT_SECRET,
            {
                expiresIn : '24h'
            }
        )

        return res.status(200).json({
            accessToken : accessToken
        })

    })

}

export const jwtStrategy = async (req, res, next) => {
    try {
        const jwtAuthenticatedUser = req.user;
        const {password, ...user} = jwtAuthenticatedUser;
    
        res.status(200).json({
            message : "자동 로그인 성공",
            user: user
        })
    } catch (error) {
        console.log("authController jwtStrategy error")
        console.error(error)
        next(error)
    }
}