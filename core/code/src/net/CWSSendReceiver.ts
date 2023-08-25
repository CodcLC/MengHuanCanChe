namespace ClientCore {
    export class CWSSendReceiver implements Share.ISendReceiveLinker {
    private m_onRecv: (data: string | ArrayBuffer) => void;
    private m_onError: (err: Error) => void;
    private m_onClose: () => void;
    private m_strRemoteUrl: string;
    private m_oWebSocket;

    constructor(ws, remoteUrl:string) {
        this.m_oWebSocket = ws;
        this.m_strRemoteUrl = remoteUrl;
        ws.onmessage = (evt) => {
            if (this.m_onRecv)
                this.m_onRecv(evt.data);
        };
        ws.onerror = (evt) => {
            if (this.m_onError)
                this.m_onError(evt.data);
        };
        ws.onclose = (evt) => {
            if (this.m_onClose)
                this.m_onClose();
        };
    }
    isClosed(): boolean {
        return this.m_oWebSocket == null;
    }
    close(): void {
        if (this.isClosed())
            return;
        if (!this.m_oWebSocket)
            return;
        this.m_oWebSocket.close();
        this.m_oWebSocket = null;
    }
    send(data: string | ArrayBuffer): Promise<void> {
        this.m_oWebSocket.send(data);
        return Promise.resolve();
    }
    onRecv(callback: (data: string | ArrayBuffer) => void): void {
        this.m_onRecv = callback;
    }
    onError(callback: (err: Error) => void): void {
        this.m_onError = callback;
    }
    onClose(callback: () => void): void {
        this.m_onClose = callback;
    }
    getRemoteIp(): string {
        return this.m_strRemoteUrl;
    }
}
}