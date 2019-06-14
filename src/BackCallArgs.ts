/**
 * Created by lintao_alex on 2017/9/22.
 */
namespace Dream.common {
    export class BackCallArgs implements IClear {
        private _callFuc: Function;
        private _callObj: any;
        private _args: any[];

        public reset(callFuc: Function, callObj: any, ...args: any[]) {
            this._callFuc = callFuc;
            this._callObj = callObj;
            this._args = args;
        }

        public invoke() {
            if (this._callFuc) {
                if (this._callObj) {
                    this._callFuc.apply(this._callObj, this._args);
                } else {
                    throw new Error('lose call object')
                }
            }
        }

        public isSame(value: BackCallArgs): boolean {
            return this.sameWith(value._callFuc, value._callObj);
        }

        public sameWith(callFuc: Function, callObj: any): boolean {
            return (this._callObj == callObj) && (this._callFuc == callFuc);
        }

        clear() {
            this._callFuc = null;
            this._callObj = null;
            this._args = null;
        }

        dispose() {
            this.clear();
        }
    }

    export class BackCallArgsList implements IClear {
        private _callList: BackCallArgs[];
        /**记录_callList中只回调一次的*/
        private _onceProxyList: BackCallArgs[];

        private _inInvoke: boolean;
        private _needClear: boolean;
        public checkSame:boolean = false;

        public constructor() {
            this._callList = [];
            this._onceProxyList = [];
            this._inInvoke = false;
            this._needClear = false;
        }


        private pushCall(callFuc: Function, callObj: any, once: boolean, unshift: boolean, ...args): BackCallArgs {
            let list = this._callList;
            for (let i = list.length - 1; i >= 0; i--) {
                if (this.checkSame && list[i].sameWith(callFuc, callObj)) {
                    return;
                }
            }
            let node: BackCallArgs = ObjectPool.getObj(BackCallArgs);
            node.reset(callFuc, callObj, ...args);
            if (unshift) {
                list.unshift(node);
            } else {
                list.push(node);
            }
            if (once) {
                this._onceProxyList.push(node);
            }
            return node;
        }

        public unshiftCall(callFuc: Function, callObj: any, ...args) {
            return this.pushCall(callFuc, callObj, false, true, ...args)
        }

        public addCall(callFuc: Function, callObj: any, ...args) {
            return this.pushCall(callFuc, callObj, false, false, ...args)
        }

        public addCallOnce(callFuc: Function, callObj: any, ...args) {
            return this.pushCall(callFuc, callObj, true, false, ...args)
        }

        public removeCall(callFuc: Function, callObj: any) {
            let list = this._callList;
            for (let i = list.length - 1; i >= 0; i--) {
                let node = list[i];
                if (node.sameWith(callFuc, callObj)) {
                    list.splice(i, 1);
                    ArrayUtils.remove(this._onceProxyList, node);
                    ObjectPool.recycleObj(node);
                    if(this.checkSame) break;
                }
            }
        }

        public invoke() {
            this._inInvoke = true;
            let list = this._callList.concat();
            let onceList = this._onceProxyList[0] ? this._onceProxyList.concat() : undefined;
            for (let i = 0, len = list.length; i < len; i++) {
                let node = list[i];
                node.invoke();
            }
            this._inInvoke = false;
            if (this._needClear) {
                this.clear();
            } else if (onceList) {
                list = this._callList;
                for (let i = onceList.length - 1; i >= 0; i--) {
                    let node = onceList[i];
                    ArrayUtils.remove(list, node);
                    ObjectPool.recycleObj(node);
                }
                this._onceProxyList.length = 0;
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
            this._onceProxyList.length = 0;
            this._needClear = false;
            this._inInvoke = false;
        }

        dispose() {
            this.clear();
        }
    }
}