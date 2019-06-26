/**
 * Created by lintao_alex on 2019/6/26
 */
namespace Dream.common {
    export class BackCallList<T extends Function> implements IClear {
        private _callList: BackCall<T>[] = [];

        private _inInvoke = false;
        private _needClear = false;

        get callNum(): number {
            return this._callList.length;
        }

        public addCall(callFuc: T, callObj: any) {
            let list = this._callList;
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i].sameWith(callFuc, callObj)) {
                    return;
                }
            }
            let node: any = ObjectPool.getObj(BackCall);
            node.reset(callFuc, callObj);
            list.push(node);
        }

        public removeCall(callFuc: T, callObj: any) {
            let list = this._callList;
            for (let i = list.length - 1; i >= 0; i--) {
                let node = list[i];
                if (node.sameWith(callFuc, callObj)) {
                    list.splice(i, 1);
                    ObjectPool.recycleObj(node);
                    break;
                }
            }
        }

        public invoke(...args) {
            this._inInvoke = true;
            let list = this._callList.concat();
            for (let i = 0, len = list.length; i < len; i++) {
                let node = list[i];
                node.invoke.apply(node, args);
            }
            this._inInvoke = false;
            if (this._needClear) {
                this.clear();
            }
        }

        clear() {
            this._needClear = true;
            if (this._inInvoke) {
                return;
            }
            let list = this._callList;
            for (let i = list.length - 1; i >= 0; i--) {
                ObjectPool.recycleObj(list[i]);
            }
            list.length = 0;
            this._needClear = false;
            this._inInvoke = false;
        }
    }
}