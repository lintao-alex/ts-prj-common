/**
 * Created by lintao_alex on 2017/9/21.
 */
namespace Dream.common{
    export class BackCall<T extends Function> implements IClear{
        private _callFuc:T;
        private _callObj:any;

        public reset(callFuc:T, callObj:any){
            this._callFuc = callFuc;
            this._callObj = callObj;
            return this;
        }

        public invoke(...args){
            if(this._callFuc && this._callObj){
                this._callFuc.apply(this._callObj, args)
            }
        }

        public isSame(value:BackCall<T>):boolean{
            return this.sameWith(value._callFuc, value._callObj);
        }

        public sameWith(callFuc:T, callObj:any):boolean{
            return (this._callObj == callObj) && (this._callFuc == callFuc);
        }

        get hasCall():boolean{
            return this._callFuc!=null;
        }

        clear(){
            this._callFuc = null;
            this._callObj = null;
        }
        dispose(){
            this.clear();
        }
    }

    export class BackCallList<T extends Function> implements IClear{
        private _callList:BackCall<T>[];
        /**记录_callList中只回调一次的*/
        private _onceProxyList:BackCall<T>[];

        private _inInvoke:boolean;
        private _needClear:boolean;

        public constructor(){
            this._callList = [];
            this._onceProxyList = [];
            this._inInvoke = false;
            this._needClear = false;
        }

        get callNum():number{
            return this._callList.length;
        }

        public addCall(callFuc:T, callObj:any, once:boolean=false){
            let list = this._callList;
            for(let i = list.length - 1; i >= 0; i--){
                if(list[i].sameWith(callFuc, callObj)){
                    return;
                }
            }
            let node:any = ObjectPool.getObj(BackCall);
            node.reset(callFuc, callObj);
            list.push(node);
            if(once){
                this._onceProxyList.push(node);
            }
        }

        public removeCall(callFuc:T, callObj:any){
            let list = this._callList;
            for(let i = list.length - 1; i >= 0; i--){
                let node = list[i];
                if(node.sameWith(callFuc, callObj)){
                    list.splice(i, 1);
                    ArrayUtils.remove(this._onceProxyList, node);
                    ObjectPool.recycleObj(node);
                    break;
                }
            }
        }

        public invoke(...args){
            this._inInvoke=true;
            let list = this._callList.concat();
            let onceList = this._onceProxyList[0] ? this._onceProxyList.concat() : undefined;
            for(let i=0, len=list.length; i<len; i++){
                let node = list[i];
                node.invoke.apply(node, args);
            }
            this._inInvoke=false;
            if(this._needClear){
                this.clear();
            }else if(onceList){
                list = this._callList;
                for(let i = onceList.length - 1; i >= 0; i--){
                    let node = onceList[i];
                    ArrayUtils.remove(list, node);
                    ObjectPool.recycleObj(node);
                }
                this._onceProxyList.length = 0;
            }
        }

        clear(){
            this._needClear = true;
            if(this._inInvoke){
                return;
            }
            let list = this._callList;
            for(let i = list.length - 1; i >= 0; i--){
                ObjectPool.recycleObj(list[i]);
            }
            list.length=0;
            this._onceProxyList.length=0;
            this._needClear=false;
            this._inInvoke=false;
        }

        dispose(){
            this.clear();
        }
    }
}