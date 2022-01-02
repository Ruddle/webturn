import React from "react";

function getOrEval(e) {
  return typeof e === "function" ? e() : e;
}
export function swi() {
  for (let i = 0; i < arguments.length - 1; i++) {
    let [condition, arm] = arguments[i];
    if (getOrEval(condition)) {
      return getOrEval(arm);
    }
  }

  let i = arguments.length - 1;
  if (!Array.isArray(arguments[i])) return getOrEval(arguments[i]);
  let [condition, arm] = arguments[i];
  if (getOrEval(condition)) {
    return getOrEval(arm);
  }
}

export const useAnimationFrame = (callback) => {
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const stanRef = React.useRef();
  const previousTimeRef = React.useRef();

  const animate = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    stanRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(
    () => {
      stanRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(stanRef.current);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};

export let clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export let flatstep = (a, b, x) => clamp((x - a) / (b - a), 0, 1);
export let ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
export let smoothstep = (a, b, x) => ease(flatstep(a, b, x));
export let mix = (a, b, m) => a * (1.0 - m) + b * m;

function asleep(delay) {
  return new Promise((r) => setTimeout(r, delay));
}
