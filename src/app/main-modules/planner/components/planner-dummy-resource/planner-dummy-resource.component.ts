import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { ResourceService } from 'src/app/main-modules/resources/add-resources-service/resource.service';

@Component({
  selector: 'app-planner-dummy-resource',
  templateUrl: './planner-dummy-resource.component.html',
  styleUrls: ['./planner-dummy-resource.component.scss']
})
export class PlannerDummyResourceComponent {
  resourceForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
     @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PlannerDummyResourceComponent>,
    public resourceService:ResourceService,
    public endUserService:EndUserService,
    public commonService:CommonService
  ) { }
  ngOnInit(): void {
    this.resourceService.roleList ? '' : this.resourceService.getRoleList()
    this.resourceForm = this.fb.group({
      usrFirstname: ['', Validators.required],
      usrLastname: ['', Validators.required],
      roleId: ['', Validators.required],
      usrDescription: [''],
      usrId:[]
    });
    this.getDummyResource()
  }
  getDummyResource(){
    this.endUserService.DummyUserList({}).subscribe((result:any)=>{
      const selectUser = result.data.find((user:any) =>  user.usrId == this.data.Id)
      if (selectUser) {
        this.resourceForm.patchValue({
            usrFirstname: selectUser.usrFirstname || '',
            usrLastname: selectUser.usrLastname || '',
            roleId: selectUser.roleId || '',
            usrDescription: selectUser.usrDescription || '',
            usrId:selectUser.usrId
        });
    }
    })
  }
  deleteDummyResource(){
    this.endUserService.deleteDummyUser({usrId:this.data.Id}).subscribe((result:any)=>{
      if (result.status == 200){
        this.dialogRef.close('success');
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  closeDialog() {
    this.dialogRef.close()
  }
  submitForm(){
    if (this.resourceForm.invalid) {
      this.resourceForm.markAllAsTouched(); // Ensure all fields are checked for validation
      return;
    }
    const formData = this.resourceForm.value
    this.endUserService.addOrUpdateDummyUser(formData).subscribe((result:any)=>{
      if (result.status == 200){
        this.dialogRef.close('success');
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
}
