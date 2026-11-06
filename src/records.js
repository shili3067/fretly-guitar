export const dayKey = (date = new Date()) => date.toLocaleDateString('sv-SE');

export const sumDay = entries => Object.values(entries ?? {}).reduce((sum, value) => sum + value, 0);

export function timeLabel(ms, round = Math.floor) {
  const seconds = round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  if (minutes >= 60) return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${rest}`;
  return `${String(minutes).padStart(2, '0')}:${rest}`;
}

export function fillProgress(id, fillId, elapsed, goal) {
  const percent = Math.min(100, elapsed / goal * 100);
  document.getElementById(id).setAttribute('aria-valuenow', String(Math.floor(percent)));
  document.getElementById(fillId).style.width = percent + '%';
}

export function showRecords({ daily, checkIns, goal, lessons, celebrated = false }) {
  const $ = id => document.getElementById(id);
  const today = dayKey();
  const todayTime = sumDay(daily[today]);
  $('recordLabel').textContent = celebrated ? today : '练习日历';
  $('recordTitle').textContent = celebrated ? '今日打卡完成' : '个人记录';
  $('recordToday').textContent = timeLabel(todayTime);
  $('recordTotal').textContent = timeLabel(Object.values(daily).reduce((sum, day) => sum + sumDay(day), 0));
  $('recordDays').textContent = String(Object.keys(checkIns).length);
  $('goalText').textContent = todayTime >= goal ? '今日目标已完成' : `今日目标 · ${goal / 60_000} 分钟`;
  fillProgress('dailyRibbon', 'dailyFill', todayTime, goal);
  const grid = $('calendar');
  const start = new Date();
  start.setDate(start.getDate() - (start.getDay() + 6) % 7 - 17 * 7);
  const cells = [];
  function select(key, button) {
    grid.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
    const duration = sumDay(daily[key]);
    $('dayDetail').textContent = `${key} · ${timeLabel(duration)}${checkIns[key] ? ' · 已打卡' : ''}`;
    $('breakdownTitle').textContent = `${key === today ? '今日' : key}分关时长`;
    const entries = Object.entries(daily[key] ?? {}).filter(([index]) => lessons[index]);
    $('breakdown').replaceChildren(...(entries.length ? entries : [[null, 0]]).map(([index, ms]) => {
      const item = document.createElement('li');
      item.textContent = index === null ? '当天没有练习记录' : `${lessons[index].title} · ${timeLabel(ms)}`;
      return item;
    }));
  }
  for (let i = 0; i < 18 * 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = dayKey(date);
    const cell = document.createElement('button');
    const duration = sumDay(daily[key]);
    cell.type = 'button';
    cell.dataset.tone = String(duration === 0 ? 0 : duration >= goal ? 4 : Math.ceil(duration / goal * 3));
    cell.dataset.day = key;
    cell.disabled = key > today;
    cell.title = `${key} · ${timeLabel(duration)}`;
    cell.setAttribute('aria-label', cell.title);
    cell.setAttribute('aria-pressed', 'false');
    cell.onclick = () => select(key, cell);
    cells.push(cell);
  }
  grid.replaceChildren(...cells);
  select(today, cells.find(cell => cell.dataset.day === today));
  if (!$('records').open) $('records').showModal();
}
