export let nextChars = (state) => {
  let nexts = [];
  let lastPlayedTurn = Number.MAX_SAFE_INTEGER;

  let alives = state.chars.filter((e) => e.hp >= 1);

  alives.forEach((char) => {
    lastPlayedTurn = Math.min(lastPlayedTurn, char.lastPlayedTurn);
  });

  alives
    .filter((char) => char.lastPlayedTurn === lastPlayedTurn)
    .forEach((char) => {
      nexts.push(char);
    });

  while (nexts.length < 10) {
    alives.forEach((char) => {
      nexts.push(char);
    });
  }
  return nexts.slice(0, 10);
};
