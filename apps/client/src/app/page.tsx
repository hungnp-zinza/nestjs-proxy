'use client';

import {
  Button,
  IconButton,
  Popover,
  Popper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2';
import ComputerIcon from '@mui/icons-material/Computer';
import TabletIcon from '@mui/icons-material/Tablet';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import * as url from 'url';

enum ViewMode {
  Comment = 'comment',
  Browse = 'browse',
}

enum ScreenSize {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

enum EventType {
  ViewModeChange = 'markup_view_mode_change',
  ThreadHover = 'markup_thread_hover',
  ThreadClicked = 'markup_thread_clicked',
  CommentClicked = 'markup_comment_clicked',
}

interface Bbox {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  created_at: Date | null;
  bbox: Bbox;
  clientX: number;
  clientY: number;
}

interface PendingComment {
  id: number;
  content: string;
  author: string;
  bbox: Bbox;
  clientX: number;
  clientY: number;
}

export default function Index() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Comment);
  const [screenSize, setScreenSize] = useState<ScreenSize>(ScreenSize.Desktop);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [commentAnchorEl, setCommentAnchorEl] = useState<HTMLDivElement | null>(
    null
  );
  const [openComment, setOpenComment] = useState<Comment>();
  const [editingUrl, setEditingUrl] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingComment, setPendingComment] = useState<PendingComment>();

  useEffect(() => {
    if (viewMode && url && !loading) {
      iframeRef.current?.contentWindow?.postMessage(
        { event: 'markup_view_mode_change', payload: { viewMode: viewMode } },
        url
      );
    }
  }, [url, viewMode, loading]);

  useEffect(() => {
    if (url) {
      setLoading(true);
      setComments([]);
      setOpenComment(undefined);
      setCommentAnchorEl(null);
      setAnchorEl(null);
      setPendingComment(undefined);
    }
  }, [url]);

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

  useEffect(() => {
    const handle = (message: MessageEvent) => {
      if (
        !message.origin.endsWith(process.env.NEXT_PUBLIC_PROXY_SUBDOMAIN || '')
      ) {
        return;
      }
      const data = message.data;
      if (data.event === EventType.ThreadClicked) {
        if (!pendingComment) {
          setPendingComment({
            id: (comments[comments.length - 1]?.id || 0) + 1,
            content: '',
            author: 'Nguyễn Phi Hùng',
            bbox: data.payload.bbox,
            clientX: data.payload.clientX,
            clientY: data.payload.clientY,
          });
        }
      }

      if (data.event === EventType.CommentClicked) {
        const comment = comments.find((c) => c.id === data.payload.id);
        if (comment) {
          setOpenComment({ ...comment, bbox: data.payload.bbox });
        }
      }
    };
    window.addEventListener('message', handle);
    return () => {
      window.removeEventListener('message', handle);
    };
  }, [comments, pendingComment]);

  const post = () => {
    if (pendingComment) {
      setComments([...comments, { ...pendingComment, created_at: new Date() }]);
      setPendingComment(undefined);
    }
  };

  const createProxy = async () => {
    try {
      const response = await axios.post<{ from: string; to: string }>(
        `${process.env.NEXT_PUBLIC_API_URL}/markup-domain`,
        {
          domain: editingUrl,
        }
      );
      setUrl(response.data.from);
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => {
    if (viewMode && url && !loading) {
      iframeRef.current?.contentWindow?.postMessage(
        { event: 'markup_comments', payload: { comments } },
        url
      );
    }
  }, [comments, url, viewMode, loading]);

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
        <Stack
          width="300px"
          height={1}
          borderRight="1px solid #e9ebec"
          overflow="auto"
        >
          {comments.map((comment) => (
            <Stack
              borderBottom="1px solid #e9ebec"
              p={3}
              key={comment.id}
              width={1}
              gap={1}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f5f6f7',
                },
              }}
            >
              <Stack
                sx={{
                  backgroundColor: '#1b00fb',
                }}
                color="#ffffff"
                p={0.5}
                width="32px"
                height="32px"
                borderRadius="50%"
                alignItems="center"
                justifyContent="center"
              >
                {comment.id}
              </Stack>
              <Typography fontWeight={700}>{comment.author}</Typography>
              <Typography variant="caption">
                {comment.created_at?.toDateString()}
              </Typography>
              <Typography whiteSpace="pre-line" variant="body2">
                {comment.content}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Stack flex={1} gap={1}>
          <Stack
            component="form"
            width={1}
            height="56px"
            overflow="auto"
            direction="row"
            gap={1}
            justifyContent="center"
            alignItems="center"
            borderBottom="1px solid #e9ebec"
            onSubmit={(event) => {
              event.preventDefault();
              createProxy().catch();
            }}
          >
            <TextField
              size="small"
              value={editingUrl}
              onChange={(event) => setEditingUrl(event.target.value || '')}
            />
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </Stack>
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
              <Stack position="relative" style={iFrameStyle}>
                {!!url && (
                  <iframe
                    onLoad={() => setLoading(false)}
                    ref={iframeRef}
                    id="proxy-iframe"
                    name="proxy-iframe"
                    src={url}
                    sandbox="allow-scripts allow-forms allow-same-origin allow-pointer-lock allow-presentation allow-popups allow-popups-to-escape-sandbox"
                    scrolling={pendingComment ? 'no' : 'auto'}
                    style={{ width: '100%', height: '100%' }}
                  />
                )}
                {openComment && (
                  <Stack
                    position="absolute"
                    top={openComment.bbox.y}
                    left={openComment.bbox.x}
                  >
                    <Stack
                      component="div"
                      sx={{
                        backgroundColor: '#1b00fb',
                      }}
                      width="32px"
                      height="32px"
                      color="#ffffff"
                      p={0.5}
                      borderRadius="50%"
                      alignItems="center"
                      justifyContent="center"
                      ref={(ref) => setCommentAnchorEl(ref)}
                    >
                      {openComment.id}
                    </Stack>
                    {!!commentAnchorEl && (
                      <Popover
                        open={true}
                        anchorReference="anchorEl"
                        anchorEl={commentAnchorEl}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                        sx={{ ml: 5 }}
                      >
                        <Stack borderRadius={1} width="300px">
                          <TextField
                            placeholder="Add comment here"
                            variant="outlined"
                            multiline
                            rows={2}
                            value={openComment.content}
                            onChange={(event) => {
                              setOpenComment({
                                ...openComment,
                                content: event.target.value || '',
                              });
                            }}
                          />
                          <Stack
                            p={1}
                            width={1}
                            direction="row"
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setComments(
                                  comments.map((c) => {
                                    if (c.id === openComment.id) {
                                      return {
                                        ...c,
                                        content: openComment.content,
                                      };
                                    } else {
                                      return c;
                                    }
                                  })
                                );
                                setCommentAnchorEl(null);
                                setOpenComment(undefined);
                              }}
                              disabled={!openComment.content}
                            >
                              Save
                            </Button>
                          </Stack>
                        </Stack>
                      </Popover>
                    )}
                  </Stack>
                )}
                {pendingComment && (
                  <Stack
                    position="absolute"
                    top={pendingComment.clientY}
                    left={pendingComment.clientX}
                  >
                    <Stack
                      component="div"
                      sx={{
                        backgroundColor: '#1b00fb',
                      }}
                      width="32px"
                      height="32px"
                      color="#ffffff"
                      p={0.5}
                      borderRadius="50%"
                      alignItems="center"
                      justifyContent="center"
                      ref={(ref) => setAnchorEl(ref)}
                    >
                      {' '}
                    </Stack>
                    {!!anchorEl && (
                      <Popper
                        open={true}
                        anchorEl={anchorEl}
                        disablePortal
                        sx={{
                          ml: 5,
                          backgroundColor: '#ffffff',
                          boxShadow: '0 5px 10px rgba(0,0,0,.05)',
                          borderRadius: 1,
                          border: '1px solid #e9ebec',
                        }}
                      >
                        <Stack borderRadius={1} width="300px">
                          <TextField
                            placeholder="Add comment here"
                            variant="outlined"
                            multiline
                            rows={2}
                            onChange={(event) => {
                              setPendingComment({
                                ...pendingComment,
                                content: event.target.value || '',
                              });
                            }}
                            sx={{
                              '.MuiOutlinedInput-root': { border: 'none' },
                            }}
                          />
                          <Stack
                            p={1}
                            width={1}
                            direction="row"
                            justifyContent="flex-end"
                          >
                            <Button
                              variant="contained"
                              size="small"
                              onClick={post}
                              disabled={!pendingComment.content}
                            >
                              Post
                            </Button>
                          </Stack>
                        </Stack>
                      </Popper>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
