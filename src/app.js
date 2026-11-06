import { defaultSong, songs, trainingPlan } from './curriculum.js';
import { dayKey, fillProgress, showRecords, sumDay, timeLabel } from './records.js';
import { Player } from './audio.js';
import { lessons, songScores } from './lessons.js';
import { renderExercise, tab } from './views.js';

const $ = id => document.getElementById(id);
const player = new Player();
const storageKey = 'fretly-studio-v1';
const speeds = [['新手', 50], ['进阶', 65], ['中级', 80], ['高级', 100], ['大师', 125], ['超神', 155]];
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') ?? {}; } catch {}
const settings = saved.settings ?? {};
const history = saved.history ?? [];
let timingDay = dayKey();
let times = !saved.timingDay || saved.timingDay === timingDay ? saved.times ?? {} : {};
const mastered = saved.mastered ?? {};
const songSettings = saved.songSettings ?? {};
let songId = Object.hasOwn(songScores, saved.songId) ? saved.songId : defaultSong;
const daily = saved.daily ?? {};
const dailyGoal = trainingPlan.dailyMinutes * 60_000;
const checkIns = saved.checkIns ?? {};
for (const [day, entries] of Object.entries(daily)) {
  if (sumDay(entries) >= dailyGoal) checkIns[day] = true;
}
const records = (celebrated = false) => showRecords({ daily, checkIns, goal: dailyGoal, lessons, celebrated });
const total = () => Object.values(daily).reduce((sum, entries) =>
  sum + Object.values(entries).reduce((subtotal, value) => subtotal + value, 0), 0);
const development = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
let developerUnlock = development && sessionStorage.getItem('fretly-dev-unlock') === '1';
let pCount = 0;
let lastP = 0;
const checkInCount = () => Object.keys(checkIns).length;
const allows = days => developerUnlock || checkInCount() >= days;
const canOpen = i => Boolean(trainingPlan.slots[i] && allows(trainingPlan.slots[i].days));
const minutesFor = i => trainingPlan.slots[i].minutes[checkInCount() >= trainingPlan.slots.find(slot => slot.id === 'pick').days ? 1 : 0]
  || trainingPlan.slots[i].minutes[1];
let index = canOpen(saved.index) ? saved.index : 0;
let active = false;
let run = 0;
let lastTick = null;
let lastFrame = '';
let lastSaved = 0;
let liveBar = null;

const lesson = () => index === 3 ? songScores[songId] : lessons[index];
const config = () => {
  const defaults = { level: 0, bpm: 50, hint: 0 };
  const value = index === 3
    ? (songSettings[songId] ??= songId === 'red-river' ? settings[3] ?? defaults : defaults)
    : (settings[index] ??= defaults);
  value.bar ??= value.from ?? 1;
  value.demo ??= index !== 0;
  value.loop ??= true;
  return value;
};
const levelAllowed = i => Boolean(lesson().levels[i] && allows(lesson().levels[i][2]?.days ?? 0));
const level = () => lesson().levels[config().level][1];
const target = () => minutesFor(index) * 60_000;
const elapsed = () => times[index] ?? 0;
const completed = () => elapsed() >= target();
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify({ index, settings, history, times, timingDay, daily, checkIns, mastered, songId, songSettings })); }
  catch { $('status').textContent = '浏览器无法保存本次进度。'; }
}

function clock() {
  fillProgress('ribbon', 'ribbonFill', elapsed(), target());
  $('timer').textContent = timeLabel(Math.max(0, target() - elapsed()), Math.ceil);
  $('progress').textContent = '累计 ' + timeLabel(total());
}

function choices(id, labels, selected, choose) {
  $(id).replaceChildren(...labels.map((label, i) => {
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-outline-light';
    button.textContent = label;
    button.setAttribute('aria-pressed', String(Array.isArray(selected) ? selected.includes(i) : i === selected));
    button.onclick = () => choose(i);
    return button;
  }));
}

function selectedBars() {
  const { bars, bar } = config();
  const limit = level().length / 4;
  const valid = [...new Set(bars ?? [bar])].filter(n => Number.isInteger(n) && n >= 1 && n <= limit);
  return valid.length ? valid.sort((a, b) => a - b) : [1];
}

