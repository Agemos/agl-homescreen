import {Component, OnInit, OnDestroy} from "@angular/core";
import {environment} from "../../../environments/environment";
import {WebSocketHandler} from "../../shared/WebSocketHandler";

@Component({
  selector: 'hvac',
  templateUrl: 'hvac.component.html',
  styleUrls: ['hvac.component.css']
})
export class HvacComponent implements OnInit, OnDestroy, WebSocketHandler {
  private url: string = environment.service.api;
  private socket;
  private leftFront: number = 0;
  private leftRear: number = 0;
  private rightFront: number = 0;
  private rightRear: number = 0;
  private speed: number = 0;
  private mileage: number = 0;

  constructor() {
  }

  //@todo Add listeners to listen api-methods and implement your logic here
  ngOnInit() {
    // this.socket = new WebSocket(this.url);
    // this.socket.onopen = this.onWSOpen.bind(this);
    // this.socket.onclose = this.onWSClose.bind(this);
    // this.socket.onmessage = this.onWSMessageReceive.bind(this);
  }

  ngOnDestroy(){
    // this.socket.send(JSON.stringify({
    //   api: 'hvac/off'
    // }));
    // this.socket.close();
  }

  onWSOpen(): void {
    console.log("HVAC websocket is open");
    this.socket.send(JSON.stringify({
      api: 'hvac/on'
    }));
  }

  onWSClose(): void {
    console.log("HVAC websocket is closed");
  }

  onWSMessageReceive(res): void {
    let response = JSON.parse(res.data);

    switch (response.type) {
      case "speed-change":
        this.speed = response.value;
        break;
      case "mileage-change":
        this.mileage = response.value;
        break;
      case "left-front-change":
        this.leftFront = response.value;
        break;
      case "left-rear-change":
        this.leftRear = response.value;
        break;
      case "right-front-change":
        this.rightFront = response.value;
        break;
      case "right-rear-change":
        this.rightRear = response.value;
        break;
      default:
        throw new Error("Unknown response type");
    }
  }
}