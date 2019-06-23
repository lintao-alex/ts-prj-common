/**
 * Created by lintao_alex on 2017/8/10.
 */
namespace Dream.common {
    export class ArrayUtils {
        static removeRepeatElement(list: any[]) {
            let dict = new Map<any, any>();
            for (let i = 0, len = list.length; i < len; ++i) {
                let listElement = list[i];
                dict[listElement] = listElement;
            }
            list.length = 0;
            this.fromMap(dict, list);
        }

        static isEmpty(list: any[]) {
            return !list[0];
        }

        //IE未实现 Array.from()
        static fromMap<K, V>(org: Map<K, V>, out?: V[]) {
            if (!out) out = [];
            org.forEach(v => out.push(v));
            return out;
        }

        static fromMapKey<K, V>(org: Map<K, V>, out?: K[]) {
            if (!out) out = [];
            org.forEach((value, key) => {
                out.push(key);
            });
            return out;
        }

        /**
         * 按keyList里指定的属性名排序，优先级递减
         * 每个key默认按从小到大排，若以'^'开头，刚从大到小排
         */
        static sort(target: any, ...keyList: string[]) {
            target.sort((a: any, b: any): number => {
                let keyIndex: number = 0;
                let keyLen: number = keyList.length;
                while (keyIndex < keyLen) {
                    var out = this.oneKeySort(a, b, keyList[keyIndex++]);
                    if (out != 0) break;
                }
                return out;
            })
        }

        private static oneKeySort(a: any, b: any, key: string): number {
            let isReverse: boolean = false;
            if (key.indexOf('^') == 0) {
                isReverse = true;
                key = key.slice(1);
            }
            let out = 0;
            if (key.indexOf('.') > 0) {
                let keyList = key.split('.');
                out = ObjectUtils.getValueByKeyList(a, keyList) - ObjectUtils.getValueByKeyList(b, keyList);
            } else {
                out = a[key] - b[key];
            }
            if (isReverse) out = -out;
            return out
        }

        /**
         * @returns {boolean} 是否成功移除
         */
        public static remove<T>(target: Array<T>, element: T): boolean {
            let index: number = target.indexOf(element);
            if (index < 0) {
                return false;
            } else {
                target.splice(index, 1);
                return true;
            }
        }

        public static uniquePush(target: any, element: any): boolean {
            if (target.indexOf(element) < 0) {
                target.push(element);
                return true;
            }
            return false;
        }

        /**
         * 将source里的元素按序推入target中
         */
        public static concat(target: any[], source: any[]) {
            target.push.apply(target, source);
        }

        public static uniqueConcat(target: any, source: any) {
            let sourceLen: number = source.length;
            for (let i = 0; i < sourceLen; ++i) {
                this.uniquePush(target, source[i]);
            }
        }

        public static getListFromMap<K, V>(map: Map<K, V>, ...KVList: ISpecifyKV[]): V[] {
            let out: V[] = [];
            map.forEach((element) => {
                if (this.checkElementKv(element, KVList)) {
                    out.push(element);
                }
            });
            return out;
        }

        /***
         * 从目标map中取得一个满足指定键值对的元素
         * @param map
         * @param KVList 按[key:string, value:any]轮序指定多个条件
         */
        public static getFromMap<K, V>(map: Map<K, V>, ...KVList: ISpecifyKV[]): V {
            let out: V;
            map.forEach((element) => {
                if (!out && this.checkElementKv(element, KVList)) {
                    out = element;
                }
            });
            return out;
        }

        private static checkElementKv(element: any, KVList: ISpecifyKV[]): boolean {
            if (!element) return false;
            for (let i = 0, len = KVList.length; i < len; ++i) {
                let kvItem = KVList[i];
                let key = kvItem[0];
                if (key.indexOf('.') < 0) {
                    if (element[key] != kvItem[1]) return false
                } else {
                    if (!this.checkElementMultiKv(element, key, kvItem[1])) return false
                }
            }
            return true;
        }

        private static checkElementMultiKv(element: any, keys: string, value: any) {
            let eValue = ObjectUtils.getValueByPointKey(element, keys);
            return eValue == value;
        }

        static find<T>(target: Array<T>, check: (data: T) => boolean, thisObj?: any): T {
            for (let i = target.length - 1; i >= 0; --i) {
                let data = target[i];
                if (check.call(thisObj, data)) return data;
            }
            return null;
        }

        static search<T>(target: Array<T>, ...KVList: ISpecifyKV[]): T {
            for (let i = target.length - 1; i >= 0; i--) {
                let element = target[i];
                if (this.checkElementKv(element, KVList)) {
                    return element;
                }
            }
            return null;
        }

        static getElementIndex(target: Array<any>, ...KVList: ISpecifyKV[]): number {
            for (let i = target.length - 1; i >= 0; i--) {
                if (this.checkElementKv(target[i], KVList)) {
                    return i;
                }
            }
            return -1;
        }

        static getRandomElement<T>(list: Array<T>): T {
            let listLen = list.length;
            if (listLen == 0) {
                return null;
            }
            let index = Math.floor(Math.random() * listLen);
            return list[index];
        }

        static removeEmptyElement<T>(list: Array<T>) {
            let len = list.length;
            let insertIdx = 0;
            for (let i = 0; i < len; ++i) {
                let ele = list[i];
                if (ele) {
                    list[insertIdx] = ele;
                    ++insertIdx;
                }
            }
            list.length = insertIdx;
        }

        /**
         * 将两个数组中的元素按指定的Key对应起来
         * @param listA
         * @param keyA 支持.
         * @param listB
         * @param keyB 支持.
         * @param doMap
         * @param thisObj
         */
        static mapTwoList<A, B>(listA: A[], keyA: string, listB: B[], keyB: string, doMap: (a: A, b: B) => void, thisObj?: any) {
            let map = new Map<any, A>();
            let getKeyAFuc: { (obj: A): any };
            if (keyA.indexOf('.') < 0) {
                getKeyAFuc = (obj: A) => obj[keyA];
            } else {
                let keys = keyA.split('.');
                let fuc = ObjectUtils.getValueByKeyList;
                getKeyAFuc = (obj: A) => fuc(obj, keys);
            }
            for (let i = listA.length - 1; i >= 0; --i) {
                let a = listA[i];
                map.set(getKeyAFuc(a), a);
            }

            let getKeyBFuc: { (obj: B): any };
            if (keyB.indexOf('.') < 0) {
                getKeyBFuc = (obj: B) => obj[keyB];
            } else {
                let keys = keyB.split('.');
                let fuc = ObjectUtils.getValueByKeyList;
                getKeyBFuc = (obj: B) => fuc(obj, keys);
            }
            for (let i = listB.length - 1; i >= 0; --i) {
                let b = listB[i];
                let a = map.get(getKeyBFuc(b));
                if (a) doMap.call(thisObj, a, b);
            }
        }
    }
}