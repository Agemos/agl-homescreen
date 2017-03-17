import {Injectable} from "@angular/core";
import {ContextService} from "../context.service";

@Injectable()
export class AfmContextService extends ContextService {

    get baseUrl(): string {
        let url = this._service.ip;
        if (this._service.afmMainPort)
            url += ':' + this._service.afmMainPort;
        url += this._service.api_url;
        return url;
    }
}