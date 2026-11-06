// 用户提供的《红河谷》女声版。D 调指法，Capo 2，4/4。
// 前奏依六线谱定位，之后按简谱录唱腔，配弦品用于单音跟练。
const positions = {
  '1': [2, 3, 3, 62], '2': [1, 0, 0, 64], '3': [1, 2, 1, 66],
  '4': [1, 3, 2, 67], '5': [1, 5, 4, 69],
  low5: [3, 2, 1, 57], low6: [3, 4, 3, 59], flat6: [3, 3, 2, 58],
  low7: [2, 2, 1, 61],
};
const pickup = [[null, 3], ['5', .5], ['4', .5]];
const introA = [['3', 1], ['3', .5], ['2', .5], ['1', 1], ['2', .75], ['3', .25]];
const introB = [['5', .5], ['4', 2], [null, .5], ['low6', .5], ['flat6', .5]];
const introC = [['low5', 1], ['low7', .5], ['1', .5], ['2', .75], ['3', .25], ['2', 1]];
const introD = [['1', 3], ['low5', .5], ['1', .5]];
const verseA = [['3', 1], ['3', .5], ['3', .5], ['3', 1], ['2', .5], ['3', .5]];
const verseA2 = [['3', 1], ['3', 1], ['3', 1], ['2', .5], ['3', .5]];
const verseB = [['2', .5], ['1', 2], [null, .5], ['low5', .5], ['1', .5]];
const verseC = [['3', 1], ['1', .5], ['3', .5], ['5', .75], ['5', .25], ['4', .5], ['3', .5]];
const verseD = [['2', 3], ['5', .5], ['4', .5]];
const refrainA = [['3', 1], ['3', .5], ['2', .5], ['1', 1], ['2', .5], ['3', .5]];
const refrainC = [['low5', 1], ['low7', .5], ['1', .5], ['2', .75], ['2', .25], ['3', .5], ['2', .5]];
const intro = [introA, introB, introC, introD];
const refrain = [refrainA, introB, refrainC, introD];
const verse = [verseA, verseB, verseC, verseD, ...refrain, verseA, verseB, verseC, verseD, ...refrain,
  verseA2, verseB, verseC, verseD, refrainA, introB, refrainC];
const bars = [pickup, ...intro, ...verse, [['1', 3], ['5', .5], ['4', .5]],
  ...intro, ...verse, [['1', 3], ['5', .5], ['4', .5]], refrainA, introB, refrainC];

export const redRiver = {
  length: bars.length * 4,
  events: bars.flatMap((bar, index) => {
    let at = index * 4;
    return bar.flatMap(([degree, duration]) => {
      const start = at;
      at += duration;
      if (!degree) return [];
      const [string, fret, finger, writtenMidi] = positions[degree];
      return [{ at: start, duration, string, fret, finger, writtenMidi, notes: [writtenMidi + 2] }];
    });
  }),
};
