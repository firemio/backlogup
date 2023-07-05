import React from "react";
import { useStore } from "../stores";
import { useDidMount } from "@better-hooks/lifecycle";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import dayjs from 'dayjs';
import { Link } from "react-router-dom";
import { Avatar, Box, Chip, Paper, TextField } from "@mui/material";

export const Issues: React.FC = observer((props) => {
  const { pageStore } = useStore();

  useDidMount(() => {
    pageStore.fetch();
    pageStore.generateIndex();
  });

  const columns: GridColDef[] = [
    {
      field: "種別",
      headerName: "種別",
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => params.row?.issueType?.name,
      renderCell: (params) => <Chip label={params.row?.issueType?.name} style={{ backgroundColor: params.row?.issueType?.color, color: "white", }} />,
    },
    {
      field: "issueKey",
      headerName: "キー",
      flex: 1,
      minWidth: 160,
      valueGetter: (params) => params.row?.issueKey,
      renderCell: (params) => <Link to={`/issues/${params.row?.id}`}>{params.row?.issueKey}</Link>,
    },
    {
      field: "summary",
      headerName: "件名",
      flex: 5,
    },
    {
      field: "assignee.name",
      headerName: "担当者",
      flex: 1,
      valueGetter: (params) => params.row?.assignee?.name,
      renderCell: (params) => params.row?.assignee?.name ? (
        <Box display={"flex"} alignItems={"center"}>
          <Avatar
            alt={params.row?.assignee?.name}
            src={`/assets/users/${params.row?.assignee?.id}/icon`}
            sx={{ width: 24, height: 24, fontSize: 12, mr: 0.5 }}
          />
            {params.row?.assignee?.name}
        </Box>
        ) : params.row?.assignee?.name
    },
    {
      field: "状態",
      headerName: "状態",
      flex: 1,
      valueGetter: (params) => params.row?.status?.name,
      renderCell: (params) => <Chip label={params.row?.status?.name} style={{ backgroundColor: params.row?.status?.color, color: "white", }} />,
    },
    {
      field: "カテゴリー",
      headerName: "カテゴリー",
      flex: 1,
      valueGetter: (params) => params.row?.category?.map((category) => category.name).join(","),
      renderCell: (params) => params.row?.category?.map((category) => category.name).join(","),
    },
    {
      field: "優先度",
      headerName: "優先度",
      width: 72,
      valueGetter: (params) => params.row?.priority?.name,
      renderCell: (params) => {
        switch(params.row?.priority?.name) {
          case "高":
            return <span style={{ color: "#f42858" }}>⬆</span>;
          case "中":
            return <span style={{ color: "#4488c5" }}>➡️</span>;
          case "低":
            return <span style={{ color: "#5db5a6" }}>⬇</span>;
        }
      },
    },
    {
      field: "登録日",
      headerName: "登録日",
      width: 110,
      valueGetter: (params) => dayjs(params.row?.created).format("YYYY/MM/DD"),
    },
    {
      field: "更新日",
      headerName: "更新日",
      width: 110,
      valueGetter: (params) => dayjs(params.row?.updated).format("YYYY/MM/DD"),
    }
  ];

  return (
    <Box p={4} style={{ backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <Box mb={1} sx={{ backgroundColor: "white" }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth={true}
          label={pageStore.loadingIndexes ? "キーワード検索 辞書取得中..." : "キーワード検索" }
          placeholder="mecab-ipadicによる形態素解析結果を使用してキーワード検索"
          disabled={pageStore.loadingIndexes}
          value={pageStore.keyword}
          onChange={(e) => pageStore.setKeyword(e.target.value)}
        />
      </Box>

      <DataGrid
        rows={pageStore.pages}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: pageStore.page, pageSize: pageStore.pageSize },
          },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        loading={pageStore.loadingPages}
        onStateChange={(state) => {
          if (state.pagination?.paginationModel?.page) {
            pageStore.setPage(state.pagination.paginationModel.page);
          }
          if (state.pagination?.paginationModel?.pageSize) {
            pageStore.setPageSize(state.pagination.paginationModel.pageSize);
          }
          // TODO: フィルターとかも保存する
        }}
        sx={{ minHeight: 400, backgroundColor: "white" }}
      />

      {pageStore.loadingPages && (
        <Box mt={1}>
          <Paper variant="outlined">
            <Box p={1}>
              ダウンロード中: {pageStore.currentDownloading} / {pageStore.totalPage}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
});
