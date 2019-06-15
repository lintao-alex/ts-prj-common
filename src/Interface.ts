/**
 * Created by lintao_alex on 2019/2/27
 */
namespace Dream.common {
    //用于定义可回收利用的对象
    export interface IClear {
        clear(): void;
    }

    export interface IDispose {
        dispose(): void;
    }

    export interface IClass<T> {
        new(...args: any[]): T;
    }

    //若需递归，以'.'分隔属性名
    export type ISpecifyKV = [string, any];
}