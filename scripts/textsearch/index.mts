import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { writeFile, readFile } from "fs/promises";
import { config } from "dotenv";
import { remark } from "remark";
import strip from "strip-markdown";
import { tokenize } from "kuromojin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dist = resolve(__dirname, "..", "backlog", "dist", "assets");
const distConfigs = resolve(dist, "configs");
const distIssuePages = resolve(dist, "pages");
const distIssues = resolve(dist, "issues");

config({
  override: true,
});

const remarkCache = remark().use(strip);
const stripMarkdown = async (str: string) => (await remarkCache.process(str)).value as string;

const documents = [];

const { start, end } = JSON.parse(await readFile(resolve(distConfigs, "pages.json"), 'utf-8'));
for (let i = start; i <= end; i++) {
  console.log("search index:", i + 1, "/", end + 1);

  const page = JSON.parse(await readFile(resolve(distIssuePages, `${i}.json`), 'utf-8'));
  for (const id of page.map((p) => p.id)) {
    const issue = JSON.parse(await readFile(resolve(distIssues, `${id}`, "issue.json"), 'utf-8'));
    const comments = JSON.parse(await readFile(resolve(distIssues, `${id}`, "comments.json"), 'utf-8'));

    const target = [issue.summary, issue.description, ...comments.map((c) => c.content)].join("\n\n");
    const plain = await stripMarkdown(target);
    const words = await tokenize(plain);

    const targetPos = ["名詞", "動詞", "形容詞"];
    const ingoreConjugatedForm = ["基本形", "連用形", "仮定形"];
    const ignoreChars = /[!"#$%&'()\*\+\-\.,\/:;<=>?@\[\\\]^_`{|}~]/g;
    const ignoreNumbers = /^\d+$/;
    const targetWords = Array.from(new Set(words
      .filter((word) => {
        if (targetPos.includes(word.pos)) {
          if (word.pos === "動詞") {
            return !ingoreConjugatedForm.includes(word.conjugated_form);
          }
          return true;
        }
        return false;
      })
      .map((word) => word.surface_form)
      .filter((form) => !ignoreChars.test(form))
      .filter((form) => !ignoreNumbers.test(form))
      .filter((form) => form.length > 2)));

    documents.push({
      id,
      keywords: targetWords.join(" "),
    });
  }
}

await writeFile(resolve(distConfigs, "search-index.json"), JSON.stringify(documents));
