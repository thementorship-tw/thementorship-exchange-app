export const profileTypes = ["skillAndHobby", "career"] as const;
export type ProfileType = (typeof profileTypes)[number];

export type SortOrder = "newest" | "oldest";

/** 列表查詢回傳的單筆交流檔案，含刊登者的顯示欄位。 */
export type ProfileListItem = {
  id: string;
  type: ProfileType;
  offersText: string;
  wantsText: string;
  description: string | null;
  createdAt: Date;
  authorNickname: string;
  authorJobTitle: string | null;
  authorAvatarUrl: string | null;
};

export type ListProfilesOptions = {
  types?: ProfileType[];
  order?: SortOrder;
  limit?: number;
};

const DEFAULT_LIMIT = 50;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * createdAt 用「離現在多久」表示，卡片上的相對時間才不會隨著日子過去愈來愈舊。
 */
const mockItems: (Omit<ProfileListItem, "createdAt"> & { agoMs: number })[] = [
  {
    id: "mock-1",
    type: "skillAndHobby",
    offersText: "Figma 元件庫建置、設計系統導入",
    wantsText: "想找人帶我看 React 的狀態管理",
    description:
      "在新創做了三年產品設計，最近開始自己刻前端，卡在什麼時候該把狀態往上提。希望能用設計系統的經驗跟人交換。",
    agoMs: 22 * HOUR,
    authorNickname: "小魚",
    authorJobTitle: "UI/UX",
    authorAvatarUrl: null,
  },
  {
    id: "mock-2",
    type: "career",
    offersText: "外商轉職面試經驗、履歷健檢",
    wantsText: "想聊聊轉管理職之後怎麼調整心態",
    description: null,
    agoMs: 3 * HOUR,
    authorNickname: "Ray",
    authorJobTitle: "Backend Engineer",
    authorAvatarUrl: null,
  },
  {
    id: "mock-3",
    type: "skillAndHobby",
    offersText: "台北近郊路線推薦、裝備採購雷點",
    wantsText: "找一起爬山的夥伴，週末為主",
    description: "爬了五年，最近在練長程縱走。平日也可以約吃飯聊工作。",
    agoMs: 40 * MINUTE,
    authorNickname: "阿哲",
    authorJobTitle: null,
    authorAvatarUrl: null,
  },
  {
    id: "mock-4",
    type: "skillAndHobby",
    offersText: "資料分析、SQL 與 dbt 實務",
    wantsText: "想學怎麼把分析結果講成一個故事",
    description:
      "報表做得出來，但每次跟 PM 報告都被問「所以呢」。想找擅長溝通或做簡報的人交換。",
    agoMs: 6 * DAY,
    authorNickname: "Wen",
    authorJobTitle: "Data Analyst",
    authorAvatarUrl: null,
  },
  {
    id: "mock-5",
    type: "career",
    offersText: "接案報價、跟客戶談合約的經驗",
    wantsText: "想了解在職進修碩士值不值得",
    description: null,
    agoMs: 20 * DAY,
    authorNickname: "Chloe",
    authorJobTitle: "Freelance Designer",
    authorAvatarUrl: null,
  },
];

/** 讀取公開的交流檔案列表；目前回傳寫死的假資料。 */
export async function listProfiles({
  types = [],
  order = "newest",
  limit = DEFAULT_LIMIT,
}: ListProfilesOptions = {}): Promise<ProfileListItem[]> {
  const now = Date.now();

  return mockItems
    .filter((item) => types.length === 0 || types.includes(item.type))
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
