import {Injectable}              from "@angular/core";
import {Subject}                 from "rxjs/Subject";

import {WebSocketService}        from "../websocket.service";
import {AglContextService} from "./aglContext.service";

@Injectable()
export class AglIdentityService {

    public logoutResponse: Subject<Object> = new Subject();
    public loginResponse: Subject<Object> = new Subject();

    constructor(private webSocketService: WebSocketService, private aglContextService: AglContextService) {
        this.webSocketService.init(aglContextService);

        this.webSocketService.message.subscribe((response: any) => {
            switch (response.type) {
                case "logged-in":
                    this.loginResponse.next(response.data);
                    break;
                case "logged-out":
                    // // @todo agl-identity/logout
                    this.logoutResponse.next(response.data);
                    break;
                default:
                    break;
            }

            if(response.request && response.request.status && response.request.status === "success") {
                this.getLoggedInUser();
            }
        });
    }

    public login(name, language) {
        this.webSocketService.sendMessage(
            JSON.stringify({
                api: 'agl-identity-agent/login',
                accountId: 1
            })
        );
    }

    public logout() {
        this.webSocketService.sendMessage(JSON.stringify({
            api: "agl-identity-agent/logout",
            accountId: 1
        }))
    }

    public subscribe() {
        this.webSocketService.sendMessage(JSON.stringify({
            api: "agl-identity-agent/subscribe"
        }));
    }

    private getLoggedInUser() {
        this.webSocketService.sendMessage(JSON.stringify({
            api: "agl-identity-agent/get"
        }));
    }
}