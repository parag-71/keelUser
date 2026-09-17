import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  constructor() { }
  private loaderSubject = new Subject<boolean>();
  loaderState = this.loaderSubject.asObservable();

  // Tracks how many API calls are currently in flight. The loader stays
  // visible until every one of them finishes, so concurrent requests (like
  // the vacancy planner firing its list + site + role calls together) no
  // longer hide the spinner as soon as the first response comes back.
  private activeRequests = 0;

  show() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loaderSubject.next(true);
    }
  }

  hide() {
    this.activeRequests > 0 ? this.activeRequests-- : '';
    if (this.activeRequests === 0) {
      this.loaderSubject.next(false);
    }
  }
}
