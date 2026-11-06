import { bars as internationaleBars } from '../assets/scores/internationale/bars.js';
import { redRiver } from './red-river.js';
import { fretboardPatterns, rhythmPatterns, pickPatterns } from './curriculum.js';
export const openStrings = [64, 59, 55, 50, 45, 40];
export const chords = { C: [0, 1, 0, 2, 3, -1], Am: [0, 1, 2, 2, 0, -1], G: [3, 0, 0, 0, 2, 3], Em: [0, 0, 0, 2, 2, 0] };
const chordNotes = name => chords[name].flatMap((fret, i) => fret < 0 ? [] : [openStrings[i] + fret]);
const note = (string, fret, at, duration = 1, finger = fret) => ({
  string, fret, at, duration, finger, notes: [openStrings[string - 1] + fret],
});

function fingers({ fingers: pattern, strings, shift, subdivision = 1, pick }) {
  const events = strings.flatMap((string, index) => pattern.map((finger, step) => {
    const slot = index * pattern.length + step;
    return {
      ...note(string, finger + (shift ? index : 0), slot / subdivision, 1 / subdivision, finger),
      stroke: pick ? (pick === 'alternate' && slot % 2 ? '↑' : '↓') : '',
    };
  }));
  return { length: Math.ceil(events.length / subdivision / 4) * 4, events };
}

const patterns = (items, build) => items.map(item => [item.name, build(item), item]);

function rhythm({ strokes, subdivision = 2 }) {
  return { length: 4, events: strokes.split(' ').map((arrow, slot) => ({
    at: slot / subdivision, arrow, subdivision, duration: 0.12,
    notes: arrow === '·' ? [] : arrow === '×' ? [48] : [48, 55, 60],
  })) };
}

const changes = names => ({
  length: names.length * 4,
  events: names.flatMap((chord, bar) => Array.from({ length: 4 }, (_, beat) => ({
    at: bar * 4 + beat, duration: 1, chord, next: names[(bar + 1) % names.length], notes: chordNotes(chord),
  }))),
});

function ear(target) {
  return { length: 8, events: [
    { at: 0, duration: 1, notes: [60], silentClick: true },
    { at: 2, duration: 1, notes: [target], silentClick: true },
  ] };
}

export const songScores = {
  internationale: {
    title: '国际歌',
    hints: ['显示原谱', '隐藏原谱'],
    levels: [['用户提供的 SVG 谱', { length: internationaleBars.length * 4, events: [], svgBars: internationaleBars }]],
  },
  'red-river': {
    title: '红河谷 · 女声版（Capo 2）',
    hints: ['六线谱与指法', '只看六线谱', '只看当前音', '凭记忆弹'],
    levels: [['女声版 · D 指法 / Capo 2', redRiver]],
  },
};

export const lessons = [
  { title: '指板热身', description: '随拍落指。每个光点对应一根弦和一品，圆内数字是左手手指。', hints: ['整组与指法', '只看当前音', '弦与品文字', '隐藏指板'], levels: patterns(fretboardPatterns, fingers) },
  { title: '跟拍扫弦', hints: ['完整节奏型', '只看当前动作', '只看拍号', '只听节拍'], levels: patterns(rhythmPatterns, rhythm) },
  { title: '和弦换位', description: '每拍扫一次，第四拍准备换和弦。让右手保持匀速。', hints: ['指法与下一和弦', '当前和弦图', '只看和弦名', '隐藏和弦'], levels: [
    ['C → Am', changes(['C', 'Am'])], ['C → Am → Em → G', changes(['C', 'Am', 'Em', 'G'])],
  ] },
  { title: '曲目跟练' },
  { title: '听音找音', description: '先听主音，再听目标音。哼出目标音，在琴上找，最后核对。', hints: ['显示候选位置', '只显示候选音名', '凭耳朵找音'], levels: [
    ['主音与五度', ear(67)], ['加入三度', ear(64)],
  ] },
  { title: '拨片训练', hints: ['整组与指法', '只看当前音', '弦与品文字', '隐藏指板'], levels: patterns(pickPatterns, fingers) },
];
