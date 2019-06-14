namespace Dream.common{
    export class ObjectPool{
        private static SYMBOL_POOL_KEY = 'ObjectPool.SymbolPoolKey'+Math.random();

        public static getObj<T>(objClass:new() => T):T{
            return this.getPool(objClass).getObj()
        }

        public static recycleObj(obj:any){
            if(obj) this.getPool(obj.constructor).recycleObj(obj)
        }

        private static getPool<T>(objClass:new() => T):InnerObjectPool<T>{
            let pool = objClass[this.SYMBOL_POOL_KEY];
            if(!pool){
                pool = new InnerObjectPool(objClass);
                objClass[this.SYMBOL_POOL_KEY] = pool;
            }
            return pool;
        }
    }

    class InnerObjectPool<T>{
        private _objList:T[];

        public constructor(private _objClass:new()=>T){
            this._objList = [];
        }

        public getObj():T{
            let out = this._objList.pop();
            if(!out){
                out = new this._objClass();
            }
            return out;
        }

        public recycleObj(obj:T){
            if(this._objList.indexOf(obj)>=0) return;
            this._objList.push(obj);
            let clearFuc = obj['clear'] as Function;
            if(clearFuc!=null){
                clearFuc.call(obj);
            }
        }
    }
}