import { chords } from './lessons.js';

const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const text = (x, y, value, css = '') => `<text x="${x}" y="${y}" class="${css}">${value}</text>`;
const svg = (width, height, content, label) => `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">${content}</svg>`;
const sequence = (size, fn) => Array.from({ length: size }, (_, index) => fn(index)).join('');
const circle = (x, y, active) => `<circle cx="${x}" cy="${y}" r="12" class="${active ? 'active' : 'inactive'}"/>`;

function fretboard(events, current, hint) {
  if (hint === 2) return `<div class="prompt">${current.string} 弦 · ${current.fret} 品</div>`;
  const grid = sequence(6, i => line(45, 30 + i * 23, 574, 30 + i * 23) + text(20, 34 + i * 23, i + 1))
    + sequence(7, i => line(45 + i * 88, 30, 45 + i * 88, 145))
    + sequence(6, i => text(89 + i * 88, 173, i + 1));
  const dots = (hint === 0 ? events.filter(event => event.string === current.string && event.at >= Math.floor(current.at / 4) * 4 && event.at < Math.floor(current.at / 4) * 4 + 4) : [])
    .filter(event => event !== current).map(event => circle(event.fret * 88 + 1, 7 + event.string * 23, false)).join('');
  const x = current.fret * 88 + 1;
  const y = 7 + current.string * 23;
  return svg(600, 190, grid + dots + circle(x, y, true) + (hint === 0 ? text(x, y + 4, current.finger, 'ink') : ''), `${current.string}弦 ${current.fret}品`);
}

function chordDiagram(name, fingers) {
  const numbers = { C: [0, 1, 0, 2, 3, 0], Am: [0, 1, 3, 2, 0, 0], G: [3, 0, 0, 0, 1, 2], Em: [0, 0, 0, 3, 2, 0] };
  return svg(166, 138, text(83, 18, name, 'accent')
    + sequence(6, i => line(23 + i * 24, 45, 23 + i * 24, 120))
    + sequence(4, i => line(23, 45 + i * 25, 143, 45 + i * 25))
    + chords[name].map((fret, i) => {
      const x = 143 - i * 24;
      const y = 32.5 + fret * 25;
      return fret > 0 ? circle(x, y, true) + (fingers ? text(x, y + 4, numbers[name][i], 'ink') : '') : text(x, 38, fret === 0 ? '○' : '×');
    }).join(''), name + ' 和弦');
}

export function tab(events, beat, hint) {
  const bar = Math.max(0, Math.floor(beat / 4));
  const position = Math.max(0, beat) % 4;
  const slice = events.filter(event => Math.floor(event.at / 4) === bar);
  const grid = sequence(6, i => line(48, 45 + i * 19, 572, 45 + i * 19) + text(23, 49 + i * 19, ['e', 'B', 'G', 'D', 'A', 'E'][i]));
  return svg(600, 177, grid + `<rect class="playhead" x="${55 + position * 126}" y="27" width="2" height="128"/>`
    + sequence(4, i => text(67 + i * 126, 24, i + 1))
    + slice.map(event => {
      const x = 67 + (event.at % 4) * 126;
      const y = 49 + (event.string - 1) * 19;
      return `<rect class="tabbg" x="${x - 9}" y="${y - 14}" width="18" height="18" rx="3"/>`
        + text(x, y, event.fret, position >= event.at % 4 && position < event.at % 4 + event.duration ? 'accent' : '')
        + (hint === 0 ? text(x, 171, event.finger || '空弦') : '');
    }).join(''), '第 ' + (bar + 1) + ' 小节六线谱')
    + (hint === 0 ? '<div class="finger-key">左手指法 · 1 食指　2 中指　3 无名指　4 小指</div>' : '');
}

export function renderExercise(kind, events, beat, hint) {
  if (beat < 0) return `<div class="prompt">预备 <strong>${Math.floor(beat) + 5}</strong></div>`;
  const current = events.find(event => beat >= event.at && beat < event.at + event.duration);
  if (kind === 4) {
    const phase = beat < 1 ? '① 听主音 Do' : beat < 2 ? '记住 Do' : beat < 3 ? '② 听第二个音' : '③ 哼第二个音，在琴上找';
    const choices = hint === 0 ? '候选位置 · 1 弦 3 品 / 1 弦空弦' : hint === 1 ? '候选音 · 3 / 5' : '';
    return `<div class="prompt">${phase}<small>${choices}</small><details><summary>显示答案</summary>${events[1].notes[0] === 67 ? '5 · 第 1 弦第 3 品' : '3 · 第 1 弦空弦'}</details></div>`;
  }
  if (hint === 3) return '<div class="prompt">按节拍继续</div>';
  if (kind === 0 || kind === 5) return current
    ? fretboard(events, current, hint) + (current.stroke ? `<div class="finger-key">拨片 ${current.stroke}</div>` : '')
    : '<div class="prompt">休息</div>';
  if (kind === 1) {
    const division = events[0].subdivision;
    return `<div class="rhythm" style="--slots:${division * 4}">${sequence(division * 4, i => {
    const event = events.find(item => item.at === i / division);
    const active = Math.floor(beat * division) === i;
    return `<div class="${active ? 'lit' : ''}"><strong>${hint === 0 || (hint === 1 && active) ? event?.arrow ?? '·' : ' '}</strong><small>${i % division ? (division === 2 ? '&amp;' : ['','e','&amp;','a'][i % division]) : i / division + 1}</small></div>`;
  })}</div>`;
  }
  if (kind === 2 && !current) return '<div class="prompt">保持节拍</div>';
  if (kind === 2) return hint === 2 ? `<div class="prompt">${current.chord}</div>` :
    `<div class="chords">${chordDiagram(current.chord, hint === 0)}${hint === 0 ? `<div class="next"><small>${Math.floor(beat) % 4 === 3 ? '下一拍换' : '下一个'}</small>${chordDiagram(current.next, true)}</div>` : ''}</div>`;
  if (hint === 2) return `<div class="prompt">${current ? current.string + ' 弦 · ' + current.fret + ' 品' : '休止'}</div>`;
  return tab(events, beat, hint);
}
