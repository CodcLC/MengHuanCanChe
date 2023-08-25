namespace ClientCore {
export class CWSConnector{
    static connect(url: string): Promise<Share.ISendReceiveLinker>{
        let ws;
        try{
            ws = new WebSocket(url);
        }
        catch(e){
            return Promise.reject<Share.ISendReceiveLinker>(e);
        }
        ws.binaryType = "arraybuffer";
        let pr = Share.CPromiseHelper.createPromise<Share.ISendReceiveLinker>();
        ws.onopen = ()=>{
            pr.callback(null, new CWSSendReceiver(ws, url));
            ws.onerror = null;
        }
        ws.onerror = (event)=>{
            pr.callback(event.data);
        };
        return pr.promise;
    }
}
}