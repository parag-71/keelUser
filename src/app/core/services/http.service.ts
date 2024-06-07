import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, finalize, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  public loading = new BehaviorSubject<any>({
    loading: false,
  });

  constructor(private http: HttpClient,
    public router:Router) {}

  get(url: any): Observable<any> {
    return this.http.get<any>(url);
  }

  /**
   * Performs a request with `post` http method.
   * @param url
   * @param body
   * @param options
   * @returns {Observable<>}
   */
  post(url: any, body: any, type?: any): Observable<any> {
    type == undefined ? this.requestInterceptor() : '';
    return this.http.post<any>(url, body)
    .pipe(tap({
      next:(res)=> this.onSubscribeSuccess(res),
      error:(err)=>this.onSubscribeError(err)
    }))
    .pipe(finalize(() => {
      this.onFinally();
    }));
    ;
  }

  public requestInterceptor(): void {
    this.loading.next({ loading: true });
  }

  /**
   * onSubscribeSuccess
   * @param res
   */
  public onSubscribeSuccess(res: any): any {
    setTimeout(() => {
      this.loading.next({
        loading: false,
      });
    }, 5);
  }

  /**
	 * onSubscribeError
	 * @param error
	 */
	public onSubscribeError(error: HttpErrorResponse): any {
    console.error('API error:', error);
    let errorMessage = 'Something went wrong with the API. Please try again later.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `An error occurred: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code ${error.status}, error message is: ${error.message}`;
    }
    setTimeout(() => {
			this.loading.next({
				loading: false
			});
		}, 5);
    return throwError(errorMessage);
		
	}

  /**
	 * onFinally
	 */
	public onFinally(): void {
		this.requestInterceptor();
	}
}
