import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { mkdir, rm, writeFile } from "fs/promises";
import { setTimeout as sleepAsync } from "timers/promises";
import * as backlogjs from "backlog-js";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dist = resolve(__dirname, "dist", "assets");
const distConfigs = resolve(dist, "configs");
const distUsers = resolve(dist, "users");
const distIssuePages = resolve(dist, "pages");
const distIssues = resolve(dist, "issues");

try {
  await rm(dist, {
    force: true,
    recursive: true,
  });
} catch (e) { }
await mkdir(distConfigs, {
  recursive: true,
});
await mkdir(distUsers, {
  recursive: true,
});
await mkdir(distIssuePages, {
  recursive: true,
});
await mkdir(distIssues, {
  recursive: true,
});

config({
  override: true,
});

const host = process.env.BACKLOG_HOST;
if (!host) {
  throw new Error("環境変数 'BACKLOG_HOST' が設定されていません");
}
const apiKey = process.env.BACKLOG_API_KEY;
if (!apiKey) {
  throw new Error("環境変数 'BACKLOG_API_KEY' が設定されていません");
}
const projectKey = process.env.BACKLOG_PROJECT_KEY;
if (!projectKey) {
  throw new Error("環境変数 'BACKLOG_PROJECT_KEY' が設定されていません");
}

const backlog = new backlogjs.Backlog({ host, apiKey });

// TODO: レートリミットを確認する　できればいい感じにwaitを調整する

const project = await backlog.getProject(projectKey);
const { id: projectId } = project;

const issueTypes = await backlog.getIssueTypes(projectId);
await writeFile(
  resolve(distConfigs, "issue-types.json"),
  JSON.stringify(issueTypes),
  { encoding: "utf-8" }
);
const categories = await backlog.getCategories(projectId);
await writeFile(
  resolve(distConfigs, "categories.json"),
  JSON.stringify(categories),
  { encoding: "utf-8" }
);
const versions = await backlog.getVersions(projectId);
await writeFile(
  resolve(distConfigs, "versions.json"),
  JSON.stringify(versions),
  { encoding: "utf-8" }
);
const users = await backlog.getProjectUsers(projectId);
await writeFile(resolve(distConfigs, "users.json"), JSON.stringify(users), {
  encoding: "utf-8",
});
for (const [index, user] of users.entries()) {
  await sleepAsync(1000);

  console.log("getProjectUser:", index + 1, "/", users.length);
  await mkdir(resolve(distUsers, `${user.id}`), {
    recursive: true,
  })
  try {
    const userIcon = await backlog.getUserIcon(user.id);
    const fileName = resolve(distUsers, `${user.id}`, "icon");
    await writeFile(fileName, userIcon.body, {
      encoding: "binary",
    });
  } catch (e) {
    console.warn("icon not found:", user.id, user.name);
  }
}

const { count: totalIssues } = await backlog.getIssuesCount({
  projectId: [projectId],
});
for (let fetched = 0, page = 0; fetched < totalIssues; page++) {
  await writeFile(resolve(distConfigs, "pages.json"), JSON.stringify({ start: 0, end: page }), {
    encoding: "utf-8",
  });

  await sleepAsync(1000);
  const issues = await backlog.getIssues({
    projectId: [projectId],
    count: 20,
    offset: fetched,
  });
  fetched += issues.length;

  const fileName = resolve(distIssuePages, `${page}.json`);
  await writeFile(fileName, JSON.stringify(issues), {
    encoding: "utf-8",
  });

  for (const [index, issue] of issues.entries()) {
    const distIssue = resolve(distIssues, `${issue.id}`);
    const distIssueAttachments = resolve(distIssue, "attachments");
    await mkdir(distIssueAttachments, {
      recursive: true,
    });

    await writeFile(resolve(distIssue, "issue.json"), JSON.stringify(issue), {
      encoding: "utf-8",
    });

    console.log("getIssue:", page * 20 + index + 1, "/", totalIssues);

    await sleepAsync(1000);
    const { count: totalIssueComments } = await backlog.getIssueCommentsCount(issue.id);

    const allIssueComments = [];
    let maxIssueComment: backlogjs.Entity.Issue.Comment | undefined;
    for (let fetchedComments = 0, fetchedPages = 0; fetchedComments < totalIssueComments; fetchedPages++) {
      console.log("getIssueComments:", fetchedPages + 1);

      const option: backlogjs.Option.Issue.GetIssueCommentsParams = {};
      if (maxIssueComment) {
        option.maxId = maxIssueComment.id;
      }
      await sleepAsync(250);
      const issueComments = await backlog.getIssueComments(issue.id, option);
      fetchedComments += issueComments.length;
      if (issueComments.length > 0) {
        maxIssueComment = issueComments[issueComments.length - 1];
        allIssueComments.push(...issueComments);
      }
    }
    await writeFile(resolve(distIssue, "comments.json"), JSON.stringify(allIssueComments), {
      encoding: "utf-8",
    });

    const attachments = await backlog.getIssueAttachments(issue.id);
    for (const [index, { id: attachmentId }] of attachments.entries()) {
      console.log("getIssueAttachments", index + 1, "/", attachments.length);
      await sleepAsync(250);
      const attachment = await backlog.getIssueAttachment(issue.id, attachmentId);
      await writeFile(resolve(distIssueAttachments, `${attachmentId}`), attachment.body, {
        encoding: "binary",
      });
    }
  }
}
