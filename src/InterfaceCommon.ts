/**
 * Created by lintao_alex on 2019/2/27
 */
namespace Dream.common {
    export interface IDispose {
        dispose(): void;
    }

    export interface IClear extends IDispose {
        clear(): void;
    }

    export interface IClassIdentify<T> {
        new(...args: any[]): T;
    }

    export interface ISpecifyKV {
        //若需递归，以'.'分隔属性名
        keys: string;
        value: any;
    }

    export interface ICallback {
        callback: Function;
        callObj?: any;
        args?: any[];
    }
}