import { Component } from '@angular/core';
import { Util } from '../core/resource/utils';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  public utiObj = new Util()
  showLogin = false;
  constructor(public router: Router
    ){
  }
  ngOnInit(){
  this.utiObj.getLoginUser()?.rememberMe ?  this.router.navigate(["/dashboard"])  : ''
  this.showLogin = this.router.url === '/Home'
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    this.showLogin = this.router.url === '/Home';
  });
  }
}
