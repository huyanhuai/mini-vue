export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && typeof val === "object";
};

export function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue);
}

// 用于存储所有的 effect 对象
export function createDep(effects?) {
    const dep = new Set(effects);
    return dep;
}