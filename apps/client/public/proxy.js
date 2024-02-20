const ViewMode = {
  Comment: 'comment',
  Browse: 'browse',
};

const EventType = {
  ViewModeChange: 'markup_view_mode_change',
  ThreadHover: 'markup_thread_hover',
  ThreadClicked: 'markup_thread_clicked',
  Comments: 'markup_comments',
  CommentClicked: 'markup_comment_clicked',
};

const preventClick = (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

const onClick = (event) => {
  if (viewMode === ViewMode.Comment) {
    const bbox = event.target.getBoundingClientRect();
    if (event.target.classList.contains('markup-comment')) {
      window.parent.postMessage(
        {
          event: EventType.CommentClicked,
          payload: {
            id: Number(event.target.innerText),
            bbox,
            clientY: event.clientY,
            clientX: event.clientX,
            pageY: event.pageY,
            pageX: event.pageX,
          },
        },
        'https://markup.hungnp.com'
      );
    } else {
      console.log(event);
      window.parent.postMessage(
        {
          event: EventType.ThreadClicked,
          payload: {
            bbox,
            clientY: event.clientY,
            clientX: event.clientX,
            pageY: event.pageY,
            pageX: event.pageX,
          },
        },
        'https://markup.hungnp.com'
      );
    }
  }
  event.preventDefault();
  event.stopImmediatePropagation();
};

let viewMode = ViewMode.Comment;

const removeComments = () => {
  const commentPointElements =
    document.getElementsByClassName('markup-comment');
  for (const commentPointElement of commentPointElements) {
    commentPointElement.remove();
  }
};

window.addEventListener('message', (event) => {
  const eventData = event.data;
  if (eventData.event === EventType.ViewModeChange) {
    viewMode = eventData.payload.viewMode;
    if (viewMode === ViewMode.Comment) {
      document.addEventListener('click', onClick, true);
      document.addEventListener('dblclick', preventClick, true);
      document.addEventListener('submit', preventClick, true);
      document.addEventListener('mousedown', preventClick, true);
    }
    if (viewMode === ViewMode.Browse) {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('dblclick', preventClick, true);
      document.removeEventListener('submit', preventClick, true);
      document.removeEventListener('mousedown', preventClick, true);
    }
  }
  if (eventData.event === EventType.Comments) {
    const comments = eventData.payload.comments;
    removeComments();
    if (viewMode === ViewMode.Comment) {
      for (const comment of comments) {
        const commentElement = document.createElement('div');
        commentElement.classList.add('markup-comment');
        commentElement.style.setProperty(
          'top',
          `${comment.pageY}px`,
          'important'
        );
        commentElement.style.setProperty(
          'left',
          `${comment.pageX}px`,
          'important'
        );
        commentElement.innerText = `${comment.id}`;
        document.body.appendChild(commentElement);
      }
    }
  }
});

document.addEventListener('mouseover', (event) => {
  if (viewMode === ViewMode.Comment) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const threadHoverDiv = document.querySelector('.markup-thread-hover');
    if (threadHoverDiv && element) {
      const bbox = element.getBoundingClientRect();
      threadHoverDiv.style.setProperty('display', `block`, 'important');
      threadHoverDiv.style.setProperty('top', `${bbox.y}px`, 'important');
      threadHoverDiv.style.setProperty('left', `${bbox.x}px`, 'important');
      threadHoverDiv.style.setProperty('width', `${bbox.width}px`, 'important');
      threadHoverDiv.style.setProperty(
        'height',
        `${bbox.height}px`,
        'important'
      );
      window.parent.postMessage(
        {
          event: EventType.ThreadHover,
          payload: {
            bbox,
          },
        },
        'https://markup.hungnp.com'
      );
    }
  }
});

document.addEventListener('mouseout', (event) => {
  const threadHoverDiv = document.querySelector('.markup-thread-hover');
  if (threadHoverDiv) {
    threadHoverDiv.style.setProperty('display', `none`, 'important');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const threadHoverDiv = document.createElement('div');
  threadHoverDiv.classList.add('markup-thread-hover');
  document.body.appendChild(threadHoverDiv);
});
