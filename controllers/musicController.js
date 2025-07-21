// controllers/musicController.js
import { getRecommendedTracks } from "../utils/lastfm.js";

const genreMap = {
  '소설': 'pop',
  '시': 'acoustic',
  '에세이': 'chill',
  '철학': 'instrumental',
  '과학': 'electronic',
  '사회': 'hip hop',
  '문화': 'indie',
  '역사': 'classical',
  '종교': 'gospel',
};

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5)
}

export const getMusicByKeywordAndGenre = async (req, res) => {
  const {keywordList, genreList } = req.body;

  if (!Array.isArray(keywordList) || keywordList.length === 0 ||
      !Array.isArray(genreList) || genreList.length === 0) {
    return res.status(400).json({error:"키워드와 장르 리스트가 필요합니다"})
  }
  const mappedGenres = genreList.map(g => genreMap[g] || g); // 매핑 또는 fallback 
  const trackSet = new Set(); // 중복 방지용 세트
  const finalTracks = [];  // 최종 추천곡 목록

  try {
    // 1. 키워드 장르 조합 순회
    for (const keyword of keywordList) {
      for (const genre of mappedGenres) {
        const results = await getRecommendedTracks(keyword, genre);
        for (const track of results) {
          const key = `${track.name}-${track.artist}`; // 곡명과 아티스트로 유일한 식별자 생성함
          if (!trackSet.has(key)) { // 이미 이 곡이 추가됐는지 확인
            finalTracks.push(track); // 처음 본 곡이면 최종 리스트에 추가함
            trackSet.add(key); // 이 곡을 보았음을 기록
          }
          if (finalTracks.length >= 6) break; // 곡이 6개가 되면 중단
        }
        if (finalTracks.length >= 6) break;
      }
      if (finalTracks.length >= 6) break;
    }

  // 2. fallback : keyword 만으로 추가 검색 - 첫 번째 추천 결과가 너무 부족할 때를 위한 대비책
  // --> 기존 조합이 너무 희귀해서 결과가 부족할 때, 장르 없이 "키워드만으로" 다시 추천
  if (finalTracks.length < 5) {
    for (const keyword of keywordList){
      const results = await getRecommendedTracks(keyword, "");
      const shuffled = shuffleArray(results);

      for (const track of shuffled) {
        const key = `${track.name}-${track.artist}`;
        if (!trackSet.has(key)) {
          finalTracks.push(track);
          trackSet.add(key);
        }
        if (finalTracks.length >= 6 ) break;
      }
      if (finalTracks.length >= 6) break;
    }
  }
  return res.status(200).json({tracks: shuffleArray(finalTracks)});
} catch (error) {
  console.log("음악 추천 오류:", error.message);
  return res.status(500).json({error: "음악 추천 중 서버 오류 발생"})
}

};