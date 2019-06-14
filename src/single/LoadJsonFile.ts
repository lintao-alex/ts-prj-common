/**
 * Created by lintao_alex on 2019/4/25
 */
namespace Dream.common {
    export function loadJsonFile(url: string, callback: (content: any) => void, errorCall?: (reason: any) => void, callObj?: any) {
        let errorCnt = 3;
        let xhr:XMLHttpRequest;
        function doRequest(){
            xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.addEventListener('load', gotSrc);
            xhr.addEventListener('error', onError);
            xhr.send();
        }

        function gotSrc() {
            xhr.removeEventListener('load', gotSrc);
            xhr.removeEventListener('error', onError);
            try{
                callback.call(callObj, JSON.parse(xhr.response))
            }catch(e){
                alert('Wrong Json File: ' + url)
            }
        }

        function onError() {
            xhr.removeEventListener('load', gotSrc);
            xhr.removeEventListener('error', onError);
            if(--errorCnt==0){
                errorCall.call(callObj, url)
            }else{
                setTimeout(doRequest,300)
            }
        }

        doRequest();
    }
}