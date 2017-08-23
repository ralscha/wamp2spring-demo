import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Position} from '../position';
import {Stationary} from '../stationary';

@Injectable()
export class ServerPush {
  //private serverURL: string = 'https://geo.rasc.ch';
  private serverURL: string = 'https://5ea8af78.ngrok.io';
  private jsonOptions: RequestOptions;
  private textOptions: RequestOptions;

  constructor(private http: Http) {
    this.jsonOptions = new RequestOptions({headers: new Headers({'Content-Type': 'application/json'})});
    this.textOptions = new RequestOptions({headers: new Headers({'Content-Type': 'text/plain'})});
  }

  pushStationary(stat: Stationary): void {
    this.http.post(this.serverURL + '/stationary', JSON.stringify(stat), this.jsonOptions)
      .subscribe(() => {
      }, error => console.log(error));
  }

  pushPosition(pos: Position): void {
    this.http.post(this.serverURL + '/pos', JSON.stringify(pos), this.jsonOptions)
      .subscribe(() => {
      }, error => console.log(error));
  }

  pushError(error: string): void {
    this.http.post(this.serverURL + '/clienterror', error, this.textOptions)
      .subscribe(() => {
      }, error => console.log(error));
  }

  clear(): void {
    this.http.delete(this.serverURL + '/clear').subscribe(() => {
    }, error => console.log(error));
  }

}
