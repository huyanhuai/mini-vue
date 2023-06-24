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

export function trackEffects(dep) {
    // 用 dep 来存放所有的 effect
  
    // TODO
    // 这里是一个优化点
    // 先看看这个依赖是不是已经收集了，
    // 已经收集的话，那么就不需要在收集一次了
    // 可能会影响 code path change 的情况
    if (!dep.has(activEffect)) {
      dep.add(activEffect);
      (activEffect as any).deps.push(dep);
    }
}

export function triggerEffects(dep) {
    // 执行收集到的所有的 effect 的 run 方法
    for (const effect of dep) {
      if (effect.scheduler) {
        // scheduler 可以让用户自己选择调用的时机
        // 这样就可以灵活的控制调用了
        // 在 runtime-core 中，就是使用了 scheduler 实现了在 next ticker 中调用的逻辑
        effect.scheduler();
      } else {
        effect.run();
      }
    }
}
