import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Util } from '../resource/utils';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  public utiObj = new Util()
  constructor(
		public router: Router,
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    if(this.utiObj.getLoginUser()?.rememberMe){
      return true; 
    }else if(this.utiObj.getLoginUser()?.rememberMe == false && sessionStorage.getItem('rememberMe') == 'session'){
      return true; 
    } else{
      this.router.navigate(["/login"]) 
      return false; 
    }
  }
}
