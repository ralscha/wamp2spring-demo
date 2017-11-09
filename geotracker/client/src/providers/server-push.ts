import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Position} from '../position';
import {Stationary} from '../stationary';

@Injectable()
export class ServerPush {
  private serverURL: string = 'https://382076a0.ngrok.io';

  constructor(private readonly httpClient: HttpClient) {
  }

  pushStationary(stat: Stationary): void {
    this.httpClient.post(`${this.serverURL}/stationary`, stat)
      .subscribe(() => {
      }, error => console.log(error));
  }

  pushPosition(pos: Position): void {
    this.httpClient.post(`${this.serverURL}/pos`, pos)
      .subscribe(() => {
      }, error => this.pushError(error));
  }

  pushError(error: string): void {
    this.httpClient.post(`${this.serverURL}/clienterror`, error, {headers: new HttpHeaders({'Content-Type': 'text/plain'})})
      .subscribe(() => {
      }, error => console.log(error));
  }

  clear(): void {
    this.httpClient.delete(`${this.serverURL}/clear`).subscribe(() => {
    }, error => this.pushError(error));
  }

}
