/**
 * Created by lintao_alex on 2019/4/6.
 */

namespace Dream.common{
    export class ScriptManager{
        static readonly EVENT_LOAD_START = 'loadstart';
        static readonly EVENT_PROGRESS = 'progress';
        static readonly EVENT_LOADED = 'load';
        static readonly EVENT_ERROR = 'error';

        static readonly STATUS_WAITING = 0;
        static readonly STATUS_LOADING = 1;
        static readonly STATUS_LOADED = 2;
        static readonly STATUS_ABANDON = 3;

        private readonly _scriptMap = new ListMap<string, IScriptInfo>();
        private _maxRetryTimes = 3;
        private _thread = 4;
        private _loadingCount = 0;

        readonly onLoadStart = new BackCallList<(src:string)=>void>();
        readonly onProgress = new BackCallList<(data:IScriptProgressEventData)=>void>();
        readonly onLoaded = new BackCallList<(src:string)=>void>();
        readonly onAbandon = new BackCallList<(src:string)=>void>();

        resetMaxRetryTimes(value:number){
            this._maxRetryTimes = value;
        }
        resetThread(value:number){
            if(value<1) value = 1;
            this._thread = value;
        }

        loadSingleScript(src: string, callback?: Function, callObj?: any, args?: any[]){
            let info = this._scriptMap.get(src);
            if(info){
                if(callback){
                    //超出上限不再处理
                    switch(info.status) {
                        case ScriptManager.STATUS_LOADED:
                            callback.apply(callObj, args);
                            break;
                        case ScriptManager.STATUS_LOADING:
                        case ScriptManager.STATUS_WAITING:
                            this.addCallback(info, callback, callObj, args);
                            break;
                    }
                }
            }else{
                let info: IScriptInfo = {status: 0, retryCount: 0};
                if(callback) info.callbackList = [{callback: callback, callObj: callObj, args: args}];
                this._scriptMap.set(src, info);
                if(this._loadingCount<this._thread){
                    this.doLoadScript(src, info);
                }else{//超出线程上限的先等着
                    info.retryCount = -1;
                }
            }
        }

        loadScriptList(list: string[], callback?: Function, callObj?: any, args?: any[]) {
            let len = list.length;
            if(callback){
                let count = 0;
                let gotOne = ()=>{
                    if(++count==len){
                        callback.apply(callObj, args);
                    }
                };
                for (let i = 0; i < len; i++) {
                    this.loadSingleScript(list[i], gotOne);
                }
            }else{
                for (let i = 0; i < len; i++) {
                    this.loadSingleScript(list[i]);
                }
            }
        }

        loadScriptOneByOne(list: string[], callback?: Function, callObj?: any, args?: any[]) {
            let len = list.length;
            let that = this;
            let loadNext = (idx)=>{
                if(idx>=len){
                    if(callback) callback.apply(callObj, args);
                }else{
                    that.loadSingleScript(list[idx], loadNext, that, [idx+1]);
                }
            };
            loadNext(0)
        }

        private checkWaiting(){
            this._scriptMap.forEachBreak(this.checkEachWaiting, this);
        }
        private checkEachWaiting(info: IScriptInfo, src: string){
            if(info.status == ScriptManager.STATUS_WAITING){
                ++info.retryCount;
                if(info.retryCount>this._maxRetryTimes){
                    info.status = ScriptManager.STATUS_ABANDON;
                    this.onAbandon.invoke(src);
                    return false;
                }else{
                    this.doLoadScript(src, info);
                    return this._loadingCount >= this._thread;
                }
            }
        }

        private doLoadScript(src: string, info: IScriptInfo){
            ++this._loadingCount;
            let scriptElement = document.createElement('script') as HTMLScriptElement;
            scriptElement.async = true;
            scriptElement.type = 'text/javascript';
            scriptElement.src = src;

            let that = this;
            function gotScript(){
                --that._loadingCount;
                scriptElement.parentNode.removeChild(scriptElement);
                scriptElement.removeEventListener(ScriptManager.EVENT_LOADED, gotScript, false);
                scriptElement.removeEventListener(ScriptManager.EVENT_ERROR, loseScript, false);
                scriptElement.removeEventListener(ScriptManager.EVENT_PROGRESS, onProgress, false);
                info.status = ScriptManager.STATUS_LOADED;
                let callList = info.callbackList;
                if(callList){
                    delete info.callbackList;
                    for (let i = 0, len = callList.length; i < len; i++) {
                        let node = callList[i];
                        node.callback.apply(node.callObj, node.args);
                    }
                }
                that.onLoaded.invoke(src);
                that.checkWaiting();
            }
            function loseScript(){
                --that._loadingCount;
                scriptElement.parentNode.removeChild(scriptElement);
                scriptElement.removeEventListener(ScriptManager.EVENT_LOADED, gotScript, false);
                scriptElement.removeEventListener(ScriptManager.EVENT_ERROR, loseScript, false);
                scriptElement.removeEventListener(ScriptManager.EVENT_PROGRESS, onProgress, false);
                info.status = ScriptManager.STATUS_WAITING;
                that.checkWaiting();
            }
            function onProgress(evt: ProgressEvent){
                if(evt.lengthComputable){
                    let data = that.getProgressEventData(src, evt.loaded, evt.total);
                    that.onProgress.invoke(data)
                }
            }

            scriptElement.addEventListener(ScriptManager.EVENT_LOADED, gotScript, false);
            scriptElement.addEventListener(ScriptManager.EVENT_ERROR, loseScript, false);
            scriptElement.addEventListener(ScriptManager.EVENT_PROGRESS, onProgress, false);
            info.status = ScriptManager.STATUS_LOADING;
            document.body.appendChild(scriptElement);
            this.onLoadStart.invoke(src);
        }

        private addCallback(info:IScriptInfo, callback: Function, callObj?: any, args?: any[]){
            let list = info.callbackList;
            if(!list){
                list = [];
                info.callbackList = list;
            }
            list.push({ callback: callback, callObj: callObj, args: args });
        }

        private _progressEventDataPool: IScriptProgressEventData[] = [];
        private getProgressEventData(src: string, loaded: number, total: number){
            let data = this._progressEventDataPool.pop();
            if(!data){
                data = {src:src, loaded:loaded, total:total};
            }else{
                data.src = src;
                data.loaded = loaded;
                data.total = total;
            }
            return data;
        }
        private recycleProgressEventData(data: IScriptProgressEventData){
            let pool = this._progressEventDataPool;
            if(pool.indexOf(data)<0) pool.push(data);
        }

    }

    interface IScriptInfo{
        status: number;
        callbackList?: ICallback[];
        retryCount: number;
    }

    export interface IScriptProgressEventData{
        src: string;
        loaded: number;
        total: number;
    }
}