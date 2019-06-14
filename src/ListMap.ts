/**
 * Created by lintao_alex on 2019/4/6.
 * 以数组方式实现的字典功能
 * 占用内存小，遍历迅速
 * 随机查找较慢
 */
namespace Dream.common {
    export class ListMap<K, V> {
        private readonly _keyList: K[] = [];
        private readonly _valueList: V[] = [];

        get(key: K) {
            let keyList = this._keyList;
            let idx = keyList.indexOf(key);
            if (idx < 0) return undefined;
            return this._valueList[idx];
        }

        has(key: K) {
            return this._keyList.indexOf(key) >= 0;
        }

        set(key: K, value: V) {
            let keyList = this._keyList;
            let idx = keyList.indexOf(key);
            if (idx < 0) idx = keyList.length;
            keyList[idx] = key;
            this._valueList[idx] = value;
        }

        delete(key: K) {
            let keyList = this._keyList;
            let idx = keyList.indexOf(key);
            if (idx >= 0) {
                keyList.splice(idx, 1);
                this._valueList.splice(idx, 1);
            }
        }

        clear() {
            this._keyList.length = 0;
            this._valueList.length = 0;
        }

        forEach(callback: (value: V, key: K, map: ListMap<K, V>) => void, callObj?: any) {
            let keyList = this._keyList;
            for (let i = 0, len = keyList.length; i < len; i++) {
                callback.call(callObj, this._valueList[i], keyList[i], this);
            }
        }

        /**
         * @param {(value: V, key: K, map: Dream.common.ListMap<K, V>) => boolean} callback break on return true
         * @param callObj
         */
        forEachBreak(callback: (value: V, key: K, map: ListMap<K, V>) => boolean, callObj?: any) {
            let keyList = this._keyList;
            for (let i = 0, len = keyList.length; i < len; i++) {
                if (callback.call(callObj, this._valueList[i], keyList[i], this)) break;
            }
        }

        get size() {
            return this._keyList.length;
        }

        get keys() {
            return this._keyList.concat();
        }

        get values() {
            return this._valueList.concat();
        }
    }
}