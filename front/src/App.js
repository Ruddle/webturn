import logo from "./logo.svg";
import "./App.css";
import Draw from "./Draw";
import { useCallback, useEffect, useReducer, useState } from "react";
import { nextChars } from "./Rules";
var _ = require("lodash");

export const DEFAULT_HP = 10;
export const MAX_HP = 15;
export const DEFAULT_PA = 10;
export const MAX_PA = 15;
export const PA_REGEN = 10;

function isWalkable(tile) {
  return tile === 0;
}

let TILES = `
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 
  1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
  1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
`;

let MAP = {
  w: 14,
  h: 14,
  tiles: TILES.replace(" ", "")
    .split(",")
    .map((e) => parseInt(e)),
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
function addPos(a, b) {
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
function diffPos(a, b) {
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
    score -= closestEnnemy.l * 0.1;
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

export const EFFECT_TYPES = {
  END_TURN: "END_TURN",
  REGEN_PA: "REGEN_PA",
  LOSE_PA: "LOSE_PA",
  LOSE_HP: "LOSE_HP",
  MOVE: "MOVE",

  //ANIMATION EFFECT
  ANIM_MOVE: "ANIM_MOVE",
  ANIM_ATTACK: "ANIM_ATTACK",
};

/**
 *
 * @param {*} state
 * @param {*} action
 * @returns {{cost:number, possible:boolean, effect : *}}
 */
export function evaluateAction(state, action, animate = false) {
  const currentChar = state.currentChar;
  const currentCharId = state.currentChar.id;
  let cost = 0;
  let possible = false;

  let effects = [];

  // let endCharTurn = (s, t) => {
  //   let sideEffect = (s) => {
  //     let fromChar = s.chars.find((e) => currentCharId === e.id);

  //     fromChar.lastPlayedTurn += 1;
  //     fromChar.pa = Math.min(fromChar.pa + MANA_REGEN, MAX_MANA);
  //     s.nextChars = nextChars(s);
  //     s.currentChar = s.nextChars[0];
  //   };
  //   if (animate) {
  //     const start = performance.now();
  //     s.animating = true;
  //     s.stepAnimation = (s, t) => {
  //       let dt = t - start;
  //       if (dt > 500) {
  //         sideEffect(s);
  //         s.animating = false;
  //       }
  //     };
  //   } else {
  //     sideEffect(s);
  //   }
  // };

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
  } else if (action.type === "pass") {
    cost = 0;
    possible = true;
    effects.push({ type: EFFECT_TYPES.END_TURN, charId: currentCharId });
  }

  return { cost, possible, effects };
}

function applyEffects(state, effects, animation = false) {
  if (effects.length === 0) return;

  let newEffects = [];
  effects.forEach((effect) => {
    if (effect.type === EFFECT_TYPES.LOSE_HP) {
      state.chars.find((e) => e.id === effect.charId).hp -= effect.hpLost;
    } else if (effect.type === EFFECT_TYPES.LOSE_PA) {
      state.chars.find((e) => e.id === effect.charId).pa -= effect.cost;
    } else if (effect.type === EFFECT_TYPES.MOVE) {
      let char = state.chars.find((e) => e.id === effect.charId);
      char.x = effect.x;
      char.y = effect.y;
    } else if (effect.type === EFFECT_TYPES.REGEN_PA) {
      let char = state.chars.find((e) => e.id === effect.charId);
      char.pa = Math.min(char.pa + PA_REGEN, MAX_PA);
    } else if (effect.type === EFFECT_TYPES.END_TURN) {
      let char = state.chars.find((e) => e.id === effect.charId);
      char.lastPlayedTurn += 1;

      state.nextChars = nextChars(state);
      state.currentChar = state.nextChars[0];

      newEffects.push({ type: EFFECT_TYPES.REGEN_PA, charId: effect.charId });
    }

    if (animation === true) {
      if (effect.type === EFFECT_TYPES.ANIM_ATTACK) {
        state.chars.find((e) => e.id === effect.charId).anim = {
          ...effect,
          startTime: performance.now(),
        };
      } else if (effect.type === EFFECT_TYPES.ANIM_MOVE) {
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

function minimalStateCopy(state) {
  return _.cloneDeep({
    chars: state.chars,
    map: state.map,
    animating: false,
    currentChar: state.currentChar,
    nextChars: state.nextChars,
    actions: [],
    effects: [],
  });
}

function exploreAndRate(state, charIdPov, depth) {
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

function reducer(old, action) {
  console.log("dispatch start", action.type);
  if (old.animating === false && action.type === "animation") {
    if (old.currentChar.user === "me") {
      return old;
    } else {
      //IA PLAY

      let start = performance.now();
      console.log("IA PLAY");
      let actions = enumeratePossibleActions(old);

      actions = actions.map((action) => {
        let newSubState = minimalStateCopy(old);

        applyEffects(newSubState, action.effects);
        // let score = rateState(newSubState, old.currentChar.id);

        let score = exploreAndRate(newSubState, old.currentChar.id, 4);

        return { ...action, score };
      });

      //Take one of the best outcome
      actions.sort((a, b) => b.score - a.score);
      actions = _.takeWhile(actions, (e) => e.score === actions[0].score);

      action = _.sample(actions);
      console.log("IA PLAY took:", performance.now() - start, "ms");
    }
  }
  let state = _.cloneDeep(old);
  if (state.animating === true && action.type === "animation") {
    let time = performance.now();
    state.stepAnimation(state, time);
    return state;
  }
  let { cost, possible, effects } = evaluateAction(
    state,
    action,
    old.currentChar.user === "me"
  );
  if (possible) {
    state.actions.push({
      computedAt: performance.now(),
      ...action,
      char: state.currentChar,
      cost,
    });

    let computeTime = performance.now() - state.lastEffectTime;
    state.lastEffectTime = performance.now();
    state.computeTime = computeTime;

    applyEffects(state, effects, true);
  }
  console.log("dispatch end");
  return state;
}

function defaultState() {
  let randId = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

  let ids = [0, randId(), randId(), randId(), randId(), randId()];

  let s = {
    lastEffectTime: performance.now(),
    animating: false,
    map: MAP,
    chars: [
      {
        id: ids[0],
        x: 1,
        y: 1,
        name: "foo",
        lastPlayedTurn: -1,
        user: "me",
        team: "ia",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[0] + ".svg",
        hp: DEFAULT_HP,
      },
      {
        id: ids[1],
        x: 5,
        y: 2,
        name: "bar",
        lastPlayedTurn: -1,
        user: "ia2",
        team: "ia2",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[1] + ".svg",
        hp: DEFAULT_HP,
      },
      {
        id: ids[2],
        x: 5,
        y: 5,
        name: "baz",
        lastPlayedTurn: -1,
        user: "ia3",
        team: "ia3",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[2] + ".svg",
        hp: DEFAULT_HP,
      },
      {
        id: ids[3],
        x: 11,
        y: 11,
        name: "zoo",
        lastPlayedTurn: -1,
        user: "ia4",
        team: "ia4",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[3] + ".svg",
        hp: DEFAULT_HP,
      },
      {
        id: ids[4],
        x: 2,
        y: 11,
        name: "moo",
        lastPlayedTurn: -1,
        user: "ia5",
        team: "ia5",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[4] + ".svg",
        hp: DEFAULT_HP,
      },
    ],
    actions: [],
    effects: [],
  };

  s.nextChars = nextChars(s);
  s.currentChar = s.nextChars[0];

  return s;
}

function App() {
  let user = "me";

  let [state, dispatch] = useReducer(reducer, defaultState());

  useEffect(() => {
    setTimeout(() => {
      dispatch({ type: "animation" });
    }, 1000);
  }, [state]);

  return (
    <div className="App">
      <Draw user={user} state={state} do_action={dispatch}></Draw>
    </div>
  );
}

export default App;
