import "./App.css";
import Draw from "./Draw";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  applyEffects,
  enumeratePossibleActions,
  evaluateAction,
  exploreAndRate,
  minimalStateCopy,
  DEFAULT_HP,
  nextChars,
  DEFAULT_PA,
} from "./StateCompute";
var _ = require("lodash");

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

let alreadyReducing = null;
async function reducer(old, action) {
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

  let stateRef = useRef(defaultState());

  let dispatch = useCallback(async (action) => {
    if (alreadyReducing) {
      console.error(
        "alreadyReducing !!!",
        alreadyReducing,
        "while starting",
        action
      );
    }
    alreadyReducing = action;
    stateRef.current = await reducer(stateRef.current, action);
    alreadyReducing = null;
    setState(stateRef.current);
  }, []);

  let [state, setState] = useState(stateRef.current);

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
