import { reactive } from "./reactive";
import { isObject, hasChanged, createDep } from "../shared";
import { trackEffects, triggerEffects } from "./effect";

export class RefImpl {
    private _rawValue: any;
    private _value: any;
    public dep;
    public __v_isRef = true;

    constructor(value) {
        this._rawValue = value;
        // 看看value 是不是一个对象，如果是一个对象的话
        // 那么需要用 reactive 包裹一下
        this._value = convert(value);
        this.dep = createDep()
    }

    get value() {
        // 收集依赖
        trackRefValue(this);
        return this._value
    }

    set value(newValue) {
        // 当新值不等于老值，需要触发依赖
        if (hasChanged(newValue, this._rawValue)) {
            // 更新值
            this._value = convert(newValue);
            this._rawValue = newValue;
            // 触发依赖
            triggerRefValue(this);
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    trackEffects(ref.dep);
}

function triggerRefValue(ref) {
    triggerEffects(ref.dep);
}

export function ref(value) {
    const refImpl = new RefImpl(value);
    return refImpl;
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}

export function isRef(value) {
    return !!value.__v_isRef;
}