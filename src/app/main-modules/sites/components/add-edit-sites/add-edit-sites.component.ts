import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddUpdateSiteModal } from 'src/app/core/model/admin-model';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { SiteService } from '../../site-service/site.service';

@Component({
  selector: 'app-add-edit-sites',
  templateUrl: './add-edit-sites.component.html',
  styleUrls: ['./add-edit-sites.component.scss']
})
export class AddEditSitesComponent {
  public addUpdateSiteGrp:any
  public from:any
  public userList:any
  public editSiteData:any
  constructor(
    public dialogRef: MatDialogRef<AddEditSitesComponent>,
    public fb: FormBuilder,
    public commonService:CommonService,
    public endUserService:EndUserService,
    public siteService:SiteService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    ){
      this.getUserNameList()
    }
  ngOnInit(): any {
    this.from = this.data.from
    this.editSiteData = this.data.siteData
    this.addUpdateSiteGrp = this.fb.group({
      siteName:[this.from == 'edit' ? this.editSiteData.siteName : '',[Validators.required,this.commonService.noWhitespace]],
      siteLeader:[{value:this.from == 'edit' ? this.editSiteData.usrId : '',disabled:!(this.commonService.loginUserDetail.usrType == 2 || this.commonService.loginUserDetail.usrType == 1)  && this.from == 'edit'},[Validators.required]]
    })
    this.from == 'edit' && this.editSiteData.siteType == 0 ?  this.addUpdateSiteGrp.controls['siteName'].disable() : ''
  }
  addUpdateSite(value:any){
    let addUpdateSiteModal = new AddUpdateSiteModal()
    this.from == 'edit' ? addUpdateSiteModal.siteId = this.editSiteData.siteId : ''
    this.from == 'edit' && this.editSiteData.usrId != value.siteLeader  ? addUpdateSiteModal.siteLeaderChanged = 1 : addUpdateSiteModal.siteLeaderChanged = 0
    addUpdateSiteModal.siteName = value.siteName
    addUpdateSiteModal.usrId = value.siteLeader ? value.siteLeader : this.editSiteData.usrId
    this.endUserService.addOrUpdateSite(addUpdateSiteModal).subscribe((result:any)=>{
      if (result.status == 200){
        this.dialogRef.close('success');
        this.siteService.pageIndex = 1
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getUserNameList(){
    this.endUserService.userNameList('').subscribe((result:any)=>{
      if (result.status == 200){
        this.userList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  closeDialog(){
    this.dialogRef.close();
  }
  getErrorMessage(type:any) {
		switch (type) {
      case "siteName":
				return this.addUpdateSiteGrp.get('siteName').hasError('required') || this.addUpdateSiteGrp.get('siteName').hasError('whitespace') ?  'Site Name is required' : '';
      case "siteLeader":
				return this.addUpdateSiteGrp.get('siteLeader').hasError('required') ?  'Site Leader is required' : '';
      default:
        return '';
		}
	}
}
