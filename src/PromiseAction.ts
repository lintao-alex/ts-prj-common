/**
 * Created by lintao_alex on 2019/4/14.
 */
namespace Dream.common{
    export abstract class PromiseAction<T>{
        protected resolve: (value?:T|PromiseLike<T>)=>void;
        protected reject: (reason?:any)=>void;

        protected abstract onStart();

        private start(resolve:(value?:T|PromiseLike<T>) => void,reject:(reason?:any) => void){
            this.resolve = resolve;
            this.reject = reject;
            this.onStart();
        }
        getPromise(): Promise<T>{
            return new Promise(this.start.bind(this))
        }
    }
}