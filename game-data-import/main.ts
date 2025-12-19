import path from "path";
import XLSX from "xlsx";
import "dotenv/config";
import { createSection, type CreateSectionInput } from "./lib/section.js";
import { getUsers } from "./lib/user.js";
import { createGame, type CreateGameInput } from "./lib/game.js";

function dateParser(dateString: string): Date {
  const year = Number(dateString.substring(0, 4)); // "2025"
  const month = Number(dateString.substring(4, 6)); // "12"
  const day = Number(dateString.substring(6, 8)); // "20"

  return new Date(year, month - 1, day);
}

function getDefaultName(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

function getUserIdByName(users: { id: string; displayName: string }[], name: string): string {
  const user = users.find((user) => user.displayName === name);

  if(!user) {
    throw new Error(`ユーザーが見つかりません: ${name}`);
  }

  return user.id;
}

const fullPath = path.join(process.cwd(), "麻雀計算2025.05.xlsx");
const workbook = XLSX.readFile(fullPath);
const sheetNames = workbook.SheetNames.filter((name) =>
  name.startsWith("2025")
);

const users = await getUsers();
const createdByUserId = getUserIdByName(users, "だいち");

sheetNames.forEach(async (sheetName) => {
  const date = dateParser(sheetName);
  const worksheet = workbook.Sheets[sheetName]!;
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    { defval: null }
  );
  const slicedData = Object.fromEntries(
    Object.entries(jsonData[0]!).slice(1, 5)
  );

  const participantNames = Object.keys(slicedData).filter((key) => key !== "__EMPTY");
  const startingPoints = jsonData.find((row) => row["プレイヤー名"] == "持ち点")![participantNames[0]!] as number;
  const rate = jsonData.find((row) => row["プレイヤー名"] == "レート")![participantNames[0]!] as number * 1000;
  const participantIds = participantNames.map((name) => getUserIdByName(users, name)!);

  const section: CreateSectionInput = {
    name: `${sheetName} (${getDefaultName(date)})`,
    startingPoints: startingPoints,
    returnPoints: startingPoints,
    rate: rate,
    playerCount: participantNames.length,
    participantIds: participantIds,
    createdBy: createdByUserId!,
    createdAt: date,
  }

  const createedSectionId = await createSection(section);
  console.log(`セクションを作成しました: ${section.name} (ID: ${createedSectionId})`);

  for (let i = 0; i <= 9; i++) {
    const gameRow = jsonData[i]!;

    if (!gameRow[participantNames[0]!]) {
      break;
    }
    
    const scores: CreateGameInput["scores"] = participantNames.map((name) => ({
      userId: getUserIdByName(users, name),
      points: gameRow[name] as number,
    }))

    const game: CreateGameInput = {
      sectionId: createedSectionId,
      gameNumber: i + 1,
      scores: scores,
    }

    await createGame(game);
  }
});
