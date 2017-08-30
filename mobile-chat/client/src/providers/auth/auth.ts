import {Inject, Injectable} from "@angular/core";
import {Http} from "@angular/http";
import "rxjs/add/operator/map";
import {ReplaySubject, Observable} from "rxjs";
import {Storage} from "@ionic/storage";
import {JwtHelper, AuthHttp} from "angular2-jwt";
import {EnvVariables} from "../../env/environment-variables.token";

@Injectable()
export class AuthProvider {

  authUser = new ReplaySubject<any>(1);

  constructor(private readonly http: Http,
              private readonly authHttp: AuthHttp,
              private readonly storage: Storage,
              private readonly jwtHelper: JwtHelper,
              @Inject(EnvVariables) private readonly envVariables) {
  }

  checkLogin() {
    this.storage.get('jwt').then(jwt => {

      if (jwt && !this.jwtHelper.isTokenExpired(jwt)) {
        this.authHttp.get(`${this.envVariables.HTTP_SCHEME}${this.envVariables.SERVER_ADDRESS}/authenticate`)
          .subscribe(() => this.authUser.next(jwt),
            (err) => this.storage.remove('jwt').then(() => this.authUser.next(null)));
        // OR
        // this.authUser.next(jwt);
      }
      else {
        this.storage.remove('jwt').then(() => this.authUser.next(null));
      }
    });
  }

  login(values: any): Observable<any> {
    return this.http.post(`${this.envVariables.HTTP_SCHEME}${this.envVariables.SERVER_ADDRESS}/login`, values)
      .map(response => response.text())
      .map(jwt => this.handleJwtResponse(jwt));
  }

  logout() {
    this.storage.remove('jwt').then(() => this.authUser.next(null));
  }

  signup(values: any): Observable<any> {
    return this.http.post(`${this.envVariables.HTTP_SCHEME}${this.envVariables.SERVER_ADDRESS}/signup`, values)
      .map(response => response.text())
      .map(jwt => {
        if (jwt !== 'EXISTS') {
          return this.handleJwtResponse(jwt);
        }
        else {
          return jwt;
        }
      });
  }

  private handleJwtResponse(jwt: string) {
    return this.storage.set('jwt', jwt)
      .then(() => this.authUser.next(jwt))
      .then(() => jwt);
  }

}
