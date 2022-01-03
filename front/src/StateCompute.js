var _ = require("lodash");

export const DEFAULT_HP = 10;
export const MAX_HP = 15;
export const DEFAULT_PA = 10;
export const MAX_PA = 15;
export const PA_REGEN = 10;

const POWER = {
  arrow: {
    name: "arrow",
    damage: 1,
    cooldown: 2,
    cost: 4,
    maxDist: 15,
  },
  fire: {
    name: "fire",
    damage: 2,
    cooldown: 4,
    cost: 5,
    maxDist: 15,
  },
};

/**
 *
 * @param {Object} a
 * @param {number} a.x
 * @param {number} a.y
 * @param {Object} b
 * @param {number} b.x
 * @param {number} b.y
 * @returns {{x:number, y:number}}
 */
export function addPos(a, b) {
  return { x: b.x + a.x, y: b.y + a.y };
}
/**
 *
 * @param {Object} a
 * @param {number} a.x
 * @param {number} a.y
 * @param {Object} b
 * @param {number} b.x
 * @param {number} b.y
 * @returns {{x:number, y:number, l:number}}
 */
export function diffPos(a, b) {
  let d = { x: b.x - a.x, y: b.y - a.y };
  d.l = Math.sqrt(d.x * d.x + d.y * d.y);
  return d;
}

/**
 * @param {Object} p
 * @param {number} p.x
 * @param {number} p.y
 */
export function indexFromPos(p, map) {
  return p.x + p.y * map.w;
}
/**
 * @param {Object} p
 * @param {number} p.x
 * @param {number} p.y
 */
export function tileFromPos(p, map) {
  return map.tiles[p.x + p.y * map.w];
}

export function rateState(state, fromIdPov) {
  let score = 0;
  let current = state.chars.find((e) => e.id === fromIdPov);
  let myTeam = current.team;

  let closestEnnemy = null;
  state.chars.forEach((other) => {
    let ally = other.team === myTeam;
    let factor = ally ? 1 : -1;
    score += (other.pa * 0.0 + Math.pow(other.hp, 0.5)) * factor;

    if (!ally && other.hp > 0) {
      let d = diffPos(other, current);
      if (!closestEnnemy || d.l < closestEnnemy.l) {
        closestEnnemy = { l: d.l, ...other };
      }
    }
  });

  if (closestEnnemy) {
    score -= closestEnnemy.l * 0.01;
  }

  return score;
}

export function enumeratePossibleActions(state) {
  let allActions = [];
  const currentChar = state.currentChar;
  //Move
  [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ].forEach(([dx, dy]) => {
    let newPos = addPos(currentChar, { x: dx, y: dy });
    allActions.push({ type: "move", ...newPos });
  });
  //Attack
  state.chars.forEach((enemy) => {
    if (enemy.team !== currentChar.team) {
      allActions.push({ type: "attack", target: enemy.id });
    }
  });
  //Arrow
  state.chars.forEach((enemy) => {
    if (enemy.team !== currentChar.team) {
      allActions.push({ type: "arrow", target: enemy.id });
    }
  });
  //Pass
  {
    allActions.push({ type: "pass" });
  }

  let actions = [];
  allActions.forEach((action) => {
    let { cost, possible, effects } = evaluateAction(state, action);
    if (possible) {
      actions.push({ ...action, cost, effects });
    }
  });

  return actions;
}

export function bestAction(old, actions_) {
  let actions = actions_.map((action) => {
    let newSubState = minimalStateCopy(old);

    applyEffects(newSubState, action.effects);
    // let score = rateState(newSubState, old.currentChar.id);

    let score = exploreAndRate(newSubState, old.currentChar.id, 4);

    return { ...action, score };
  });

  //Take one of the best outcome
  actions.sort((a, b) => b.score - a.score);
  actions = _.takeWhile(actions, (e) => e.score === actions[0].score);

  return _.sample(actions);
}

export function generateBestIAAction(state) {
  let start = performance.now();
  let actions = enumeratePossibleActions(state);
  let action = bestAction(state, actions);
  console.log("IA PLAY took:", performance.now() - start, "ms");
  return action;
}

export const EFFECT_TYPES = {
  END_TURN: "END_TURN",
  REGEN_PA: "REGEN_PA",
  LOSE_PA: "LOSE_PA",
  LOSE_HP: "LOSE_HP",
  MOVE: "MOVE",

  EMPTY_POWER: "EMPTY_POWER",

  //ANIMATION EFFECT
  ANIM_MOVE: "ANIM_MOVE",
  ANIM_ATTACK: "ANIM_ATTACK",
  ANIM_ARROW: "ANIM_ARROW",
};

/**
 *
 * @param {*} state
 * @param {*} action
 * @returns {{cost:number, possible:boolean, effect : *}}
 */
