/**
 * Created by lintao_alex on 2017/10/13.
 */
namespace Dream.common {
    export class ObjectUtils {
        static readonly undefined = 'undefined';

        static isUndefined(value: any): boolean {
            return typeof(value) === this.undefined;
        }

        static hasOneProperty(obj: any, ...propertyList: string[]) {
            return propertyList.some(name => obj.hasOwnProperty(name));
        }

        static getValueByPointKey(obj: any, keys: string): any | undefined {
            let keyList = keys.split('.');
            return this.getValueByKeyList(obj, keyList)
        }

        static getValueByKeyList(element: any, keyList: string[]): any | undefined {
            for (let i = 0, len = keyList.length; i < len; i++) {
                element = element[keyList[i]];
                if (!element) return undefined;
            }
            return element;
        }

        /**
         * 若to对象某子字段为空，且对应数据的构造函数有必填的参数，本方法会报错
         * @param target
         * @param source
         * @param force 给to加上没有的字段
         * @param clean 清理from上没有而to上有的字段
         */
        static deepCopy(target: any, source: any, force = true, clean = true) {
            let keys = Object.keys(source);
            for (let i = keys.length - 1; i >= 0; i--) {
                let key = keys[i];
                let fValue = source[key];
                if (this.isBaseValue(fValue)) {
                    if (force || target.hasOwnProperty(key)) target[key] = fValue;
                } else {
                    if (target.hasOwnProperty(key)) {
                        this.deepCopy(target[key], fValue)
                    } else if (force) {
                        target[key] = new fValue.constructor();
                        this.deepCopy(target[key], fValue);
                    }
                }
            }
            if (clean) {
                let toKeys = Object.keys(target);
                for (let i = toKeys.length - 1; i >= 0; i--) {
                    let toKey = toKeys[i];
                    if (keys.indexOf(toKey) < 0) {
                        delete target[toKey];
                    }
                }
            }
        }

        static isBaseValue(obj: any) {
            return typeof obj !== 'object';
        }

        static walkObj(obj: any, dealFuc: (value: any, key: string, curObj: any) => void, callObj?: any) {
            let keys = Object.keys(obj);
            for (let i = keys.length - 1; i >= 0; i--) {
                let key = keys[i];
                let value = obj[key];
                if (this.isBaseValue(value)) {
                    dealFuc.call(callObj, value, key, obj);
                } else {
                    this.walkObj(value, dealFuc, callObj);
                }
            }
        }
    }
}