function drawSong(beat, hint) {
  const current = Math.floor(beat / 4) + 1;
  const selection = selectedBars();
  const visible = selection.includes(current) ? selection : [current];
  const score = level();
  const hidden = score.svgBars ? hint > 0 : hint >= 2;
  if (hidden) {
    $('visual').innerHTML = renderExercise(3, score.events, beat, score.svgBars ? 3 : hint);
    return;
  }
  const key = [songId, hint, ...visible].join(':');
  if ($('visual').firstElementChild?.dataset.selection !== key) {
    $('visual').innerHTML = `<div class="score-grid" data-selection="${key}">${visible.map(number => {
      const original = score.svgBars?.[number - 1];
      const content = original ? (() => {
        const [file, left, right, width, height, top] = original;
        return `<svg viewBox="${left} ${top} ${right - left} 76" role="img" aria-label="国际歌第 ${number} 小节六线谱"><image href="./assets/scores/internationale/${file}" width="${width}" height="${height}"/></svg>`;
      })() : tab(score.events, (number - 1) * 4, hint);
      return `<div class="score-measure" data-measure="${number}"><small>第 ${number} 小节</small>${content}</div>`;
    }).join('')}</div>`;
  }
  for (const card of $('visual').firstElementChild.children) {
    const playing = Number(card.dataset.measure) === current;
    card.classList.toggle('current-measure', playing);
    const playhead = card.querySelector('.playhead');
    if (playhead) {
      playhead.style.visibility = playing && active ? 'visible' : 'hidden';
      if (playing) playhead.setAttribute('x', String(55 + beat % 4 * 126));
    }
  }
}

function draw(beat = 0) {
  const { hint } = config();
  const frame = Math.floor(beat * 8);
  if (lastFrame === frame) return;
  lastFrame = frame;
  if (index === 3 && beat >= 0) drawSong(beat, hint);
  else {
    const details = $('visual').querySelector('details');
    if (index !== 4 || !details?.open || beat < 3) {
      $('visual').innerHTML = renderExercise(index, level().events, beat, hint);
    }
  }
  const count = ((Math.floor(beat) % 4) + 4) % 4;
  $('beat').innerHTML = Array.from({ length: 4 }, (_, i) => `<span class="${count === i ? 'lit' : ''}">${i + 1}</span>`).join('');
}

function playbackButton() {
  $('play').innerHTML = (active ? '暂停' : '开始跟练') + ' <kbd>Space</kbd>';
  $('play').disabled = completed();
  $('restart').disabled = completed();
}

function stop(message) {
  run++;
  player.stop();
  active = false;
  lastTick = null;
  if (liveBar !== null) config().bar = liveBar;
  liveBar = null;
  playbackButton();
  if (message) $('status').textContent = message;
  save();
}

function set(field, value) {
  const playing = active;
  if (playing) stop();
  config()[field] = value;
  save();
  render();
  if (playing) start();
}

