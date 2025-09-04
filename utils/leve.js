
class Level {
  static WRITING_EXP = 10;
  static MAX_LEVEL = 100;

  /**
   * 각 레벨에 도달하기까지 필요한 경험치
   * @param {number} level - 목표 레벨
   * @returns {number} 해당 레벨까지 필요한 총 경험치
   */
  static getTotalExpRequiredForLevel(level) {
    if (level <= 1) return 0;
    if (level === 2) return 50;
    if (level === 3) return 150;
    if (level === 4) return 300;
    if (level === 5) return 500;
    if (level === 6) return 750;
    if (level === 7) return 1050;
    if (level === 8) return 1400;
    if (level === 9) return 1800;
    if (level === 10) return 2250;
  }

  /**
   * 특정 레벨에서 다음 레벨까지 필요한 경험치
   * @param {number} currentLevel - 현재 레벨
   * @returns {number} 다음 레벨까지 필요한 경험치
   */
  static getExpRequiredForNextLevel(currentLevel) {
    const currentLevelExp = this.getTotalExpRequiredForLevel(currentLevel);
    const nextLevelExp = this.getTotalExpRequiredForLevel(currentLevel + 1);
    return nextLevelExp - currentLevelExp;
  }

  /**
   * 총 경험치로부터 현재 레벨 정보 계산
   * @param {number} totalExp - 총 누적 경험치
   * @returns {object} 레벨 정보 객체
   */
  static calculateLevelFromExp(totalExp) {
    let level = 1;
    
    // 현재 총 경험치로 레벨 찾기
    while (level < this.MAX_LEVEL) {
      const requiredForNextLevel = this.getTotalExpRequiredForLevel(level + 1);
      if (totalExp < requiredForNextLevel) {
        break;
      }
      level++;
    }
    
    // 현재 레벨에서의 경험치 계산
    const currentLevelRequiredExp = this.getTotalExpRequiredForLevel(level);
    const currentExp = totalExp - currentLevelRequiredExp;
    
    // 다음 레벨까지 필요한 경험치
    const expForNextLevel = level >= this.MAX_LEVEL ? 0 : this.getExpRequiredForNextLevel(level);
    const expToNext = level >= this.MAX_LEVEL ? 0 : expForNextLevel - currentExp;
    
    return {
      level,
      currentExp, // 현재 레벨에서의 경험치
      expToNext, // 다음 레벨까지 남은 경험치
      expForNextLevel, // 다음 레벨까지 필요한 총 경험치
      totalExp,
      isMaxLevel: level >= this.MAX_LEVEL
    };
  }

  /**
   * 연속 출석일에 따른 보너스 경험치 계산
   */
  static getAttendanceBonusExp(consecutiveDays) {
    if (consecutiveDays >= 30) return 30;
    if (consecutiveDays >= 15) return 20;
    if (consecutiveDays >= 7) return 15;
    if (consecutiveDays >= 3) return 10;
    if (consecutiveDays >= 1) return 5;
    return 0;
  }

  /**
   * 히스토리 저장 시 획득 경험치 계산
   */
  static calculateHistorySaveReward() {
    const baseExp = this.WRITING_EXP;

    return {
      baseExp,
      totalExp: baseExp,
      breakdown: `필사 완료 ${baseExp}XP`
    };
  }

  /**
   * 레벨 진행률 계산 (퍼센트)
   */
  static getLevelProgress(currentExp, expForNextLevel) {
    if (expForNextLevel === 0) return 100; // 맥스 레벨
    return Math.floor((currentExp / expForNextLevel) * 100);
  }

  /**
   * 출석 보너스 단계별 정보 반환
   */
  static getAttendanceBonusInfo(consecutiveDays) {
    const currentBonus = this.getAttendanceBonusExp(consecutiveDays);
    
    let nextMilestone = null;
    let daysToNext = null;
    
    if (consecutiveDays < 3) {
      nextMilestone = { days: 3, bonus: 10 };
      daysToNext = 3 - consecutiveDays;
    } else if (consecutiveDays < 7) {
      nextMilestone = { days: 7, bonus: 15 };
      daysToNext = 7 - consecutiveDays;
    } else if (consecutiveDays < 15) {
      nextMilestone = { days: 15, bonus: 20 };
      daysToNext = 15 - consecutiveDays;
    } else if (consecutiveDays < 30) {
      nextMilestone = { days: 30, bonus: 30 };
      daysToNext = 30 - consecutiveDays;
    }

    return {
      currentBonus,
      consecutiveDays,
      nextMilestone,
      daysToNext,
      isMaxBonus: consecutiveDays >= 30
    };
  }

  /**
   * 레벨업 시뮬레이션
   */
  static simulateLevelUp(currentTotalExp, expToAdd) {
    const beforeLevel = this.calculateLevelFromExp(currentTotalExp);
    const afterLevel = this.calculateLevelFromExp(currentTotalExp + expToAdd);
    
    return {
      before: beforeLevel,
      after: afterLevel,
      leveledUp: afterLevel.level > beforeLevel.level,
      levelsGained: afterLevel.level - beforeLevel.level,
      expAdded: expToAdd
    };
  }

  /**
   * 레벨별 경험치 테이블 반환 (디버깅/확인용)
   */
  static getLevelExpTable(maxLevel = 10) {
    const table = [];
    for (let level = 1; level <= maxLevel; level++) {
      table.push({
        level,
        totalExpRequired: this.getTotalExpRequiredForLevel(level),
        expForNextLevel: level < maxLevel ? this.getExpRequiredForNextLevel(level) : 0
      });
    }
    return table;
  }
}

export default Level;