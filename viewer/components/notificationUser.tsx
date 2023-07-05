import { Box, Avatar, Tooltip, Badge } from "@mui/material";
import React, { ReactNode } from "react";
import type * as backlog from "backlog-js";
import { Check } from "@mui/icons-material";

interface Props {
  user: backlog.Entity.User.User;
  alreadyRead: boolean;
  children?: ReactNode;
}

export const NotificationUser: React.FC<Props> = (props: Props) => {
  return (
    <Box ml={1}>
      <Tooltip title={props.user?.name} placement="top">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            invisible={!props.alreadyRead}
            color="success"
            variant="dot"
          >
            <Avatar
              alt={props.user?.name}
              src={`/assets/users/${props.user?.id}/icon`}
              sx={{ width: 24, height: 24, fontSize: 12, opacity: props.alreadyRead ? 1 : 0.6 }}
            />
          </Badge>
      </Tooltip>
    </Box>
  );
};
