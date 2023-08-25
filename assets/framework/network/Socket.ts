import { MessageHandler } from "./MessageHandler";
import {SocketTag} from "./MessageType"
import { Message } from "./Message";
/**
* name 
*/

export class Socket{
	private _config: any = null;
	private _webSocket: WebSocket;
	private _messageHandler: MessageHandler;
	private _reconnetTimes:number = 800;
	private _defaultTimeout: number = 10000;
	retryTimer:number = 0;
	public constructor(conf) {
		this.initSocket(conf);
	}


	get isClosed(){
		return this._webSocket.readyState != WebSocket.OPEN
	}


	private initSocket(conf:any){
		this._config = conf;
		if(!this._config.timeout) this._config.timeout = this._defaultTimeout;
		if(this._config.retime) this._reconnetTimes = this._config.retime;
		this.connect()
	}

	private connect(){
		let addr = this._config.host;
		if(this._config.port)
		{
			addr = this._config.host +":" +this._config.port
		}
		cc.log("start connect server>>>>" , addr);
		this._webSocket = new WebSocket(addr);
		this._messageHandler = new MessageHandler(this._webSocket);
		// this._webSocket.endian = Laya.Byte.BIG_ENDIAN;
		// if(this._config.timeout)this._webSocket.timeout=this._config.timeout;
		
		this._webSocket.onopen = (event)=>this.onSocketOpen();
		this._webSocket.onmessage = (event)=>this.onReceiveMessage(event);
		this._webSocket.onclose = (event)=>this.onSocketClose();
		this._webSocket.onerror = (event)=>this.onSocketError();

	}

	public close(){
		if(this._webSocket){
			// this._webSocket.offAll(null);
			this._webSocket.close();
		}
	}

	public flush(){
		// if(this._webSocket.connected){
			// this._webSocket.flush();
		// }
	}

	public enableHeartbeat(enable) {
		this._messageHandler.enableHeartbeat = enable;
	}

	private onSocketOpen(): void{
		cc.log("connect " + this._config.host +" success");
		this._messageHandler.dispatch(SocketTag.KSOCKET_OPEN, "");
	}

	private onReceiveMessage(event: any = null): void{
		cc.log("websocket receive message:" + event.data);
		if (typeof(wx) == "undefined")
		{
			this.toArrayBuffer(event.data).then(arrbuf=>{
				this._messageHandler.dispatch(SocketTag.KSOCKET_MESSAGE, arrbuf);
			})
		}else{
			this._messageHandler.dispatch(SocketTag.KSOCKET_MESSAGE, event.data);
		}
	}

	private toArrayBuffer(blob):Promise<ArrayBuffer>
	{
		//将Blob 对象转换成 ArrayBuffer
		var arrayBuffer;
		var reader = new FileReader();
		reader.readAsArrayBuffer(blob);
		return new Promise((resolve,reject)=>{
			reader.onload = function (e) {
				arrayBuffer = reader.result;
				resolve(arrayBuffer);
			}
		})
	}

	
	public sendMessage(msg: Message): boolean{
		if( this._webSocket.readyState == WebSocket.OPEN ){
			this._messageHandler.sendMessage(msg);
			return true;
		}
		return false;
	}

	public sendCustomMessage(msg: Message) {
		this._messageHandler.dispatchMessage(msg);
	}

	private reconnect(){
		// cc.director.getScheduler().unscheduleAllForTarget(this);
		cc.log(" reconnect !!!",this._webSocket.readyState)
		if(this._webSocket.readyState == WebSocket.CONNECTING || this._webSocket.readyState == WebSocket.CLOSING)
		{
			//retry later 
			return;
		}
		if(this._webSocket.readyState == WebSocket.OPEN)
		{
			cc.log("connected!!!")
			clearTimeout(this.retryTimer);
		}else{
			if(this._webSocket.readyState == WebSocket.CLOSED)
			{
				this.connect();
			}
			this.retryTimer = setTimeout(()=>{
				this.reconnect();
			},this._reconnetTimes)
		}
	}

	public onSocketClose(e: any = null){
		this._messageHandler.dispatch(SocketTag.KSOCKET_CLOSE, "");
		cc.log("websocket connect close." ,this._webSocket.readyState);
		this.reconnect();
	}

	public onSocketError(e: any = null){
		this._messageHandler.dispatch(SocketTag.KSOCKET_ERROR, "");
		cc.log("websocket io error.");
		this.close();
		this.connect();
	}
}