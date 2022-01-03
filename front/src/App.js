import "./App.css";
// eslint-disable-next-line
import MyWorker from "comlink-loader!./StateCompute";

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
  bestAction,
  generateBestIAAction,
  DEFAULT_PA,
} from "./StateCompute";

var _ = require("lodash");
const worker = new MyWorker();
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
    .map((e) => {
      return {
        type: parseInt(e),
        effects: [],
      };
    }),
};

let alreadyReducing = null;
async function reducer(old, action) {
  console.log("dispatch start", action.type);
  if (action.type === "tick") {
    if (old.currentChar.user === "me") {
      return old;
    } else {
      //
      action = await worker.generateBestIAAction(old);
    }
  }
  let state = _.cloneDeep(old);

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

    map: MAP,
    chars: [
      {
        id: ids[0],
        x: 1,
        y: 1,
        name: "foo",
        lastPlayedTurn: -1,
        user: "me",
        team: "1",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[0] + ".svg",
        hp: DEFAULT_HP,
        cooldown: {},
      },
      {
        id: ids[1],
        x: 5,
        y: 2,
        name: "bar",
        lastPlayedTurn: -1,
        user: "ia2",
        team: "2",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[1] + ".svg",
        hp: DEFAULT_HP,
        cooldown: {},
      },
      {
        id: ids[2],
        x: 5,
        y: 5,
        name: "baz",
        lastPlayedTurn: -1,
        user: "ia3",
        team: "3",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[2] + ".svg",
        hp: DEFAULT_HP,
        cooldown: {},
      },
      {
        id: ids[3],
        x: 11,
        y: 11,
        name: "zoo",
        lastPlayedTurn: -1,
        user: "ia4",
        team: "4",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[3] + ".svg",
        hp: DEFAULT_HP,
        cooldown: {},
      },
      {
        id: ids[4],
        x: 2,
        y: 11,
        name: "moo",
        lastPlayedTurn: -1,
        user: "ia5",
        team: "5",
        pa: DEFAULT_PA,
        avatar: "https://avatars.dicebear.com/api/bottts/" + ids[4] + ".svg",
        hp: DEFAULT_HP,
        cooldown: {},
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
      if (action.type === "tick") return;
    }
    alreadyReducing = action;
    stateRef.current = await reducer(stateRef.current, action);
    alreadyReducing = null;
    setState(stateRef.current);
  }, []);

  let [state, setState] = useState(stateRef.current);

  useEffect(() => {
    setTimeout(() => {
      dispatch({ type: "tick" });
    }, 500);
  }, [state, dispatch]);

  return (
    <div className="App">
      <Draw user={user} state={state} do_action={dispatch}></Draw>
    </div>
  );
}

export default App;
