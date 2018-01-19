/** Used only for the sequence scrolling at the moment.
 * Native DOM methods just aren't standardized enough yet,
 * so this is an implementation without libs or polyfills. */
export function smoothScrollToBottom() {
  const body = document.body;
  const html = document.documentElement;

  // Not all browsers for mobile/desktop compute height the same, this fixes it.
  const height = Math.max(body.scrollHeight, body.offsetHeight,
    html.clientHeight, html.scrollHeight, html.offsetHeight);

  const startY = window.pageYOffset;
  const stopY = height;
  const distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY);
    return;
  }

  // Higher the distance divided, faster the scroll.
  // Numbers too low will cause jarring ui bugs.
  let speed = Math.round(distance / 14);
  if (speed >= 6) { speed = 14; }
  const step = Math.round(distance / 25);
  let leapY = stopY > startY ? startY + step : startY - step;
  let timer = 0;
  if (stopY > startY) {
    for (let i = startY; i < stopY; i += step) {
      setTimeout(() => window.scrollTo(0, leapY), timer * speed);
      leapY += step;
      if (leapY > stopY) { leapY = stopY; }
      timer++;
    } return;
  }
  for (let i = startY; i > stopY; i -= step) {
    setTimeout(() => window.scrollTo(0, leapY), timer * speed);
    leapY -= step; if (leapY < stopY) { leapY = stopY; }
    timer++;
  }
}
