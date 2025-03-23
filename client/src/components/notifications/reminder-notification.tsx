import React from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CalendarDays, X } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import type { VisaTask } from "@shared/schema";

// 文化的なヒントのリスト
interface CulturalFact {
  title: string;
  fact: string;
  emoji: string;
}

const culturalFacts: CulturalFact[] = [
  {
    title: "フランスの地域の多様性",
    fact: "フランスには22の地域（régions）があり、それぞれ独自の文化、料理、そして時には独自の言語も持っています。",
    emoji: "🗺️",
  },
  {
    title: "フランスの挨拶",
    fact: "フランス人同士の挨拶では頬にキス（ビズ）をするのが一般的です。地域によって2回から4回まで異なります。",
    emoji: "😘",
  },
  {
    title: "パン文化",
    fact: "フランスでは毎日新鮮なバゲットを買うのが習慣です。サクサクの外側とふわふわの内側が特徴的なバゲットは、文化遺産として登録されています。",
    emoji: "🥖",
  },
  {
    title: "カフェ文化",
    fact: "フランスのカフェはただのコーヒーショップではなく、社交と文化交流の場です。何時間も座ってコーヒー一杯で過ごすことも一般的です。",
    emoji: "☕",
  },
  {
    title: "フランスのシエスタ",
    fact: "特に南フランスでは、暑い日中に「シエスタ」と呼ばれる昼寝の時間があります。多くの店がこの時間帯に閉まります。",
    emoji: "😴",
  },
];

// ランダムな文化的事実を取得
const getRandomCulturalFact = (): CulturalFact => {
  const randomIndex = Math.floor(Math.random() * culturalFacts.length);
  return culturalFacts[randomIndex];
};

interface ReminderNotificationProps {
  task: VisaTask;
  onClose: () => void;
  onViewTask: () => void;
}

export const ReminderNotification: React.FC<ReminderNotificationProps> = ({
  task,
  onClose,
  onViewTask,
}) => {
  // ランダムな文化的事実を取得
  const culturalFact = getRandomCulturalFact();

  return (
    <Card className="mb-4 border border-orange-200 bg-orange-50 shadow-lg animate-fadeIn max-w-md">
      <CardHeader className="pb-2 pt-3 px-4 flex flex-row justify-between items-start space-y-0 bg-gradient-to-r from-orange-100 to-amber-100">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-base font-medium text-gray-800">
            期限が近いタスク
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-3 pb-1 px-4">
        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          {task.dueDate && (
            <div className="text-sm flex items-center gap-1.5 text-orange-700">
              <CalendarDays className="h-4 w-4" />
              <span>
                期限:{" "}
                {format(new Date(task.dueDate), "yyyy年MM月dd日", {
                  locale: ja,
                })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 bg-white p-3 rounded-md border border-indigo-100 text-sm">
          <div className="flex items-center gap-2 mb-1 text-indigo-700">
            <span className="text-lg">{culturalFact.emoji}</span>
            <h5 className="font-medium">{culturalFact.title}</h5>
          </div>
          <p className="text-gray-600">{culturalFact.fact}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 px-4">
        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          onClick={onViewTask}
        >
          タスクを確認する
        </Button>
      </CardFooter>
    </Card>
  );
};
