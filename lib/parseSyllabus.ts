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
  if (lower.includes("exam") || lower.includes("oral argument")) return "exam";
  if (lower.includes("quiz")) return "quiz";
  if (lower.includes("assignment") || lower.includes("due") || lower.includes("homework")) return "assignment";
  if (lower.includes("read") || lower.includes("reading")) return "reading";
  return "other";
}

function parseDate(line: string, fallbackYear = 2025): string | null {
  let m = line.match(/([A-Za-z]+)\.?\s+(\d{1,2}),?\s*(\d{4})?/);
  if (!m) return null;

  const monthMap: Record<string, number> = {
    Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
    Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
  };
  
  const month = monthMap[m[1].slice(0,3)];
  const day = parseInt(m[2]);
  const year = m[3] ? parseInt(m[3]) : fallbackYear;

  const dt = new Date(year, month, day);
  return !isNaN(dt.getTime()) ? dt.toISOString().split("T")[0] : null;
}

export function parseSyllabus(text: string, fallbackYear = 2025): CalendarTask[] {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const tasks: CalendarTask[] = [];
  let currentDate: string | null = null;
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (!buffer.length) return;
    const title = buffer.join(" ").trim();
    if (currentDate) {
      tasks.push({
        id: `${title}-${currentDate}-${tasks.length}`,
        title,
        type: detectTaskType(title),
        date: currentDate,
        description: title
      });
    } else {
      tasks.push({
        id: `${title}-no-date-${tasks.length}`,
        title,
        type: detectTaskType(title),
        date: "",
        description: title
      });
    }
    buffer = [];
  };

  for (const line of lines) {
    if (/NO CLASS/i.test(line) || /SPRING BREAK/i.test(line)) {
      flushBuffer();
      currentDate = null;
      continue;
    }

    const parsedDate = parseDate(line);
    if (parsedDate) {
      flushBuffer();
      currentDate = parsedDate;
      continue;
    }

    buffer.push(line);
  }

  flushBuffer();
  return tasks;
}
