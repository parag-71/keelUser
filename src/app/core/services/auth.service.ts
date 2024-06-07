import { Injectable } from '@angular/core';
import { LoginModel } from '../model/admin-model';
import { EndUserService } from './end-user.service';
import { Util } from '../resource/utils';
import { Router } from '@angular/router';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  utiObj = new Util();

  constructor(
    public endUserService: EndUserService,
    public router:Router,
    public commonService:CommonService
  ) {  
  }

  login(user:any){
    let loginModal = new LoginModel()
    loginModal.usrEmail = user.mail
    loginModal.usrPassword = user.pass
    this.endUserService.login(loginModal).subscribe((result:any)=>{
      if(result.status == '200'){
        result.data[0]['rememberMe'] = user.rememberMe
        this.utiObj.setLoginUser(result.data[0])
        this.router.navigate(['/dashboard'])
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  logoutUser(){
    this.endUserService.logout('').subscribe((result:any)=>{
      if (result.status == 200){
        localStorage.removeItem('user_details')
        localStorage.removeItem('slectSite')
        this.router.navigate(['/login'])
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
   }
}
