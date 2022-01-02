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
