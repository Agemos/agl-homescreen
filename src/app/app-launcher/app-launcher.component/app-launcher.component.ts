import {Component, OnInit, OnDestroy} from "@angular/core";
// import {AfmMainService} from "../../shared/afmMain.service";
// import {AglIdentityService} from "../../shared/aglIdentity.service";
import {Runnable} from "../models/runnable.model";
import {AglIdentityService} from "../../shared/binders/agl-binder/aglIdentity.service";
import {AfmMainService} from "../../shared/binders/afm-binder/afmMain.service";

@Component({
    selector: 'app-launcher',
    templateUrl: 'app-launcher.component.html',
    styleUrls: ['app-launcher.component.css']
})
export class AppLauncherComponent implements OnInit, OnDestroy {
    private runnables: Runnable[];
    private account;
    private tmpAccount;
    private hidePopUp: boolean = true;

    private selectedAppIndex: number;

    constructor(private afmMainService: AfmMainService, private aglIdentityService: AglIdentityService) {
    }

    ngOnInit() {
        this.afmMainService.runnablesResponse.subscribe((response: any) => {
            this.runnables = response.apps;
        });

        this.afmMainService.onesResponse.subscribe((response: any) => {
            let app = this.runnables.filter(runnable => runnable.id == response.id)[0];
            app.isRunning = !app.isRunning;
        });

        this.afmMainService.startAppResponse.subscribe((response: any) => {
            let app = this.runnables[this.selectedAppIndex];

            if(response && !app.isRunning) {
                app.isRunning = true;
            } else if(response && app.isRunning) {
                alert('App is already running');
            }
        });

        this.aglIdentityService.loginResponse.subscribe((response: any) => {
            if (this.account) {
                this.tmpAccount = response.account;
                this.hidePopUp = false;
            } else {
                this.getRunnables();
            }
        });

        this.aglIdentityService.logoutResponse.subscribe(data => {
            this.account = null;
        });

        this.getRunnables();
    }


    ngOnDestroy(): void {
    }

    private getRunnables() {
        this.afmMainService.getRunnables();
    }

    runApp(event, app) {
        //temp solution
        this.selectedAppIndex = this.runnables.indexOf(app);

        this.afmMainService.startApp(app);
    }

    runAppOnce(event, app) {
        this.afmMainService.runAppOnce(app);
    }

    confirmLogin() {
        this.account = this.tmpAccount;
        this.hidePopUp = true;
    }

    cancelLogin() {
        this.hidePopUp = true;
    }
}