import React, { useState } from "react";
import { useStore } from "../stores";
import { useDidMount, useWillUnmount } from "@better-hooks/lifecycle";
import { observer } from "mobx-react-lite";
import dayjs from 'dayjs';
import { Link, useParams } from "react-router-dom";
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Box, Button, Card, CardContent, Chip, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ArrowDownward, ArrowUpward, ExpandMore } from "@mui/icons-material";

const notificationType = (type: string) => {
  switch (type) {
    case "issue.create":
      return "課題の追加";
    default:
      return type;
  }
};

export const Issue: React.FC = observer((props) => {
  const { pageStore, issueStore } = useStore();
  const { id: issueId } = useParams();
  const [ showMoreinfo, setShowMoreInfo ] = useState(false);

  useDidMount(() => {
    pageStore.fetch();
    issueStore.fetch(issueId);
  });

  useWillUnmount(() => {
    issueStore.clear();
  })

  return (
    <Box p={4} style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      🔙 <Link to="/">リストに戻る</Link>
      <Box my={2}>
        <Divider />
      </Box>
      <Box display={"flex"} width={"100%"} justifyContent={"space-between"}>
        <Box>
          <Chip label={issueStore.issue.issueType?.name} style={{ backgroundColor: issueStore.issue.issueType?.color, color: "white", }} />
          <Box display={"inline-block"} ml={1}>{issueStore.issue.issueKey}</Box>
        </Box>
        <Box>
          <Box display={"inline-block"}>
            <Box display={"inline-block"}>開始日</Box>
            <Box display={"inline-block"} ml={1}>{issueStore.issue.startDate ? dayjs(issueStore.issue.startDate).format("YYYY/MM/DD") : "-"}</Box>
          </Box>
          <Box display={"inline-block"} ml={3} style={ (issueStore.issue.dueDate && dayjs(issueStore.issue.dueDate).isBefore(dayjs())) ? { color: "#f42858" } : undefined}>
            <Box display={"inline-block"}>期限日</Box>
            <Box display={"inline-block"} ml={1}>{issueStore.issue.dueDate ? dayjs(issueStore.issue.dueDate).format("YYYY/MM/DD") : "-"} {dayjs(issueStore.issue.dueDate).isBefore(dayjs()) ? "🔥" : ""}</Box>
          </Box>
          <Box display={"inline-block"} ml={3}>
            <Chip label={issueStore.issue.status?.name} style={{ backgroundColor: issueStore.issue.status?.color, color: "white", }} />
          </Box>
        </Box>
      </Box>
      <Box my={1}>
        <Typography variant="h5" fontWeight={"bold"}>{issueStore.issue.summary}</Typography>
      </Box>
      <Box>
        <Card variant="outlined">
          <CardContent>
            <Box display={"flex"} alignItems={"center"}>
              <Box>
                <Avatar alt={issueStore.issue.createdUser?.name} src={`/assets/users/${issueStore.issue.createdUser?.id}/icon`} />
              </Box>
              <Box ml={1.5}>
                <Box>
                  <Typography variant="body1" fontWeight={"bold"}>{issueStore.issue.createdUser?.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption">登録日: {dayjs(issueStore.issue.created).format("YYYY/MM/DD HH:mm:ss")}</Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <ReactMarkdown
                className="markdown-body"
                remarkPlugins={[[remarkGfm, { singleTilde: false, }]]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return inline ? (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        {...props}
                        children={String(children).replace(/\n$/, '')}
                        style={oneLight}
                        language={match ? match[1] : "text"}
                        PreTag="div"
                        customStyle={{ border: "1px solid #e4e4e4" }}
                      />
                    )
                  }
                }}
              >
                {issueStore.issue.description?.replace(/!\[image\]\[(.*?)\]/g, (all, match1) => {
                  const targetAttachmentId = issueStore.issue.attachments?.slice().find((attachment) => attachment.name === match1)?.id;
                  return `![image](/assets/issues/${issueId}/attachments/${targetAttachmentId})`;
                }).replaceAll("\n", "  \n")}
              </ReactMarkdown>
            </Box>
            <Box mt={3} display={"flex"}>
              <Box flex={1} mr={1}>
                <Divider />
                <TableContainer>
                  <Table aria-label="simple table">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width={180}>
                          優先度
                        </TableCell>
                        <TableCell scope="row">
                          {issueStore.issue.priority?.name}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          カテゴリー
                        </TableCell>
                        <TableCell scope="row">
                          {issueStore.issue.category?.map((category) => category.name).join(",")}
                        </TableCell>
                      </TableRow>
                      {showMoreinfo && (
                        <>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              発生バージョン
                            </TableCell>
                            <TableCell scope="row">
                              {issueStore.issue.versions?.map((version) => version.name).join(",")}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              予定時間
                            </TableCell>
                            <TableCell scope="row">
                              {issueStore.issue.estimatedHours}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              完了理由
                            </TableCell>
                            <TableCell scope="row">
                              {issueStore.issue.resolution?.name}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              <Box flex={1} ml={1}>
                <Divider />
                <TableContainer>
                  <Table aria-label="simple table">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" width={180}>
                          担当者
                        </TableCell>
                        <TableCell scope="row" style={{ padding: 0 }}>
                          <Box display={"flex"} alignItems={"center"}>
                            <Box>
                              <Avatar sx={{ width: 24, height: 24, m: 0 }} alt={issueStore.issue.assignee?.name} src={`/assets/users/${issueStore.issue.assignee?.id}/icon`} />
                            </Box>
                            <Box ml={1.5}>
                              {issueStore.issue.assignee?.name}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          マイルストーン
                        </TableCell>
                        <TableCell scope="row">
                          {issueStore.issue.milestone?.map((milestone) => milestone.name).join(",")}
                        </TableCell>
                      </TableRow>
                      {showMoreinfo && (
                        <>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              &nbsp;
                            </TableCell>
                            <TableCell scope="row">
                              &nbsp;
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell component="th" scope="row">
                              実績時間
                            </TableCell>
                            <TableCell scope="row">
                              {issueStore.issue.actualHours}
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
            <Box mt={2}>
              <Button variant="text" disableElevation fullWidth onClick={() => setShowMoreInfo(!showMoreinfo)}>
                {showMoreinfo ? <ArrowUpward /> : <ArrowDownward /> }
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box mt={5}>
        <Box>
          <Typography variant="body1"><span style={{ fontWeight: "bold" }}>コメント</span> ({issueStore.comments.length})</Typography>
        </Box>
        <Box mt={1}>
          <Card variant="outlined">
            <CardContent>
              {issueStore.comments.slice().sort((a, b) => a.id > b.id ? 1 : -1).map((comment, index) => (
                <Box key={comment.id}>
                  <Box display={"flex"} alignItems={"center"}>
                    <Box style={{ position: "relative" }}>
                      <Avatar alt={comment.createdUser?.name} src={`/assets/users/${comment.createdUser?.id}/icon`}/>
                    </Box>
                    <Box ml={1.5}>
                      <Box>
                        <Typography variant="body1" fontWeight={"bold"}>{comment.createdUser?.name}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption">{dayjs(comment.created).format("YYYY/MM/DD HH:mm:ss")}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box mt={2} ml={"50px"}>
                    {comment.changeLog?.slice().map((changeLog, index) => {
                      switch (changeLog.field) {
                        case "notification":
                          return <Typography variant="body2" key={index}>◎ お知らせ: {notificationType(changeLog.notificationInfo.type)}</Typography>;
                        case "limitDate":
                          return <Typography variant="body2" key={index}>◎ 期限日: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue}</Typography>;
                        case "assigner":
                          return <Typography variant="body2" key={index}>◎ 担当者: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue}</Typography>;
                        case "parentIssue":
                          return <Typography variant="body2" key={index}>◎ 親課題: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue}</Typography>;
                        case "description":
                          return (
                            <Box display={"flex"} alignItems={"baseline"}>
                              <Box>
                                <Typography variant="body2" key={index}>◎ 詳細:</Typography>
                              </Box>
                              <Accordion style={{ flex: 1, marginLeft: 8, marginTop: 0 }} variant="outlined">
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                  <Typography>変更内容...</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Box>
                                    {changeLog.originalValue}
                                  </Box>
                                  <Box>
                                    ⬇
                                  </Box>
                                  <Box>
                                    {changeLog.newValue}
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            </Box>
                          );
                        case "component":
                          return <Typography variant="body2" key={index}>◎ カテゴリー: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "resolution":
                          return <Typography variant="body2" key={index}>◎ 完了理由: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "milestone":
                          return <Typography variant="body2" key={index}>◎ マイルストーン: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "priority":
                          return <Typography variant="body2" key={index}>◎ 優先度: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "issueType":
                          return <Typography variant="body2" key={index}>◎ 種別: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "estimatedHours":
                          return <Typography variant="body2" key={index}>◎ 予定時間: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "actualHours":
                          return <Typography variant="body2" key={index}>◎ 実績時間: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "status":
                          return <Typography variant="body2" key={index}>◎ 状態: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        case "attachment":
                          return <Typography variant="body2" key={index}>◎ 添付ファイル: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "削除"} {changeLog.attachmentInfo && <a href={`/assets/issues/${issueId}/attachments/${changeLog.attachmentInfo.id}`} download={changeLog.attachmentInfo?.name}>ダウンロード</a>}</Typography>;
                        case "summary":
                          return <Typography variant="body2" key={index}>◎ 件名: {changeLog.originalValue || "未設定"} ➡️ {changeLog.newValue || "未設定"}</Typography>;
                        default:
                          return <Typography variant="body2" key={index}>◎ 不明イベント: {JSON.stringify(changeLog)}</Typography>;
                      }
                    })}
                    <ReactMarkdown
                      className="markdown-body"
                      remarkPlugins={[[remarkGfm, { singleTilde: false, }]]}
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          console.log("className:", className);
                          return inline ? (
                            <code {...props} className={className}>
                              {children}
                            </code>
                          ) : (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={oneLight}
                              language={match ? match[1] : "text"}
                              PreTag="div"
                              customStyle={{ border: "1px solid #e4e4e4" }}
                            />
                          )
                        }
                      }}
                    >
                      {comment.content?.replace(/!\[image\]\[(.*?)\]/g, (all, match1) => {
                        const targetAttachmentId = comment.changeLog?.slice().find((attachment) => attachment.attachmentInfo?.name === match1)?.attachmentInfo.id;
                        return `![image](/assets/issues/${issueId}/attachments/${targetAttachmentId})`;
                      }).replaceAll("\n", "  \n")}
                    </ReactMarkdown>
                    {comment.created !== comment.updated && (
                      <Typography variant="caption" color="textSecondary">（編集済み）</Typography>
                    )}
                  </Box>
                  {index < issueStore.comments.length - 1 && (
                    <Box my={3}>
                      <Divider />
                    </Box>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
});
