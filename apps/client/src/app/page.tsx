'use client';

import {
  Button,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { useState } from 'react';

enum ViewMode {
  Comment = 'comment',
  Browse = 'browse',
}

export default function Index() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Comment);

  return (
    <Stack width={1} height={1}>
      <Stack
        width={1}
        height={56}
        alignItems="center"
        direction="row"
        borderBottom="1px solid #e9ebec"
      >
        <Grid2 container width={1}>
          <Grid2 xs={12} md={4}>
            <Stack direction="row" gap={2} px={2}>
              <IconButton>
                <ComputerIcon />
              </IconButton>
              <IconButton>
                <TabletIcon />
              </IconButton>
              <IconButton>
                <SmartphoneIcon />
              </IconButton>
            </Stack>
          </Grid2>
          <Grid2 xs={12} md={4}>
            <Stack
              px={2}
              justifyContent="center"
              direction="row"
              alignItems="center"
            >
              <ToggleButtonGroup
                color="primary"
                value={viewMode}
                exclusive
                onChange={(event, value: ViewMode) => setViewMode(value)}
                aria-label="Platform"
                size="small"
              >
                <ToggleButton value="comment">Comment</ToggleButton>
                <ToggleButton value="browse">Browse</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid2>
          <Grid2 xs={12} md={4}>
            <Stack
              px={2}
              justifyContent="flex-end"
              direction="row"
              alignItems="center"
            >
              <Button variant="contained">Share</Button>
            </Stack>
          </Grid2>
        </Grid2>
      </Stack>
      <Stack direction="row" flex={1}>
        <Stack width="300px" height={1} borderRight="1px solid #e9ebec"></Stack>
        <Stack flex={1}>
          <iframe
            id="proxy-iframe"
            name="proxy-iframe"
            src="https://dev-to-proxy.hungnp.com/"
            sandbox="allow-scripts allow-forms allow-same-origin allow-pointer-lock allow-presentation allow-popups allow-popups-to-escape-sandbox"
            scrolling="auto"
            style={{ visibility: 'visible', width: '100%', height: '100%' }}
          ></iframe>
        </Stack>
      </Stack>
    </Stack>
  );
}
