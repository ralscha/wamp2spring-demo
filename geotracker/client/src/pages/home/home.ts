import {ServerPush} from './../../providers/server-push';
import {LocationTracker} from './../../providers/location-tracker';
import {Component} from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  tracking: boolean;

  constructor(private locationTracker: LocationTracker, private serverPush: ServerPush) {
    this.tracking = false;
  }

  start(): void {
    this.tracking = true;
    this.locationTracker.startTracking();
  }

  stop(): void {
    this.locationTracker.stopTracking();
    this.tracking = false;
  }

  clear(): void {
    this.serverPush.clear();
  }
}
