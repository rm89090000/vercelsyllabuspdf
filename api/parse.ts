import express, { Request, Response } from "express";
import multer from "multer";
import pdf from "pdf-parse";
import cors from "cors";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// ========== Parse PDF to Events ==========
app.post("/api/parse", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const data = await pdf(req.file.buffer);
    const text = data.text;

    const events: { title: string; start: string; end: string; type: string }[] = [];
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match dates like "Thu Jan 9, 2025"
      const dateMatch = line.match(/([A-Za-z]{3} [A-Za-z]{3} \d{1,2}, \d{4})/);
      if (dateMatch) {
        const dateStr = dateMatch[1];
        const date = new Date(dateStr);

        // Find title from previous non-empty line
        let title = "";
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].trim() !== "") {
            title = lines[j].trim();
            break;
          }
        }

        // Determine type
        let type = "lecture";
        if (/assignment/i.test(title)) type = "assignment";
        else if (/quiz|exam/i.test(title)) type = "exam";

        events.push({
          title,
          start: date.toISOString(),
          end: date.toISOString(),
          type
        });
      }
    }

    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to parse syllabus" });
  }
});

// ========== Health Check ==========
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running. Use POST /api/parse with a PDF file.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running`));
