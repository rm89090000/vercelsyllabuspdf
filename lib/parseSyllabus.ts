export type TaskType = "assignment" | "exam" | "reading" | "quiz" | "homework" | "other";

export interface CalendarTask {
  id: string;
  title: string;
  type: TaskType;
  date: string;
  description?: string;
}

function detectTaskType(text: string): TaskType {
  const lower = text.toLowerCase();
  if (lower.includes("exam") || lower.includes("final") || lower.includes("oral argument")) return "exam";
  if (lower.includes("quiz")) return "quiz";
  if (lower.includes("assignment") || lower.includes("due") || lower.includes("homework")) return "assignment";
  if (lower.includes("read") || lower.includes("reading")) return "reading";
  return "other";
}

function parseDateLine(line: string, fallbackYear = 2025): string[] {
  const monthMap: { [key: string]: number } = {
    Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
    Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
  };
  const clean = line.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i,"").trim();
  const m = clean.match(/([A-Za-z]+)\.?\s+(\d{1,2})(?:-(\d{1,2}))?,?\s*(\d{4})?/);
  if (!m) return [];
  const month = monthMap[m[1].slice(0,3)];
  const startDay = parseInt(m[2]);
  const endDay = m[3] ? parseInt(m[3]) : startDay;
  const year = m[4] ? parseInt(m[4]) : fallbackYear;
  const dates: string[] = [];
  for(let d=startDay; d<=endDay; d++){
    const dateObj = new Date(year, month, d);
    if (!isNaN(dateObj.getTime())) dates.push(dateObj.toISOString().split("T")[0]);
  }
  return dates;
}

export function parseSyllabus(text: string, fallbackYear = 2025): CalendarTask[] {
  const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
  const tasks: CalendarTask[] = [];
  let currentDates: string[] = [];
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (!buffer.length) return;
    const title = buffer.join(" ").trim();
    const type = detectTaskType(title);
    if (currentDates.length === 0) {
      tasks.push({ id: `${title}-no-date-${tasks.length}`, title, type, date:"", description:title });
    } else {
      for(const date of currentDates){
        tasks.push({ id: `${title}-${date}-${tasks.length}`, title, type, date, description:title });
      }
    }
    buffer = [];
  };

  const dateRegex = /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?,?\s*[A-Za-z]+\.?\s+\d{1,2}(?:-\d{1,2})?,?\s*(\d{4})?\b/i;

  for(const line of lines){
    if (/no class/i.test(line) || /^[IVX]+\./.test(line) || /^INTRODUCTION/i.test(line)) {
      flushBuffer();
      currentDates=[];
      continue;
    }

    const match = line.match(dateRegex);
    if(match){
      flushBuffer();
      currentDates = parseDateLine(match[0], fallbackYear);
      continue;
    }

    buffer.push(line.replace(/^•|§\s*/,"").trim());
  }

  flushBuffer();
  return tasks;
}

