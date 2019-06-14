/**
 * Created by lintao_alex on 2019/4/16.
 */
namespace Dream.common {
    export class ProjectUtils {
        static appendUrlParam(url: string, param: string) {
            let splitMark = url.indexOf('?') > 0 ? '&' : '?';
            return url + splitMark + param;
        }

        static unloadPackage(pkgFullPath: string) {
            let pkgList = pkgFullPath.split('.');
            let parent = window;
            let trgPkg = pkgList.pop();
            for (let i = 0, len = pkgList.length; i < len; i++) {
                let pkg = pkgList[i];
                parent = parent[pkg];
                if (!parent) {
                    console.warn('no such package: ' + pkgFullPath);
                    return;
                }
            }
            delete parent[trgPkg];
        }
    }
}