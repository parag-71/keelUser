import { Component } from '@angular/core';
import { Util } from '../core/resource/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  public utiObj = new Util()
  constructor(public router: Router
    ){
  }
  ngOnInit(){
  this.utiObj.getLoginUser()?.rememberMe ?  this.router.navigate(["/dashboard"])  : ''
  }
}
