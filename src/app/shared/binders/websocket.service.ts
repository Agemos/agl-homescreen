import {Injectable} from "@angular/core";
import {Subject, Subscription} from "rxjs/Rx";
import {WebSocketSubject} from "rxjs/observable/dom/WebSocketSubject";
import {environment} from "../../../environments/environment";
import {ContextService} from "./context.service";

@Injectable()
export class WebSocketService {

    private readonly CALL = 2;
    private readonly RETOK = 3;
    private readonly RETERR = 4;
    private readonly EVENT = 5;
    private readonly ws_sub_protos = ["x-afb-ws-json1"];
    private readonly MAX_CONNECTION_RETRY = environment.maxConnectionRetry || 10;

    private ws: WebSocketSubject<Object>;
    private socket: Subscription;
    private baseUrl: string;
    private context: ContextService;
    private reqId = 0;
    private connectRetry = 0;

    public message: Subject<Object> = new Subject();
    public opened: Subject<boolean> = new Subject<boolean>();

    public init(context : any) : void {
        this.baseUrl = context.wsBaseUrl;
        this.context = context;
        this._openWS();
    }

    private _openWS() {
        this.ws = new WebSocketSubject({
            url: this.context.getUrl('ws'),
            protocol: this.ws_sub_protos,
            openObserver: {
                next: () => {
                    this.connectRetry = 0;
                    if (environment.debug)
                        console.debug('WS open');
                },
                error: (err) => console.error('WS open error: ', err)
            }
        });

        this.socket = this.ws.subscribe({
            next: (data: MessageEvent) => this._onReceiveMessage(data),
            error: (err) => this._onError(err),
            complete: () => {
                this.message.next({ type: 'closed' });
            }
        });

        this.call("auth/connect", {});
    }

    public close(): void {
        this.socket.unsubscribe();
        this.ws.complete();
    }

    public sendMessage(message: string): void {
        // Make message format backward compatible
        let msg = JSON.parse(message);
        let method = msg.api;
        delete msg.api;
        let request = msg;
        this.call(method, request);
    }

    public call(method, request): void {
        this.reqId += 1;
        let data = JSON.stringify([this.CALL, this.reqId, method, request]);
        if (environment.debug)
            console.debug('WS SEND: ' + data);
        this.ws.next(data);
    }

    private _onReceiveMessage(data: MessageEvent): void {
        let code, id, ans, req;
        try {
            if (environment.debug)
                console.debug('WS RECV: ' + JSON.stringify(data));
            code = data[0];
            id = data[1];
            ans = data[2];
            req = ans.request
        } catch (err) {
            console.log(err);
        }

        let recvMsg;

        switch (ans.jtype) {
            case 'afb-reply':
                recvMsg = this._decode_afb_reply(ans, req);
                break;
            case 'afb-event':
                recvMsg = ans;
                recvMsg['type'] = 'event';
                break;
            default:
                recvMsg = ans;
        }
        this.message.next(recvMsg);
    }

    private _onError(err) {
        console.log('SEB ', err);
        this.opened.next(false);
        this.message.next({ type: 'closed' });
        this.socket.unsubscribe();

        // FIXME - use notifier instead of alert
        if (this.connectRetry > this.MAX_CONNECTION_RETRY) {
            alert('Websocket connection failure, url=' + this.context.getUrl('ws'));
        } else {
            console.debug('Websocket connection failure, url=' + this.context.getUrl('ws') + '\nRetry ' + this.connectRetry + ' / ' + this.MAX_CONNECTION_RETRY);
            setTimeout(() => this._openWS(), 5000);
            this.connectRetry += 1;
        }
    }

    private _decode_afb_reply(ans, req) {
        let res = ans;

        if (ans.response) {
            if (ans.response.token) {
                if (/New Token/.test(ans.response.token)) {
                    this.context.startRefresh(req, this);
                    this.opened.next(true);
                }
                else if (/Token was refreshed/.test(ans.response.token)) {
                    res = {
                        type: "New Token",
                        token: req.token
                    }
                }
            }
            else if (ans.response.runnables) {
                ans.response.runnables.map((m) => {
                    let shortname = m.id.split('@')[0];
                    switch (shortname) {
                        case 'phone':
                        case 'settings':
                            m.authRequired = true;
                            m.name = shortname;
                            break;
                        case 'mediaplayer':
                            m.name = 'multimedia';
                            break;
                        case 'pio':
                            m.authRequired = true;
                            m.name = 'point';
                            break;
                        case 'radio':
                            m.name = 'radio';
                            m.id = 'radio';
                            break;
                        default:
                            m.name = shortname;
                            break;
                    }

                });
                res = {
                    type: "runnables",
                    data: { apps: ans.response.runnables }
                };
            } else if (ans.response.start) {
                res = {
                    type: "start",
                    data: {
                        app: ans.response.app
                    }
                };
            }
        }

        return res;
    }
}