function render() {
  if (!levelAllowed(config().level)) config().level = 0;
  $('dayTitle').textContent = 'Day ' + (checkInCount() + 1);
  $('dayNote').textContent = checkInCount() + ' 天已打卡';
  const { bpm, hint, level: selected, demo, loop } = config();
  $('lessons').innerHTML = lessons.map((item, i) => `<button class="btn btn-outline-light" data-lesson="${i}" ${i === index ? 'aria-current="step"' : ''} ${!canOpen(i) ? 'disabled' : ''}><span>0${i + 1}</span>${item.title}<small>${!canOpen(i) ? `打卡 ${trainingPlan.slots[i].days} 天解锁` : `${minutesFor(i)} 分钟`}</small></button>`).join('');
  $('index').textContent = `练习 / ${trainingPlan.slots[index].id.toUpperCase()}`;
  $('title').textContent = lesson().title;
  $('bpm').value = bpm;
  choices('speeds', speeds.map(([label, value]) => `${label} ${value}`), speeds.findIndex(([, value]) => value === bpm), i => set('bpm', speeds[i][1]));
  $('levelWrap').hidden = lesson().levels.length === 1;
  $('levels').replaceChildren(...lesson().levels.map(([name, , info], i) => {
    const button = document.createElement('button');
    const open = levelAllowed(i);
    const note = info ? `${info.tip} ${info.days ? `累计打卡 ${info.days} 天解锁 · ${Math.min(checkInCount(), info.days)}/${info.days}` : 'Day 1 可练'}` : name;
    button.className = 'btn btn-sm btn-outline-light technique';
    button.setAttribute('aria-pressed', String(i === selected));
    button.setAttribute('aria-disabled', String(!open));
    button.textContent = (open ? '◇ ' : '🔒 ') + name;
    button.title = note;
    const tooltip = document.createElement('span');
    tooltip.className = 'technique-tip';
    tooltip.textContent = note;
    button.append(tooltip);
    button.onclick = () => {
      if (open) set('level', i);
      else $('status').textContent = note;
    };
    return button;
  }));
  choices('hints', lesson().hints, hint, i => set('hint', i));
  $('barsWrap').hidden = $('songMode').hidden = index !== 3;
  if (index === 3) {
    const selection = selectedBars();
    choices('bars', Array.from({ length: level().length / 4 }, (_, i) => String(i + 1)),
      selection.map(n => n - 1), i => {
        const bar = i + 1;
        const updated = selection.includes(bar) ? selection.filter(n => n !== bar) : [...selection, bar];
        set('bars', updated.length ? updated : [bar]);
      });
  }
  const visualScore = Boolean(level().svgBars);
  $('demo').setAttribute('aria-pressed', String(!visualScore && (demo || index === 4)));
  $('demo').disabled = index === 4 || visualScore;
  $('demo').title = visualScore ? '原谱跟练使用节拍器' : '';
  $('loop').setAttribute('aria-pressed', String(loop));
  $('advance').setAttribute('aria-pressed', String(!loop));
  $('next').hidden = !canOpen(index + 1);
  $('next').disabled = !completed() && !developerUnlock;
  $('retry').hidden = !completed();
  clock();
  playbackButton();
  lastFrame = '';
  draw(index === 3 ? (selectedBars()[0] - 1) * 4 : 0);
}

function finish() {
  times[index] = target();
  history.push({ index, day: new Date().toLocaleDateString(), duration: target() });
  stop('本项时间到');
  render();
}

function refreshTimingDay() {
  const today = dayKey();
  if (today === timingDay) return false;
  timingDay = today;
  times = {};
  return true;
}

async function start() {
  if (refreshTimingDay()) render();
  if (completed()) return;
  const { bpm, loop } = config();
  const song = index === 3;
  const score = level();
  const selection = song ? selectedBars() : [];
  const sequence = song && !loop && selection.length === 1
    ? Array.from({ length: score.length / 4 - selection[0] + 1 }, (_, i) => selection[0] + i)
    : selection;
  const length = song ? sequence.length * 4 : score.length;
  const events = song ? sequence.flatMap((bar, i) => {
    const start = (bar - 1) * 4;
    return score.events.filter(event => event.at >= start && event.at < start + 4)
      .map(event => ({ ...event, at: event.at - start + i * 4 }));
  }) : score.events;
  const currentRun = ++run;
  lastTick = null;
  active = true;
  playbackButton();
  $('status').textContent = '四拍预备';
  try {
    await player.start({
      bpm, length, events, loop: () => !song || loop, demo: () => index === 4 || config().demo,
      onFrame: beat => {
        if (refreshTimingDay()) {
          stop('新的一天，按开始继续练习。');
          render();
          return;
        }
        if (beat >= 0) {
          const now = performance.now();
          if (lastTick === null) $('status').textContent = '跟练中';
          else {
            const delta = Math.min(now - lastTick, 250, target() - elapsed());
            times[index] = elapsed() + delta;
            const entries = daily[dayKey()] ??= {};
            entries[index] = (entries[index] ?? 0) + delta;
          }
          lastTick = now;
          clock();
          const today = dayKey();
          if (!checkIns[today] && sumDay(daily[today]) >= dailyGoal) {
            const finished = completed();
            if (finished) finish();
            checkIns[today] = true;
            if (finished) { save(); render(); }
            else { stop('今日已打卡'); render(); }
            records(true);
            return;
          }
          if (elapsed() >= target()) return finish();
          if (now - lastSaved >= 1000) { lastSaved = now; save(); }
        }
        const bar = song && beat >= 0 ? sequence[Math.floor(beat / 4)] : null;
        if (bar !== null) liveBar = bar;
        draw(bar === null ? beat : (bar - 1) * 4 + beat % 4);
      },
      onEnd: () => {
        stop('选段播放完成。');
        render();
      },
    });
  } catch {
    if (currentRun === run) stop('声音未启动，请重试。');
  }
}

