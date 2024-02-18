const ViewMode = {
  Comment: 'comment',
  Browse: 'browse',
};

const EventType = {
  ViewModeChange: 'markup_view_mode_change',
  ThreadHover: 'markup_thread_hover',
};

const preventClick = (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
};

let viewMode = ViewMode.Browse;

window.addEventListener('message', (event) => {
  const eventData = event.data;
  if (eventData.event === EventType.ViewModeChange) {
    viewMode = eventData.payload.viewMode;
    if (viewMode === ViewMode.Comment) {
      document.addEventListener('click', preventClick, true);
      document.addEventListener('dblclick', preventClick, true);
      document.addEventListener('submit', preventClick, true);
      document.addEventListener('mousedown', preventClick, true);
    }
    if (viewMode === ViewMode.Browse) {
      document.removeEventListener('click', preventClick, true);
      document.removeEventListener('dblclick', preventClick, true);
      document.removeEventListener('submit', preventClick, true);
      document.removeEventListener('mousedown', preventClick, true);
    }
  }
});

document.addEventListener('mouseover', (event) => {
  // window.parent.postMessage({
  //   event: EventType.ThreadHover,
  //   payload: {
  //     target: event.target,
  //     x: event.pageX,
  //     y: event.pageY,
  //   },
  // });
  if (viewMode === ViewMode.Comment) {
    const threadHoverDiv = document.querySelector('.markup-thread-hover');
    if (threadHoverDiv) {
      const bbox = event.target.getBoundingClientRect();
      threadHoverDiv.style.setProperty('display', `block`, 'important');
      threadHoverDiv.style.setProperty('top', `${bbox.y}px`, 'important');
      threadHoverDiv.style.setProperty('left', `${bbox.x}px`, 'important');
      threadHoverDiv.style.setProperty('width', `${bbox.width}px`, 'important');
      threadHoverDiv.style.setProperty(
        'height',
        `${bbox.height}px`,
        'important'
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
