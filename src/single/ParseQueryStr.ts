/**
 * Created by lintao_alex on 2019/4/25
 */
namespace Dream.common {
    export function parseQueryStr(value: string, obj: any){
        let kvList = value.split("&");
        for (let i = 0; i < kvList.length; i++) {
            let kvArr = kvList[i].split("=");
            let key = kvArr[0];
            obj[key] = decodeURIComponent(kvArr[1]);
        }
    }
}