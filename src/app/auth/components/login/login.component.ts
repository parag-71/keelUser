import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { Util } from 'src/app/core/resource/utils';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginGrp: any;
  utils = new Util()
  constructor(public router: Router,
    public fb: FormBuilder,
    public authService: AuthService,     
    public commonService:CommonService, 
    ){
    
  }
  ngOnInit(): any {
    let userDetail = this.utils.getRememberPassword();
    if (userDetail == null || !userDetail) {
      userDetail = {
        mail: '',
        pass: '',
        rememberMe: false,
        code: '',
      };
    }
    this.loginGrp = this.fb.group({
			mail: [userDetail.mail,[Validators.required,this.commonService.noWhitespace,Validators.email]],
			pass: [userDetail.pass,[Validators.required,this.commonService.noWhitespace,Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{6,}$/)]],
      rememberMe: [userDetail.rememberMe,[]]
		});
    localStorage.removeItem('slectSite')
  }
  userLogin(value:any){
    this.authService.login(value)
  }
  getErrorMessage(type:any) {
		switch (type) {
			case "email":
				return this.loginGrp.get('mail').hasError('required') || this.loginGrp.get('mail').hasError('whitespace') ?  'Email is required' : this.loginGrp.get('mail').hasError('email') ? 'Please Enter Valid Mail' : '';
			case "passWord":
				return this.loginGrp.get('pass').hasError('required') || this.loginGrp.get('pass').hasError('whitespace')  ? 'Password is required' : this.loginGrp.get('pass').hasError('pattern') ? 'Password should be a minimum of 6 characters with combination of letters and numbers.' : '';
			default:
				return '';
		}
	}
}
