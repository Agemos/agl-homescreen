import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {Http} from "@angular/http";
import {AfmContextService} from "./afmContext.service";
import {WebSocketService} from "../websocket.service";

@Injectable()
export class AfmMainService {

    public startAppResponse: Subject<Object> = new Subject();
    public detailsResponse: Subject<Object> = new Subject();
    public runnablesResponse: Subject<Object> = new Subject();
    public onesResponse: Subject<Object> = new Subject();

    constructor(private http: Http, private webSocketService: WebSocketService, private afmContextService: AfmContextService) {
        let self = this;
        this.webSocketService.init(afmContextService);

        self.webSocketService.message.subscribe((response: any) => {
            if (response.type) {
                switch (response.type) {
                    case "runnables":
                        // @todo  afm-main/runnables
                        self.runnablesResponse.next(response.data);
                        break;
                    case "start":
                        // @todo afm-main/start
                        self.startAppResponse.next(response.data);
                        break;
                    case "once":
                        // @todo afm-main/once
                        self.onesResponse.next(response.data);
                        break;
                    default:
                        break;
                }
            }

            if(response.response && response.response.state === "running" && response.response.id) {
                self.onesResponse.next(response.response);
            }
        });
    }

    public startApp(app) {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: "afm-main/start",
                id: app.id,
                mode: "local"
            })
        );
    }

    public runAppOnce(app) {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: "afm-main/once",
                id: app.id
            })
        );
    }

    public getRunnables() {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: 'afm-main/runnables',
            })
        );
    }

    public getDetails() {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: 'afm-main/details'
            })
        );
    }
}