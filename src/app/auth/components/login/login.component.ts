import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  public loginGrp: any;

  constructor(public router: Router,
    public fb: FormBuilder,
    public authService: AuthService,     
    public commonService:CommonService, 
    ){
    
  }
  ngOnInit(): any {
    this.loginGrp = this.fb.group({
			mail: ['',[Validators.required,this.commonService.noWhitespace,Validators.email]],
			pass: ['',[Validators.required,this.commonService.noWhitespace,Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)]],
      rememberMe: [false,[]]
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
				return this.loginGrp.get('pass').hasError('required') || this.loginGrp.get('pass').hasError('whitespace')  ? 'Password is required' : this.loginGrp.get('pass').hasError('pattern') ? 'Password should be minimum 6 characters and can be a combination of letters and numbers.' : '';
			default:
				return '';
		}
	}
}