export function evaluateAction(state, action) {
  const currentChar = state.currentChar;
  const currentCharId = state.currentChar.id;
  let cost = 0;
  let possible = false;

  let effects = [];

  if (action.type === "move") {
    let tile = tileFromPos(action, state.map);
    if (isWalkable(tile)) {
      let d = diffPos(currentChar, action);
      let canReach = d.l > 0 && d.l < 1.5;
      if (canReach) {
        cost = d.l === 1 ? 2 : 3;
        let hasEnoughMana = cost <= currentChar.pa;
        if (hasEnoughMana) {
          let noOtherChar =
            state.chars.filter((e) => e.x === action.x && e.y === action.y)
              .length === 0;
          possible = noOtherChar;
          if (possible) {
            effects.push({
              type: EFFECT_TYPES.LOSE_PA,
              charId: currentCharId,
              cost,
            });
            effects.push({
              type: EFFECT_TYPES.ANIM_MOVE,
              charId: currentCharId,
              from: { x: currentChar.x, y: currentChar.y },
              to: { x: action.x, y: action.y },
            });
            effects.push({
              type: EFFECT_TYPES.MOVE,
              charId: currentCharId,
              x: action.x,
              y: action.y,
            });
          }
        }
      }
    }
  } else if (action.type === "attack") {
    cost = 3;
    let target = state.chars.find((e) => e.id === action.target);

    if (target.hp > 0) {
      let d = diffPos(currentChar, target);
      let canReach = d.l > 0 && d.l < 1.5;
      if (canReach) {
        let hasEnoughMana = cost <= currentChar.pa;
        if (hasEnoughMana) {
          possible = true;
          effects.push({
            type: EFFECT_TYPES.ANIM_ATTACK,
            charId: currentCharId,
            d: d,
          });
          effects.push({
            type: EFFECT_TYPES.LOSE_PA,
            charId: currentCharId,
            cost,
          });

          effects.push({
            type: EFFECT_TYPES.LOSE_HP,
            charId: action.target,
            hpLost: 1,
          });
        }
      }
    }
  } else if (action.type === "arrow") {
    let power = POWER[action.type];
    cost = power.cost;
    let target = state.chars.find((e) => e.id === action.target);

    if (!currentChar.cooldown["arrow"] && target.hp > 0) {
      let d = diffPos(currentChar, target);
      let canReach = d.l > 0 && d.l <= power.maxDist;
      if (canReach) {
        let hasEnoughMana = cost <= currentChar.pa;
        if (hasEnoughMana) {
          possible = true;
          effects.push({
            type: EFFECT_TYPES.EMPTY_POWER,
            charId: currentCharId,
            power: power.name,
          });
          effects.push({
            type: EFFECT_TYPES.ANIM_ARROW,
            charId: currentCharId,
            from: { x: currentChar.x, y: currentChar.y },
            to: { x: target.x, y: target.y },
            d: d,
          });
          effects.push({
            type: EFFECT_TYPES.LOSE_PA,
            charId: currentCharId,
            cost,
          });

          effects.push({
            type: EFFECT_TYPES.LOSE_HP,
            charId: action.target,
            hpLost: 1,
          });
        }
      }
    }
  } else if (action.type === "pass") {
    cost = 0;
    possible = true;
    effects.push({ type: EFFECT_TYPES.END_TURN, charId: currentCharId });
  }

  return { cost, possible, effects };
}

export function applyEffects(state, effects, animation = false) {
  if (effects.length === 0) return;

  let newEffects = [];
  effects.forEach((effect) => {
    if (effect.type === EFFECT_TYPES.LOSE_HP) {
      state.chars.find((e) => e.id === effect.charId).hp -= effect.hpLost;
    } else if (effect.type === EFFECT_TYPES.LOSE_PA) {
      state.chars.find((e) => e.id === effect.charId).pa -= effect.cost;
    } else if (effect.type === EFFECT_TYPES.EMPTY_POWER) {
      state.chars.find((e) => e.id === effect.charId).cooldown[effect.power] =
        POWER[effect.power].cooldown;
    } else if (effect.type === EFFECT_TYPES.MOVE) {
      let char = state.chars.find((e) => e.id === effect.charId);
      char.x = effect.x;
      char.y = effect.y;
    } else if (effect.type === EFFECT_TYPES.REGEN_PA) {
      let char = state.chars.find((e) => e.id === effect.charId);
      char.pa = Math.min(char.pa + PA_REGEN, MAX_PA);
    } else if (effect.type === EFFECT_TYPES.END_TURN) {
      let char = state.chars.find((e) => e.id === effect.charId);
      Object.keys(char.cooldown).forEach((k) => {
        let v = char.cooldown[k];
        if (v === 1) {
          delete char.cooldown[k];
        } else {
          char.cooldown[k] -= 1;
        }
      });
      char.lastPlayedTurn += 1;

      state.nextChars = nextChars(state);
      state.currentChar = state.nextChars[0];

      newEffects.push({ type: EFFECT_TYPES.REGEN_PA, charId: effect.charId });
    }

    if (animation === true) {
      if (
        [
          EFFECT_TYPES.ANIM_ATTACK,
          EFFECT_TYPES.ANIM_MOVE,
          EFFECT_TYPES.ANIM_ARROW,
        ].includes(effect.type)
      ) {
        state.chars.find((e) => e.id === effect.charId).anim = {
          ...effect,
          startTime: performance.now(),
        };
      }
    }

    state.effects.push({ computedAt: performance.now(), ...effect });
  });

  applyEffects(state, newEffects);
}

export function minimalStateCopy(state) {
  return _.cloneDeep({
    chars: state.chars,
    map: state.map,

    currentChar: state.currentChar,
    nextChars: state.nextChars,
    actions: [],
    effects: [],
  });
}

export function exploreAndRate(state, charIdPov, depth) {
  if (depth === 0 || state.currentChar.id !== charIdPov) {
    return rateState(state, charIdPov);
  }

  // let prefix = "";
  // if (depth === 3) prefix = " ";
  // if (depth === 2) prefix = "  ";
  // if (depth === 1) prefix = "   ";
  // console.log(prefix, "explore", depth, "current", state.currentChar.name);
  let maxScore = -9999;

  let actions = enumeratePossibleActions(state);
  actions.forEach((action) => {
    let newSubState = minimalStateCopy(state);
    applyEffects(newSubState, action.effects);
    let score = exploreAndRate(newSubState, charIdPov, depth - 1);
    maxScore = Math.max(score, maxScore);
  });

  return maxScore;
}

export function isWalkable(tile) {
  return tile === 0;
}

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

let test = 0;
