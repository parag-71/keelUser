import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent {
  UpdatePasswordGrp:any
  constructor(
    public dialogRef: MatDialogRef<UpdatePasswordComponent>,
    public fb: FormBuilder,
    public commonService:CommonService,
    public endUserService:EndUserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    ){}
  ngOnInit(): any {
    this.UpdatePasswordGrp = this.fb.group({
      oldPassword:['',[Validators.required,this.commonService.noWhitespace]],
      newPassword:['',[Validators.required,this.commonService.noWhitespace,Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W_]{6,}$/)]],
      confirmNewPassword:['',[Validators.required,this.commonService.noWhitespace]],
    })
    this.UpdatePasswordGrp.get('confirmNewPassword').valueChanges.subscribe(() => {
      const newPassword = this.UpdatePasswordGrp.get('newPassword').value;
      const confirmPassword = this.UpdatePasswordGrp.get('confirmNewPassword').value;
      if (newPassword !== confirmPassword) {
        this.UpdatePasswordGrp.get('confirmNewPassword').setErrors({ mismatch: true });
      } else {
        this.UpdatePasswordGrp.get('confirmNewPassword').setErrors(null);
      }
    });
  }

  addUpdateSite(formData:any){
    let data = {
      oldPassword:formData.oldPassword,
      newPassword:formData.newPassword
    }
    this.endUserService.changeUserPassword(data).subscribe((result:any)=>{
      if (result.status == 200){
        this.dialogRef.close('success');
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getErrorMessage(type:any) {
		switch (type) {
      case "oldPassword":
				return this.UpdatePasswordGrp.get('oldPassword').hasError('required') || this.UpdatePasswordGrp.get('oldPassword').hasError('whitespace') ?  'Current Password is required' : '';
      case "newPassword":
				return this.UpdatePasswordGrp.get('newPassword').hasError('required') || this.UpdatePasswordGrp.get('newPassword').hasError('whitespace') ?  'New Password is required' : this.UpdatePasswordGrp.get('newPassword').hasError('pattern') ? 'Password should be a minimum of 6 characters with combination of letters and numbers.' : '';
      case "confirmNewPassword":
				return this.UpdatePasswordGrp.get('confirmNewPassword').hasError('required') || this.UpdatePasswordGrp.get('confirmNewPassword').hasError('whitespace') ?  'Confirm Password is required' : this.UpdatePasswordGrp.get('confirmNewPassword').hasError('mismatch') ? 'Password is not matched' : '';
      default:
        return '';
		}
	}
  closeDialog(){
    this.dialogRef.close();
  }
}
