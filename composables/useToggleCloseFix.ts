export default function (id: string) {
  const toggle = document.getElementById(id) as HTMLDetailsElement;
  const summary = toggle.getElementsByTagName('summary').item(0) as HTMLElement;

  const mouseOnElement = ref(false);

  const close = () => {
    if (mouseOnElement.value) {
      window.removeEventListener('click', close);
    } else {
      toggle.open = false;
    }
  };

  const toggleEventListener = (event: Event) => {
    if (event instanceof ToggleEvent) {
      if (event.newState === 'open') {
        window.addEventListener('click', close, { once: true });
      }
    }
  };

  const mouseEnter = () => (mouseOnElement.value = true);
  const mouseLeave = () => (mouseOnElement.value = false);

  toggle.addEventListener('toggle', toggleEventListener);
  summary.addEventListener('mouseenter', mouseEnter);
  summary.addEventListener('mouseleave', mouseLeave);
}
