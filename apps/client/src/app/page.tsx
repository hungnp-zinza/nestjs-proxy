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
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

enum ViewMode {
  Comment = 'comment',
  Browse = 'browse',
}

enum ScreenSize {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

export default function Index() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Comment);
  const [screenSize, setScreenSize] = useState<ScreenSize>(ScreenSize.Desktop);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (viewMode) {
      iframeRef.current?.contentWindow?.postMessage(
        { event: 'markup_view_mode_change', payload: { viewMode: viewMode } },
        'https://dev-to-proxy.hungnp.com'
      );
    }
  }, [viewMode]);

  const screenSizeActiveBg = 'rgba(0, 0, 0, 0.04)';
  const screenSizeInactiveBg = 'transparent';

  const iFrameStyle = useMemo<CSSProperties>(() => {
    if (screenSize === ScreenSize.Desktop) {
      return {
        visibility: 'visible',
        width: '100%',
        height: '100%',
      };
    }
    if (screenSize === ScreenSize.Tablet) {
      return {
        visibility: 'visible',
        width: '576px',
        height: '768px',
        border: '1px solid #e9ebec',
      };
    }
    if (screenSize === ScreenSize.Mobile) {
      return {
        visibility: 'visible',
        width: '375px',
        height: '667px',
        border: '1px solid #e9ebec',
      };
    }
    return {};
  }, [screenSize]);

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
              <IconButton
                onClick={() => setScreenSize(ScreenSize.Desktop)}
                sx={{
                  backgroundColor:
                    screenSize === ScreenSize.Desktop
                      ? screenSizeActiveBg
                      : screenSizeInactiveBg,
                }}
              >
                <ComputerIcon />
              </IconButton>
              <IconButton
                onClick={() => setScreenSize(ScreenSize.Tablet)}
                sx={{
                  backgroundColor:
                    screenSize === ScreenSize.Tablet
                      ? screenSizeActiveBg
                      : screenSizeInactiveBg,
                }}
              >
                <TabletIcon />
              </IconButton>
              <IconButton
                onClick={() => setScreenSize(ScreenSize.Mobile)}
                sx={{
                  backgroundColor:
                    screenSize === ScreenSize.Mobile
                      ? screenSizeActiveBg
                      : screenSizeInactiveBg,
                }}
              >
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
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Stack
            sx={
              screenSize === ScreenSize.Desktop
                ? { width: 1, height: 1 }
                : {
                    padding: '57px 16px 80px',
                    overflow: 'hidden',
                    boxShadow: '0 0 20px #e9ebec',
                    border: '1px solid #e9ebec',
                    borderRadius: '30px',
                    background: '#fff',
                  }
            }
          >
            <iframe
              ref={iframeRef}
              id="proxy-iframe"
              name="proxy-iframe"
              src="https://dev-to-proxy.hungnp.com/"
              sandbox="allow-scripts allow-forms allow-same-origin allow-pointer-lock allow-presentation allow-popups allow-popups-to-escape-sandbox"
              scrolling="auto"
              style={iFrameStyle}
            />
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
