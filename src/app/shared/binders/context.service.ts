import {Injectable} from "@angular/core";

import {environment} from "../../../environments/environment";
import {WebSocketService} from "./websocket.service";

@Injectable()
export abstract class ContextService {

    public environment: any;

    private _uuid: string = undefined;
    protected _token: string = undefined;
    private _timeout: number;
    private _pingrate: number;
    private _ws: WebSocketService;
    private _tmoInterval: number = null;
    protected _service: any;

    // number of seconds that token will be refreshed before it will fire
    private _TIMEOUT_LIFEGUARD: number = 1000;

    constructor() {
        this.environment = environment;

        if (environment.session) {
            this._token = environment.session.initial;
            this._timeout = environment.session.timeout * 1000 || 0;
            // TODO: add ping monitor feature
            this._pingrate = environment.session.pingrate || 0;
        }

        this._service = this.environment.service;
        if (!this._service) {
            this._service = {
                ip: 'localhost',
                port: null,
                api_url: '/api'
            };
        }
    };

    abstract get baseUrl();

    get wsBaseUrl(): string {
        return 'ws://' + this.baseUrl
    };

    get httpBaseUrl(): string {
        return 'http://' + this.baseUrl
    };

    public getUrl(proto: string, method?: string): string {
        let url = (proto == 'http') ? this.httpBaseUrl : this.wsBaseUrl;
        if (method)
            url += '/' + method;
        console.dir(this.token);
        if (this.token) {
            url += '?x-afb-token=' + this.token;
            if (this.uuid)
                url += '&x-afb-uuid=' + this.uuid;
        }
        return url;
    }

    get token(): string {
        return this._token;
    }

    set token(val: string) {
        this._token = val;
    }

    get uuid(): string {
        return this._uuid;
    }

    set uuid(val: string) {
        this._uuid = val;
    }

    startRefresh(req, webSocketService?: WebSocketService) {
        let self = this;
        this._ws = webSocketService;

        if (this._timeout <= 0)
            return;
        if (this._tmoInterval)
            return;
        if (!this._ws) {
            console.error('Invalid WebSocketService');
            return;
        }

        if (req && req.token)
            this.token = req.token;
        if (req && req.uuid)
            this.uuid = req.uuid;

        this._ws.message.subscribe((response: any) => {
            if (response.type && response.type == 'New Token' && response.token)
                self.token = response.token;
        });

        this._tmoInterval = setInterval(
            () => this._ws.call("auth/refresh", null),
            Math.max(this._timeout - this._TIMEOUT_LIFEGUARD, this._TIMEOUT_LIFEGUARD)
        );
    }

    stopRefresh() {
        if (this._timeout <= 0)
            return;
        clearInterval(this._tmoInterval);
        this._tmoInterval = null;
        if (this._ws)
            this._ws.message.unsubscribe();
    }
}
