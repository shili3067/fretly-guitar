// Days are earned check-ins. A technique with "days: 3" opens on Day 4.
export const trainingPlan = {
  dailyMinutes: 35,
  slots: [
    { id: 'fretboard', days: 0, minutes: [5, 3] },
    { id: 'rhythm', days: 0, minutes: [5, 4] },
    { id: 'chords', days: 0, minutes: [5, 4] },
    { id: 'song', days: 0, minutes: [15, 15] },
    { id: 'ear', days: 0, minutes: [5, 4] },
    { id: 'pick', days: 3, minutes: [0, 5] },
  ],
};

export const fretboardPatterns = [
  { name: '单弦 1–2–3–4', days: 0, fingers: [1, 2, 3, 4], strings: [3], tip: '每拍一个音，手指落在品丝后方。' },
  { name: '跨弦往返', days: 2, fingers: [1, 2, 3, 4], strings: [4, 3, 2, 3], tip: '换弦时拍子继续走。' },
  { name: '交替 1–3–2–4', days: 5, fingers: [1, 3, 2, 4], strings: [4, 3, 2, 3], tip: '避免邻指跟着抬得太高。' },
  { name: '交替 1–2–4–3', days: 8, fingers: [1, 2, 4, 3], strings: [4, 3, 2, 3], tip: '小指落下后，再让无名指接上。' },
  { name: '换弦移动把位', days: 14, fingers: [1, 2, 3, 4], strings: [4, 3, 2], shift: true, tip: '每换一根弦，整只手移动一品。' },
  { name: '下行 4–3–2–1', days: 4, fingers: [4, 3, 2, 1], strings: [2, 3, 4], tip: '从小指起，练干净的反向落指。' },
  { name: '跳弦 1–4–2–3', days: 11, fingers: [1, 4, 2, 3], strings: [5, 3, 1, 3], tip: '跨过一根弦时保持右手动作小。' },
  { name: '八分蜘蛛练习', days: 21, fingers: [1, 3, 2, 4], strings: [4, 2, 3, 1], subdivision: 2, tip: '每拍两音，速度从新手档起。' },
];

export const rhythmPatterns = [
  { name: '四分下扫', days: 0, strokes: '↓ · ↓ · ↓ · ↓ ·', tip: '一拍扫一下，反拍空挥。' },
  { name: '八分扫弦', days: 3, strokes: '↓ · ↓ ↑ · ↑ ↓ ↑', tip: '手持续上下摆，第三拍只空挥。' },
  { name: '八分连续', days: 2, strokes: '↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑', tip: '上下扫音量保持接近。' },
  { name: '二四拍闷扫', days: 6, strokes: '↓ · × ↑ ↓ · × ↑', tip: '× 表示触弦闷扫，落在第 2、4 拍。' },
  { name: '反拍切分', days: 10, strokes: '↓ ↑ · ↑ · ↑ ↓ ·', tip: '第二、第三拍空挥，在反拍发声。' },
  { name: '十六分扫弦', days: 18, subdivision: 4, strokes: '↓ · · ↑ ↓ ↑ · ↑ ↓ · ↓ ↑ · ↑ ↓ ·', tip: '数 1 e & a，先降速保持手的连续摆动。' },
];

export const pickPatterns = [
  { name: '单弦下拨', days: 3, fingers: [1, 2, 3, 4], strings: [3], pick: 'down', tip: '拨片只探进弦一点，四分音符都用下拨。' },
  { name: '单弦交替拨', days: 5, fingers: [1, 2, 3, 4], strings: [3, 3], subdivision: 2, pick: 'alternate', tip: '按下、上交替，一拍两音。' },
  { name: '跨弦交替拨', days: 9, fingers: [1, 2, 3, 4], strings: [4, 3, 2, 3], subdivision: 2, pick: 'alternate', tip: '换弦后继续原来的下上顺序。' },
  { name: '跳弦交替拨', days: 16, fingers: [1, 3, 2, 4], strings: [5, 3, 1, 3], subdivision: 2, pick: 'alternate', tip: '跨弦时保留拍点，先求清楚再加速。' },
];

export const defaultSong = 'internationale';
export const songs = [
  { id: 'internationale', title: '国际歌', artist: '用户提供的吉他谱', difficulty: '默认入门曲', skill: '看原谱，按节拍逐小节练', playable: true },
  { id: 'red-river', title: '红河谷', artist: '传统民歌', difficulty: '入门', skill: '弱起与单音旋律', playable: true, url: './assets/scores/red-river-1.png' },
  { id: 'come-as-you-are', title: 'Come as You Are', artist: 'Nirvana', difficulty: '入门', skill: '先练主 riff 的交替拨和换弦', url: 'https://www.guitar-pro.com/tabs/search' },
  { id: 'shijiazhuang', title: '杀死那个石家庄人', artist: '万能青年旅店', difficulty: '入门', skill: 'C 调弹唱版练扫弦与和弦转换', url: 'https://www.jitabang.com/jitapu/4539.html' },
  { id: 'come-together', title: 'Come Together', artist: 'The Beatles', difficulty: '进阶', skill: '练电吉他声部的节奏与留白', url: 'https://www.songsterr.com/a/wsa/beatles-come-together-tab-s62923' },
  { id: 'adored', title: 'I Wanna Be Adored', artist: 'The Stone Roses', difficulty: '进阶', skill: '练主 riff、延音和重复段稳定度', url: 'https://www.songsterr.com/a/wsa/stone-roses-i-wanna-be-adored-tab-s19352' },
  { id: 'september', title: 'Wake Me Up When September Ends', artist: 'Green Day', difficulty: '进阶', skill: '清音分解到强力和弦的衔接', url: 'https://www.guitar-pro.com/tabs/search' },
  { id: 'oasis', title: 'Don’t Look Back in Anger', artist: 'Oasis', difficulty: '进阶', skill: '完整伴奏和段落动态', url: 'https://www.guitar-pro.com/tabs/search' },
  { id: 'city', title: 'City of Stars', artist: 'Justin Hurwitz', difficulty: '中级目标', skill: '旋律、低音和伴奏同步的完整独奏', url: 'https://www.guitar-pro.com/tabs/t/4531-city-of-stars-from-la-la-land' },
  { id: 'teen-spirit', title: 'Smells Like Teen Spirit', artist: 'Nirvana', difficulty: '中级', skill: '强力和弦、闷音与段落动态', url: 'https://www.guitar-pro.com/tabs/search' },
  { id: 'roses', title: 'I Am the Resurrection', artist: 'The Stone Roses', difficulty: '高级', skill: '先弹主歌，再分段处理尾奏', url: 'https://www.songsterr.com/a/wsa/the-stone-roses-tabs-a5325' },
  { id: 'por-una-cabeza', title: '一步之遥', artist: 'Carlos Gardel', difficulty: '高级', skill: '重音与旋律伴奏平衡' },
  { id: 'phantom', title: '歌剧魅影', artist: 'Andrew Lloyd Webber', difficulty: '高级', skill: '换把和动态对比' },
];
