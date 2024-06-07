import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Util } from 'src/app/core/resource/utils';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  public resetPasswordGrp:any
  public mail:any
  public userId:any
  public utiObj = new Util()
  constructor(
    public fb: FormBuilder,
    public commonService: CommonService,
    public endUserService:EndUserService,
    public ActivatedRoute: ActivatedRoute,
    public route:Router,
    ){}
  ngOnInit(): any {
    this.ActivatedRoute.params.subscribe(params => {
      const encryptedData = params['data'];
      this.mail = atob(encryptedData).split(':')[3]
      this.userId = atob(encryptedData).split(':')[1]
    });
    this.resetPasswordGrp = this.fb.group({
      mail: [this.mail,[]],
			password: ['',[Validators.required,this.commonService.noWhitespace,Validators.pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/)]],
			cPassword: ['',[Validators.required,this.commonService.noWhitespace]],
		});
    this.resetPasswordGrp.get('cPassword').valueChanges.subscribe(() => {
      const password = this.resetPasswordGrp.get('password').value;
      const confirmPassword = this.resetPasswordGrp.get('cPassword').value;
      if (password !== confirmPassword) {
        this.resetPasswordGrp.get('cPassword').setErrors({ mismatch: true });
      } else {
        this.resetPasswordGrp.get('cPassword').setErrors(null);
      }
    });
  }
  resetPassword(data:any){
      this.endUserService.resetPassword({usrPassword:data.password,usrId:this.userId}).subscribe((result:any)=>{
        if(result.status == '200'){
          result.data[0]['rememberMe'] = false
          this.utiObj.setLoginUser(result.data[0])
        this.route.navigate(['/dashboard'])
        }else{
          this.commonService.ApiErrAlert(result)
        }
      })
  }

  getErrorMessage(type:any) {
    switch (type) {
      case "pass":
        return this.resetPasswordGrp.get('password').hasError('required') || this.resetPasswordGrp.get('password').hasError('whitespace') ?  'Password is required' : this.resetPasswordGrp.get('password').hasError('pattern') ? 'Password should be minimum 6 characters and can be a combination of letters and numbers.' : '';
      case "cPass":
        return this.resetPasswordGrp.get('cPassword').hasError('required') || this.resetPasswordGrp.get('cPassword').hasError('whitespace') ? 'Confirm Password is match' : this.resetPasswordGrp.get('cPassword').hasError('mismatch')  ? 'Password is not matched' : '';
      default:
        return '';
    }
  }
}
