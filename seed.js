import mongoose from "mongoose";
import connect from "./connect/connect.js";
import dotenv from "dotenv";
import scriptSchema from "./models/main/scriptSchema.js";

dotenv.config();
connect();

const seedData = [
  {
    content:
      "끝없이 물음표가 차올랐지만 하나도 묻지 못했다. 모르는 채로 있고 싶었다. 천희는 종잡을 수 없는 사람. 그저 빠지는 것만으로 재밌었다. 나는 저 사람을 전혀 모른다는 것이 좋았다. 모르고 있고 모르는 와중인 것이. 하나를 알아도 그다음이 축적되지 않았다. 그런 사람을 아는 게 즐거웠다. 아니 모르는 일이 즐거웠다. 모르는 상태에서 빠져나오고 싶지 않았다. 뱅글뱅글 돌며 어질어질하게 살고 싶었는데. 실제로 그 기간은 매우 짧았다. 강렬했기 때문에 길게 느껴졌다.",
    book: "나주에 대하여",
    author: "김화진",
    publisher: "문학동네",
    publishedDate: "2022-10-26",
    bookCover:
      "https://i.postimg.cc/gJ7RNpKw/XL-12.jpg",
    keyword: ["사랑", "설렘"],
    genre: "소설",
  },
  {
    content:
      "<그만 살고 싶다>는 바람에 걸려 넘어질 때가 있다. 넘어지면 바로 일어나지 못하고 주저앉아 한참을 울어야 일어날 수 있다. 나이 들면 괜찮아질까 덜 넘어질까 기대했는데, 나이 들수록 더 깊이 넘어지고 일어날 때마다 겸연쩍다. 삶과 죽음 말고 다른 것은 없는가 중얼거리면서 시스템 종료 대신 다시 시작을 누르는 순간들. 매일 생각한다. 매우 사랑하면서도 겁내는 것이다. 이 삶을.",
    book: "비상문",
    author: "최진영",
    publisher: "미메시스",
    publishedDate: "2018-09-01",
    bookCover:
      "https://i.postimg.cc/pVY5mKwh/XL-11.jpg",
    keyword: ["외로움", "우울한"],
    genre: "소설",
  },
  {
    content:
      "생각과 통제력을 내려놓기, 내면을 돌아보고 경청하기, 현재에 집중하기, 정기적으로 편안하게 쉬기, 신뢰하며 살기. 이 모든 것들은 서로 연결되어 있습니다. 모두 생각에 휘둘리는 대신 우리의 현실에 더 깊이 뿌리내린 소중한 것들을 탐지하는 일이지요. 생각이 거품처럼 이는 곳에서 등을 돌리는 일이라고 볼 수도 있겠습니다. 그 순간 이상하게도 우리의 생각은 더 가치를 띠게 되지요. 우리 안의 현명한 직관이 더 활발하게 움직이기 시작합니다. 가혹하게 들릴지 모르지만 이 과정을 통해서 생각의 질이 개선됩니다.",
    book: "내가 틀릴 수도 있습니다",
    author: "비욘 나티코 린데블라드",
    publisher: "다산초당",
    publishedDate: "2024-01-08",
    bookCover:
      "https://i.postimg.cc/zG9GtBmY/XL-1.jpg",
    keyword: ["위로", "마음"],
    genre: "인문",
  },
];

const seedDatabase = async () => {
  try {
    await scriptSchema.deleteMany(); // 기존 데이터 삭제
    await scriptSchema.insertMany(seedData);
    console.log("✅ 추천글 DB 초기화 완료!");
    process.exit();
  } catch (error) {
    console.error("❌ DB 초기화 실패!", error);
    process.exit(1);
  }
};

seedDatabase();
