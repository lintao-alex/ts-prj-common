/**
 * Created by lintao_alex on 2019/6/15
 */
namespace Dream.common {
    export class BackCall<T extends Function> implements IClear {
        private _callFuc: T;
        private _thisObj: any;

        public reset(callFuc: T, thisObj: any) {
            this._callFuc = callFuc;
            this._thisObj = thisObj;
            return this;
        }

        public invoke(...args) {
            if (this._callFuc && this._thisObj) {
                this._callFuc.apply(this._thisObj, args)
            }
        }

        public isSame(value: BackCall<T>): boolean {
            return this.sameWith(value._callFuc, value._thisObj);
        }

        public sameWith(callFuc: T, callObj: any): boolean {
            return (this._thisObj === callObj) && (this._callFuc === callFuc);
        }

        get hasCall(): boolean {
            return this._callFuc !== undefined;
        }

        clear() {
            this._callFuc = undefined;
            this._thisObj = undefined;
        }
    }
}