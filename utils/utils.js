import moment from "moment";

export const getCurrentTime = () => {
  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  return now;
};

export const getCurrentDate = () => {
  const now = moment().format("YYYY-MM-DD");
  return now;
};

//연속 일수 계산 
export const calculateLoginStreak = (lastLoginDate, consecutiveDays) => {
  const today = getCurrentDate();
  const yesterday = moment().subtract(1, 'days').format("YYYY-MM-DD");
  
  if (!lastLoginDate) {
    return { consecutiveDays: 1, isNewStreak: true };
  }
  
  //같은 날 다시 로그인해도 연속 출석일 올리지 않기 
  if (lastLoginDate === today) {
    return { consecutiveDays, isNewStreak: false };
  }
  
  if (lastLoginDate === yesterday) {
    return { consecutiveDays: consecutiveDays + 1, isNewStreak: false };
  }
  
  return { consecutiveDays: 1, isNewStreak: true };
};
