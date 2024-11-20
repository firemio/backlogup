import { Box, Avatar, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import type * as backlog from "backlog-js";

interface Props {
  user: backlog.Entity.User.User;
  children?: ReactNode;
}

export const UserHeader: React.FC<Props> = (props: Props) => {
  return (
    <Box display={"flex"} alignItems={"center"}>
      <Box>
        <Avatar alt={props.user?.name} src={`./users/${props.user?.id}/icon`} />
      </Box>
      <Box ml={1.5}>
        <Box>
          <Typography variant="body1" fontWeight={"bold"}>{props.user?.name}</Typography>
        </Box>
        {props.children}
      </Box>
    </Box>
  );
};
