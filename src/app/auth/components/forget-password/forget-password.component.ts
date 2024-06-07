import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent {
  public forgetPassword: any;
  constructor(
    public fb: FormBuilder,
    public commonService: CommonService,
    public endUserService:EndUserService
    ){}
  ngOnInit(): any {
    this.forgetPassword = this.fb.group({
			mail: ['',[Validators.required,this.commonService.noWhitespace,Validators.email]],
		});
  }

  forgotPassword(data:any){
    this.endUserService.forgotPassword({usrEmail:data.mail}).subscribe((result:any)=>{
      if(result.status == '200'){
        this.commonService.successAlert(result.message)
        this.forgetPassword.reset();
        Object.keys(this.forgetPassword.controls).forEach(key => {
          this.forgetPassword.get(key).setErrors(null);
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getErrorMessage(type:any) {
    switch (type) {
      case "mail":
        return this.forgetPassword.get('mail').hasError('required') || this.forgetPassword.get('mail').hasError('whitespace') ?  'Email is required' : this.forgetPassword.get('mail').hasError('email') ? 'Please Enter Valid Mail' : '';
      default:
        return '';
    }
  }
}
