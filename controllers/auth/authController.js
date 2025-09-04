import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../../models/userSchema.js'
import Level from '../../utils/leve.js'
import { calculateLoginStreak, getCurrentDate } from '../../utils/utils.js'

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const localStrategy = async (req, res, next) => {
    console.log('=== authController.localStrategy 시작 ===');

    const error = req.error;
    const authenticatedUser = req.user;
    const info = req.info;
    console.log("authenticatedUser", authenticatedUser)
    console.log("error", error)
    console.log("info", info)

    if(error || !authenticatedUser){
        return res.status(400).json({message: info.message})
    }
    
    // jwt토큰을 발급 해주자!
    req.login(authenticatedUser, {session : false}, async (loginError) => {
        if(loginError) {
            return res.status(400).json({message : "알 수 없는 오류 발생!"})
        }

        try {
            // 연속 출석 계산 및 처리
            console.log('로그인 전 사용자 정보:', {
              lastLoginDate: authenticatedUser.lastLoginDate,
              consecutiveLoginDays: authenticatedUser.consecutiveLoginDays
            });
            
            const streakResult = calculateLoginStreak(
              authenticatedUser.lastLoginDate, 
              authenticatedUser.consecutiveLoginDays || 0
            );

            console.log('연속출석 계산 결과:', streakResult);

            let bonusXP = 0;
            let streakMessage = "";

            // 새로운 출석이거나 연속 출석이 증가한 경우
            if (streakResult.isNewStreak || streakResult.consecutiveDays > authenticatedUser.consecutiveLoginDays) {
              bonusXP = Level.getAttendanceBonusExp(streakResult.consecutiveDays);
              
              // 새로운 총 경험치 계산
              const newTotalExp = authenticatedUser.exp + bonusXP;
              
              // 레벨 계산
              const levelInfo = Level.calculateLevelFromExp(newTotalExp);
              const oldLevel = authenticatedUser.level || 1;
              const newLevel = levelInfo.level;
              
              // 사용자 정보 업데이트
              await User.findByIdAndUpdate(
                authenticatedUser._id, 
                {
                  consecutiveLoginDays: streakResult.consecutiveDays,
                  lastLoginDate: getCurrentDate(),
                  exp: newTotalExp,
                  level: newLevel
                }
              );

              streakMessage = `연속 출석 ${streakResult.consecutiveDays}일! +${bonusXP}XP 획득!`;
              
              // 레벨업 체크
              if (newLevel > oldLevel) {
                streakMessage += ` 레벨업! ${oldLevel} → ${newLevel}`;
                console.log(`🎉 레벨업! ${oldLevel} → ${newLevel}`);
              }
              
              console.log('연속출석 업데이트 완료:', streakMessage);
            }

            // jwt.sign(토큰에 담을 정보, 시크릿 키, 옵션)
            const accessToken = jwt.sign(
                {
                    userId: String(authenticatedUser._id),
                    email: authenticatedUser.email,
                    issuer: 'daywrite',
                },
                JWT_SECRET,
                {
                    expiresIn: '7d'
                }
            )

            // 응답에 user도 같이 내려줌
            const { password, ...user } = authenticatedUser.toObject ? authenticatedUser.toObject() : authenticatedUser;

            return res.status(200).json({
                message: "로그인 성공",
                accessToken: accessToken,
                user: user,
                streakInfo: {
                    consecutiveDays: streakResult.consecutiveDays,
                    bonusXP: bonusXP,
                    message: streakMessage
                }
            })

        } catch (updateError) {
            console.error('연속 출석 처리 오류:', updateError);
            // 연속 출석 처리 실패해도 로그인은 성공 처리
            const accessToken = jwt.sign(
                {
                    userId: String(authenticatedUser._id),
                    email: authenticatedUser.email,
                    issuer: 'daywrite',
                },
                JWT_SECRET,
                {
                    expiresIn: '7d'
                }
            )

            const { password, ...user } = authenticatedUser.toObject ? authenticatedUser.toObject() : authenticatedUser;

            return res.status(200).json({
                message: "로그인 성공",
                accessToken: accessToken,
                user: user
            })
        }

    })
}

export const jwtStrategy = async (req, res, next) => {
    try {
        const jwtAuthenticatedUser = req.user;
        const {password, ...user} = jwtAuthenticatedUser?.toObject
            ? jwtAuthenticatedUser.toObject()
            : jwtAuthenticatedUser;

        return res.status(200).json({
            message : "자동 로그인 성공",
            user: user
        })
    } catch (error) {
        console.error("authController jwtStrategy error", error);
        next(error);
    }
}