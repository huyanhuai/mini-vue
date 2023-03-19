import { extend } from "../shared";
class ReactiveEffect{
    private _fn: any;
    deps = [];
    active = true;
    onStop?: () => void;
    constructor(fn, public scheduler?) {
        this._fn = fn;
    }
    run() {
        activEffect = this;
        return this._fn();
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect);
    });
}

const targetMap = new Map();
export function track(target, key) {
    // target > key > dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if(!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }

    if (!activEffect) return;

    dep.add(activEffect);
    activEffect.deps.push(dep);
}

export function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);

    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

let activEffect;
export function effect(fn, options: any = {}) {

    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    // Object.assign(_effect, options);
    // extend
    extend(_effect, options);

    _effect.run();

    const runner: any = _effect.run.bind(_effect);
    runner.effect = _effect;

    return runner;
}

export function stop(runner) {
    runner.effect.stop();
}
