import { smoothstep, swi, useAnimationFrame } from "./h";

import styled, { keyframes } from "styled-components";
import { nextChars } from "./Rules";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_HP,
  EFFECT_TYPES,
  enumeratePossibleActions,
  evaluateAction,
  MAX_PA,
} from "./App";
var _ = require("lodash");

const TILE_WIDTH = 50;

const Tile = styled.div`
  width: 50px;
  height: 50px;
  transition: 200ms;
`;

const Power = styled.div`
  width: 50px;
  height: 50px;
  transition: 200ms;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

export default function Draw({ state, user, do_action }) {
  let [charHover, setCharHover] = useState(null);
  let [tileHover, setTileHover] = useState(null);

  let actionsEffects = useMemo(() => {
    let all = state.actions
      .map((e) => {
        return { isAction: true, ...e };
      })
      .concat(state.effects);
    all.sort((a, b) => a.computedAt - b.computedAt);

    all.splice(0, all.length - 100);
    return all;
  }, [state]);
  let nextPlayersMemo = state.nextChars;
  let currentChar = state.currentChar;
  let canAction = currentChar.user === user;

  const pass = useCallback(() => {
    if (canAction) {
      do_action({ type: "pass", charId: nextPlayersMemo[0].id, user });
    }
  }, [state, user, do_action]);

  const [selectedPower, setSelectedPower] = useState(null);
  const [predictedAction, setPredictedAction] = useState({
    possible: false,
    cost: 0,
    type: "none",
  });

  const actionsRef = useRef();

  useEffect(() => {
    let e = actionsRef.current;
    e.scrollTop = e.scrollHeight;
  }, [state]);

  useEffect(() => {
    setSelectedPower(null);
  }, [state]);

  let possibleActions = useMemo(() => {
    if (state.animating) return [];
    return enumeratePossibleActions(state).map((e) => {
      delete e.effects;
      return e;
    });
  }, [state]);

  useEffect(() => {
    if (canAction && possibleActions.length === 1) {
      pass();
    }
  }, [canAction, possibleActions, pass]);

  let [ticker, setTicker] = useState(0);
  let timer = useRef({ handle: null, tickAfter: false });
  useEffect(() => {
    if (!timer.current.handle) {
      timer.current.handle = setTimeout(() => {
        timer.current.handle = null;
        if (timer.current.tickAfter) {
          setTicker((old) => old + 1);
          timer.current.tickAfter = false;
        }
      }, 100);
    } else {
      timer.current.tickAfter = true;
      return;
    }

    let type = "none";
    let cost = 0;
    let possible = false;
    let eva = null;
    //Simple move
    if (selectedPower === null && tileHover !== null) {
      type = "move";
      eva = evaluateAction(state, {
        type,
        x: tileHover.x,
        y: tileHover.y,
      });
    } else if (
      (selectedPower === "attack" || selectedPower === null) &&
      charHover !== null &&
      charHover !== state.currentChar.id
    ) {
      type = "attack";
      eva = evaluateAction(state, {
        type,
        target: charHover,
      });
    }
    if (eva) {
      cost = eva.cost;
      possible = eva.possible;
    }
    setPredictedAction({ type, possible, cost });
  }, [state, selectedPower, charHover, tileHover, ticker]);

  const tileClick = useCallback(
    (x, y) => {
      if (canAction && predictedAction.possible === true) {
        do_action({ type: "move", x, y, charId: currentChar.id, user });
      }
    },
    [state, user, do_action, currentChar, predictedAction]
  );

  const charClick = useCallback(
    (charId) => {
      if (canAction && predictedAction.possible === true) {
        do_action({
          type: predictedAction.type,
          target: charId,
          charId: currentChar.id,
        });
      }
    },
    [state, user, do_action, currentChar, predictedAction]
  );

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>webturn v:0.0.3</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        {nextPlayersMemo.map((char, index) => (
          <div
            key={char.id + index}
            onMouseEnter={() => setCharHover(char.id)}
            onMouseLeave={() => setCharHover(null)}
            style={{
              background: charHover === char.id ? "#ccc" : "#fff",
              padding: "5px",
              margin: "5px",
              color: "black",
              userSelect: "none",
              border: index === 0 ? "4px solid #aef" : "2px solid #0000",
              borderRadius: "5px",
            }}
          >
            <div>
              <img style={{ width: "30px" }} src={char.avatar}></img>
            </div>
            {char.name}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          cursor: swi(
            [!canAction, "not-allowed"],
            [predictedAction.type === "attack", "crosshair"],
            [predictedAction.possible === true, "pointer"],
            "not-allowed"
          ),
        }}
      >
        {_.chunk(state.map.tiles, state.map.w).map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex" }}>
            {row.map((e, colIndex) => (
              <Tile
                key={colIndex}
                onMouseEnter={() =>
                  setTileHover({
                    x: colIndex,
                    y: rowIndex,
                    index: colIndex + state.map.w * rowIndex,
                  })
                }
                onMouseLeave={() => setTileHover(null)}
                onClick={() => tileClick(colIndex, rowIndex)}
                style={{
                  background: swi(
                    [e === 1, "#333"],
                    [
                      e === 0 &&
                        tileHover?.index === colIndex + state.map.w * rowIndex,
                      "#bbb",
                    ],
                    [e === 0, "#999"]
                  ),
                }}
              ></Tile>
            ))}
          </div>
        ))}

        {state.chars.map((char) => (
          <DisplayChar
            key={"cahr" + char.id}
            charHover={charHover}
            onMouseEnter={() => setCharHover(char.id)}
            onMouseLeave={() => setCharHover(null)}
            onClick={() => charClick(char.id)}
            currentChar={currentChar}
            char={char}
          ></DisplayChar>
        ))}
      </div>

      <div
        style={{
          opacity: canAction ? "1" : "0.7",
          cursor: canAction ? "auto" : "not-allowed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", margin: "10px" }}>
          {swi(
            [predictedAction.type === "none", () => <div>none</div>],
            [
              predictedAction.type !== "none",
              () => (
                <div
                  style={{ color: predictedAction.possible ? "black" : "red" }}
                >
                  {predictedAction.type} (cost {predictedAction.cost})
                </div>
              ),
            ]
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", margin: "10px" }}>
          {[...Array(MAX_PA).keys()].map((i) => (
            <div
              key={currentChar.id + "/" + i}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                margin: "5px",
                border: "3px solid black",
                transition: "500ms",
                background: swi(
                  [i + 1 <= currentChar.pa - predictedAction.cost, "#bbb"],
                  [i + 1 <= currentChar.pa, "#5ee"],
                  "#000"
                ),
              }}
            ></div>
          ))}
        </div>

        <div style={{ margin: "10px", background: "#eee" }}>
          <div
            style={{
              fontSize: "1.2em",
              background: "#345",
              color: "white",
              padding: "5px",
            }}
          >
            Power
          </div>
          <div style={{ display: "flex" }}>
            <Power
              onClick={() => setSelectedPower(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#333",
                color: "white",
                border: "3px solid #000",
              }}
            >
              Move
            </Power>
            <Power
              onClick={pass}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#333",
                color: "white",
                border: "3px solid #000",
              }}
            >
              Pass
            </Power>
            <Power
              onClick={() =>
                setSelectedPower((old) => (old === "attack" ? null : "attack"))
              }
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: selectedPower === "attack" ? "#999" : "#333",
                color: "white",
                border: "3px solid #000",
              }}
            >
              Attack
            </Power>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            margin: "10px",
          }}
        >
          <div style={{ marginRight: "20px", minWidth: "450px" }}>
            <div
              style={{
                fontSize: "1.2em",
                background: "#345",
                color: "white",
                padding: "5px",
              }}
            >
              History
            </div>
            <div
              ref={actionsRef}
              style={{
                background: "#eee",
                height: "200px",
                overflowY: "scroll",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {actionsEffects.map((action, index) => (
                <div key={index} style={{}}>
                  <ActionEffectFrag
                    action={action}
                    state={state}
                  ></ActionEffectFrag>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              flex: "1 100 auto",
              background: "#eee",
              minWidth: "450px",
            }}
          >
            <div
              style={{
                fontSize: "1.2em",
                background: "#345",
                color: "white",
                padding: "5px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              Possible actions
            </div>
            {possibleActions.map((action, index) => (
              <div key={index}>{JSON.stringify(action)}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HoriChar({ name, avatar }) {
  return (
    <div
      style={{
        fontWeight: "500",
        width: "100px",
        flex: "none",
        display: "flex",
        alignItems: "center",
        background: "#ccc",
        color: "black",
        height: "30px",
      }}
    >
      <img style={{ width: "30px", marginRight: "5px" }} src={avatar}></img>
      <div>{name}</div>
    </div>
  );
}

function CharEffect({ effect, state }) {
  let char = useMemo(() => {
    return state.chars.find((e) => e.id === effect.charId);
  });

  let simpleE = useMemo(() => {
    let a = _.cloneDeep(effect);
    delete a.computedAt;
    delete a.charId;
    delete a.type;
    return a;
  }, [effect]);

  return (
    <div
      style={{
        margin: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <div style={{ marginRight: "40px" }}></div>
      <HoriChar name={char.name} avatar={char.avatar}></HoriChar>
      <div
        style={{
          fontWeight: "500",
          width: "150px",
          padding: "4px",
          height: "30px",
          boxSizing: "border-box",
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "#666",
          color: "white",
        }}
      >
        {effect.type}
      </div>
      <div style={{ fontSize: "0.8em", fontWeight: "bold", padding: "2px" }}>
        {JSON.stringify(simpleE)}
      </div>
    </div>
  );
}

function ActionEffectFrag({ action, state }) {
  if (!action.isAction)
    return <CharEffect effect={action} state={state}></CharEffect>;

  return (
    <div
      style={{
        margin: "2px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <HoriChar name={action.char.name} avatar={action.char.avatar}></HoriChar>
      <div
        style={{
          fontWeight: "500",
          width: "150px",
          padding: "4px",
          height: "30px",
          boxSizing: "border-box",
          flex: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background: "#666",
          color: "white",
        }}
      >
        {action.type}
      </div>

      {swi(
        [
          action.type === "move",
          () => (
            <div
              style={{ fontSize: "0.8em", fontWeight: "bold", padding: "2px" }}
            >
              x:{action.x} / y:{action.y}
            </div>
          ),
        ],
        [
          action.type === "attack",
          () => {
            let t = state.chars.find((e) => e.id === action.target);
            return (
              <>
                <HoriChar name={t.name} avatar={t.avatar}></HoriChar>{" "}
                <div
                  style={{
                    fontSize: "0.8em",
                    fontWeight: "bold",
                    padding: "2px",
                  }}
                ></div>
              </>
            );
          },
        ],
        [action.type === "pass", () => <div></div>]
      )}
    </div>
  );
}

function DisplayChar({
  char,
  charHover,
  currentChar,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  let { id, hp, avatar } = char;

  let charRef = useRef(char);
  useEffect(() => {
    charRef.current = char;
  }, [char]);

  let [position, setPosition] = useState({ x: char.x, y: char.y });

  useAnimationFrame(() => {
    let current = charRef.current;
    if (!current.anim) {
      setPosition(current);
    } else {
      let elapsed = performance.now() - current.anim.startTime;
      let max = 500;
      let lambda = Math.min(1, Math.max(0, elapsed / max));

      if (current.anim.type === EFFECT_TYPES.ANIM_MOVE) {
        setPosition({
          x: current.anim.from.x * (1 - lambda) + current.anim.to.x * lambda,
          y: current.anim.from.y * (1 - lambda) + current.anim.to.y * lambda,
        });
      } else if (current.anim.type === EFFECT_TYPES.ANIM_ATTACK) {
        let dd = smoothstep(0, 0.5, lambda) * smoothstep(1.0, 0.5, lambda);

        setPosition({
          x: current.x * (1 - dd) + (current.x + current.anim.d.x * 0.5) * dd,
          y: current.y * (1 - dd) + (current.y + current.anim.d.y * 0.5) * dd,
        });
      }
      if (lambda === 1) {
        current.anim = null;
      }
    }
  });

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        position: "absolute",
        left: (0.15 + position.x) * TILE_WIDTH + "px",
        top: (0.15 + position.y) * TILE_WIDTH + "px",
        color: "#eee",
        fontWeight: 500,
        background: charHover === id ? "#fff" : "#0000",
        width: TILE_WIDTH * 0.7 + "px",
        height: TILE_WIDTH * 0.7 + "px",

        boxShadow:
          currentChar.id === id
            ? "0px 0px 20px blue,0px 0px 5px #0009"
            : "0px 0px 20px #0009",
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        // transition: "300ms",
      }}
    >
      {" "}
      <img style={{ width: "30px" }} src={avatar}></img>
      <div
        style={{
          background: "#111",
          padding: "2px 1px 2px 2px",
          display: "flex",
        }}
      >
        {[...Array(DEFAULT_HP).keys()].map((i) => (
          <div
            key={i}
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "1px",
              margin: "0px 1px 0px 0px",
              transition: "300ms",
              background: swi(
                [hp === 0, "#000"],
                [i + 1 <= hp, "green"],
                "#e00"
              ),
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}
