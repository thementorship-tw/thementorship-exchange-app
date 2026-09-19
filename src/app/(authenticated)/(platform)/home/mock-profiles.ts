import type { ExchangeInfoSortOrder } from "@/shared/api/exchange-info/constants";
import type { ExchangeInfoListItem } from "@/server/exchange-info/exchange-info.repository";
import type { ProfileType } from "@/shared/profile-types";

export type SortOrder = ExchangeInfoSortOrder;
export type ProfileListItem = ExchangeInfoListItem;

export type ListProfilesOptions = {
  types?: ProfileType[];
  keyword?: string;
  order?: SortOrder;
  limit?: number;
};

const DEFAULT_LIMIT = 50;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const mockItems: (Omit<ProfileListItem, "createdAt"> & { agoMs: number })[] = [
  {
    id: "mock-1",
    type: "skillAndInterest",
    offersText: "Figma 元件庫建置、設計系統導入",
    wantsText: "想找人帶我看 React 的狀態管理",
    description:
      "在新創做了三年產品設計，最近開始自己刻前端，卡在什麼時候該把狀態往上提。希望能用設計系統的經驗跟人交換。",
    agoMs: 22 * HOUR,
    author: { nickname: "小魚", group: "UIUX", avatarUrl: null },
  },
  {
    id: "mock-2",
    type: "career",
    offersText: "外商轉職面試經驗、履歷健檢",
    wantsText: "想聊聊轉管理職之後怎麼調整心態",
    description: null,
    agoMs: 3 * HOUR,
    author: { nickname: "Ray", group: "Engineering", avatarUrl: null },
  },
  {
    id: "mock-3",
    type: "skillAndInterest",
    offersText: "台北近郊路線推薦、裝備採購雷點",
    wantsText: "找一起爬山的夥伴，週末為主",
    description: "爬了五年，最近在練長程縱走。平日也可以約吃飯聊工作。",
    agoMs: 40 * MINUTE,
    author: { nickname: "阿哲", group: "Data", avatarUrl: null },
  },
  {
    id: "mock-4",
    type: "skillAndInterest",
    offersText: "資料分析、SQL 與 dbt 實務",
    wantsText: "想學怎麼把分析結果講成一個故事",
    description:
      "報表做得出來，但每次跟 PM 報告都被問「所以呢」。想找擅長溝通或做簡報的人交換。",
    agoMs: 6 * DAY,
    author: { nickname: "Wen", group: "Data", avatarUrl: null },
  },
  {
    id: "mock-5",
    type: "career",
    offersText: "接案報價、跟客戶談合約的經驗",
    wantsText: "想了解在職進修碩士值不值得",
    description: null,
    agoMs: 20 * DAY,
    author: { nickname: "Chloe", group: "UIUX", avatarUrl: null },
  },
  {
    id: "mock-6",
    type: "skillAndInterest",
    offersText: "React 元件拆分與 TypeScript 入門",
    wantsText: "想學 Figma Auto Layout 與版面設計",
    description:
      "平常做前端開發，希望透過一起完成小作品，交換設計與程式的思考方式。",
    agoMs: 2 * HOUR,
    author: { nickname: "Kevin", group: "Engineering", avatarUrl: null },
  },
  {
    id: "mock-7",
    type: "career",
    offersText: "產品經理面試準備、作品集整理",
    wantsText: "想了解從新創轉到大型公司的適應經驗",
    description: null,
    agoMs: 5 * HOUR,
    author: { nickname: "Mia", group: "PM", avatarUrl: null },
  },
  {
    id: "mock-8",
    type: "skillAndInterest",
    offersText: "手沖咖啡入門、磨豆與萃取練習",
    wantsText: "想學在家烘焙麵包",
    description: "週末喜歡研究不同產區的豆子，可以帶器材一起練習。",
    agoMs: 8 * HOUR,
    author: { nickname: "阿良", group: "BD", avatarUrl: null },
  },
  {
    id: "mock-9",
    type: "skillAndInterest",
    offersText: "Python 自動化與試算表資料整理",
    wantsText: "想練習英文工作簡報",
    description: "可以從你手上重複性的工作開始，一起寫出第一支自動化腳本。",
    agoMs: 12 * HOUR,
    author: { nickname: "Iris", group: "Engineering", avatarUrl: null },
  },
  {
    id: "mock-10",
    type: "career",
    offersText: "跨部門專案協作、需求訪談經驗",
    wantsText: "想找人討論職涯方向與長期目標",
    description: null,
    agoMs: 1 * DAY,
    author: { nickname: "Sean", group: "PM", avatarUrl: null },
  },
  {
    id: "mock-11",
    type: "skillAndInterest",
    offersText: "人像攝影、自然光拍攝與修圖",
    wantsText: "想學剪輯旅遊短片",
    description: "有相機或手機都可以，想約戶外實拍，再一起挑照片討論。",
    agoMs: 2 * DAY,
    author: { nickname: "小葵", group: "Marketing", avatarUrl: null },
  },
  {
    id: "mock-12",
    type: "skillAndInterest",
    offersText: "日文會話練習、旅遊行程規劃",
    wantsText: "想學基礎吉他和弦",
    description: null,
    agoMs: 3 * DAY,
    author: { nickname: "Yuki", group: "Marketing", avatarUrl: null },
  },
  {
    id: "mock-13",
    type: "career",
    offersText: "遠端工作溝通與時間安排經驗",
    wantsText: "想了解海外求職的準備過程",
    description:
      "遠端工作兩年，能分享非同步協作的日常，也想聽聽不同市場的工作經驗。",
    agoMs: 4 * DAY,
    author: { nickname: "Allen", group: "Engineering", avatarUrl: null },
  },
  {
    id: "mock-14",
    type: "skillAndInterest",
    offersText: "品牌文案、社群貼文企劃",
    wantsText: "想學 SQL 查詢與行銷成效分析",
    description: "希望能用實際的社群資料練習分析，也能幫你調整品牌介紹和貼文。",
    agoMs: 5 * DAY,
    author: { nickname: "Nina", group: "Marketing", avatarUrl: null },
  },
  {
    id: "mock-15",
    type: "skillAndInterest",
    offersText: "城市慢跑入門、跑步習慣養成",
    wantsText: "想找週末一起練習素描的夥伴",
    description: null,
    agoMs: 7 * DAY,
    author: { nickname: "阿凱", group: "PM", avatarUrl: null },
  },
  {
    id: "mock-16",
    type: "career",
    offersText: "設計主管面試、設計作品集回饋",
    wantsText: "想交流帶領跨國團隊的經驗",
    description: "目前帶領四人設計團隊，想討論回饋方式、工作分配與團隊成長。",
    agoMs: 8 * DAY,
    author: { nickname: "Joanne", group: "UIUX", avatarUrl: null },
  },
  {
    id: "mock-17",
    type: "skillAndInterest",
    offersText: "Excel 樞紐分析、常用公式教學",
    wantsText: "想學做清楚易讀的簡報",
    description: "可以帶自己的練習資料，一起整理報表，再把重點放進簡報。",
    agoMs: 9 * DAY,
    author: { nickname: "柏宇", group: "BD", avatarUrl: null },
  },
  {
    id: "mock-18",
    type: "skillAndInterest",
    offersText: "插畫構圖、Procreate 數位繪畫",
    wantsText: "想學個人作品網站的製作",
    description: null,
    agoMs: 10 * DAY,
    author: { nickname: "小鹿", group: "UIUX", avatarUrl: null },
  },
  {
    id: "mock-19",
    type: "career",
    offersText: "非本科轉職工程師的學習規劃",
    wantsText: "想交流第一份工程師工作的成長方向",
    description:
      "從行政轉職前端一年多，可以分享學習安排和面試準備，也想認識同階段的夥伴。",
    agoMs: 11 * DAY,
    author: { nickname: "Eric", group: "Engineering", avatarUrl: null },
  },
  {
    id: "mock-20",
    type: "skillAndInterest",
    offersText: "Podcast 錄音、基礎音訊剪輯",
    wantsText: "想學訪談提問與故事寫作",
    description: "有經營小型節目，可以一起試錄一段訪談，互相提供回饋。",
    agoMs: 12 * DAY,
    author: { nickname: "安安", group: "Marketing", avatarUrl: null },
  },
  {
    id: "mock-21",
    type: "skillAndInterest",
    offersText: "家常料理、每週備餐安排",
    wantsText: "想練習旅遊英文對話",
    description: null,
    agoMs: 14 * DAY,
    author: { nickname: "Ruby", group: "Data", avatarUrl: null },
  },
  {
    id: "mock-22",
    type: "career",
    offersText: "業務轉客戶成功的轉職經驗",
    wantsText: "想了解產品營運的日常工作",
    description: "想和不同職能的人聊聊工作內容，也可以分享客戶溝通與交接經驗。",
    agoMs: 16 * DAY,
    author: { nickname: "Marcus", group: "BD", avatarUrl: null },
  },
  {
    id: "mock-23",
    type: "skillAndInterest",
    offersText: "網頁無障礙檢查、鍵盤操作設計",
    wantsText: "想學使用者訪談與可用性測試",
    description: "可以一起檢查作品中的表單、焦點順序與對比，交換研究方法。",
    agoMs: 18 * DAY,
    author: { nickname: "Tina", group: "Engineering", avatarUrl: null },
  },
  {
    id: "mock-24",
    type: "career",
    offersText: "新人入職引導、內部知識文件整理",
    wantsText: "想討論如何建立個人專業作品集",
    description: null,
    agoMs: 23 * DAY,
    author: { nickname: "子晴", group: "BD", avatarUrl: null },
  },
  {
    id: "mock-25",
    type: "skillAndInterest",
    offersText: "桌遊教學、聚會活動規劃",
    wantsText: "想找一起練習攝影構圖的朋友",
    description: "喜歡合作型與策略桌遊，可以從規則簡單的遊戲開始認識彼此。",
    agoMs: 28 * DAY,
    author: { nickname: "阿牧", group: "Engineering", avatarUrl: null },
  },
];

/** 讀取公開的交流檔案列表；目前回傳寫死的假資料。 */
export async function listProfiles({
  types = [],
  keyword = "",
  order = "newest",
  limit = DEFAULT_LIMIT,
}: ListProfilesOptions = {}): Promise<ProfileListItem[]> {
  const now = Date.now();
  const needle = keyword.toLowerCase();

  return mockItems
    .filter((item) => types.length === 0 || types.includes(item.type))
    .filter(
      (item) =>
        needle === "" ||
        [item.offersText, item.wantsText, item.description ?? ""].some((text) =>
          text.toLowerCase().includes(needle),
        ),
    )
    .map(({ agoMs, ...item }) => ({
      ...item,
      createdAt: new Date(now - agoMs),
    }))
    .sort((a, b) =>
      order === "newest"
        ? b.createdAt.getTime() - a.createdAt.getTime()
        : a.createdAt.getTime() - b.createdAt.getTime(),
    )
    .slice(0, limit);
}