function go(i) {
  if (!canOpen(i)) return;
  stop();
  index = i;
  $('status').textContent = completed() ? '本关完成' : '等待开始';
  render();
  save();
}

$('lessons').onclick = event => {
  const button = event.target.closest('[data-lesson]');
  if (button && !button.disabled) go(Number(button.dataset.lesson));
};
$('play').onclick = () => {
  if (!active) return start();
  stop('已暂停');
  render();
};
$('restart').onclick = start;
$('next').onclick = () => { if (completed() || developerUnlock) go(index + 1); };
$('retry').onclick = () => { times[index] = 0; stop('等待开始'); render(); };
$('demo').onclick = () => set('demo', !config().demo);
$('loop').onclick = () => set('loop', true);
$('advance').onclick = () => set('loop', false);
$('bpm').onchange = () => set('bpm', Math.min(180, Math.max(30, Math.round(Number($('bpm').value) || 50))));
function renderSongs() {
  $('songList').replaceChildren(...songs.map(song => {
    const row = document.createElement('article');
    row.className = 'song-row';
    const text = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = song.title;
    const detail = document.createElement('small');
    detail.textContent = `${song.artist} · ${song.difficulty} · ${song.skill}`;
    text.append(title, detail);
    row.append(text);
    if (song.url) {
      const source = document.createElement('a');
      source.href = song.url;
      source.target = '_blank';
      source.rel = 'noopener';
      source.textContent = song.playable ? '参考谱' : '找谱';
      row.append(source);
    }
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-outline-light';
    button.textContent = mastered[song.id] ? '已掌握' : '确认掌握';
    button.setAttribute('aria-pressed', String(Boolean(mastered[song.id])));
    button.onclick = () => {
      if (mastered[song.id]) delete mastered[song.id];
      else mastered[song.id] = dayKey();
      save();
      button.textContent = mastered[song.id] ? '已掌握' : '确认掌握';
      button.setAttribute('aria-pressed', String(Boolean(mastered[song.id])));
    };
    row.append(button);
    if (song.playable) {
      const play = document.createElement('button');
      play.className = 'btn btn-sm btn-warning';
      play.textContent = '去跟练';
      play.onclick = () => {
        $('songLibrary').close();
        stop();
        songId = song.id;
        go(3);
      };
      row.append(play);
    }
    return row;
  }));
}

$('openSongs').onclick = () => {
  if (active) { stop('已暂停'); render(); }
  renderSongs();
  $('songLibrary').showModal();
};
$('openRecords').onclick = () => {
  if (active) { stop('已暂停'); render(); }
  records();
};
$('fullscreen').onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { $('status').textContent = '此窗口不支持全屏。'; }
};
document.addEventListener('fullscreenchange', () => {
  $('fullscreen').innerHTML = (document.fullscreenElement ? '退出全屏' : '全屏') + ' <kbd>F</kbd>';
});
document.addEventListener('keydown', event => {
  if ($('records').open || $('songLibrary').open || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey || event.target.closest('input, textarea, select, [contenteditable]')) return;
  if (development && event.code === 'KeyP') {
    const now = performance.now();
    pCount = now - lastP > 1000 ? 1 : pCount + 1;
    lastP = now;
    if (pCount === 5) {
      developerUnlock = true;
      sessionStorage.setItem('fretly-dev-unlock', '1');
      render();
      $('status').textContent = '开发模式 · 已开放全部关卡';
    }
    return;
  }
  pCount = 0;
  if (event.code === 'Space' && !event.target.closest('button, a, summary')) {
    event.preventDefault();
    $('play').click();
  } else if (event.code === 'KeyF') $('fullscreen').click();
  else if (event.code === 'KeyR') $('restart').click();
  else if (index === 3 && ['ArrowLeft', 'ArrowRight'].includes(event.code)) {
    event.preventDefault();
    const bar = (liveBar ?? selectedBars()[0]) + (event.code === 'ArrowRight' ? 1 : -1);
    if (bar >= 1 && bar <= level().length / 4) set('bars', [bar]);
  }
});
window.addEventListener('pagehide', () => stop());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && active) {
    stop('已暂停');
    render();
  }
});
render();
$('status').textContent = completed() ? '本关完成' : '等待开始';
