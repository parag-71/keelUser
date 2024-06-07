import { Component, Inject } from '@angular/core';
import { DashboradService } from '../../dashborad-service/dashborad.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Global from '../../../../../environments/environment'
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import { Util } from 'src/app/core/resource/utils';
@Component({
  selector: 'app-preview-dashboard-user',
  templateUrl: './preview-dashboard-user.component.html',
  styleUrls: ['./preview-dashboard-user.component.scss']
})
export class PreviewDashboardUserComponent {
  baseUrl = Global.environment.BASE_URL
  utilObj = new Util();
  constructor(
    public dashboradService:DashboradService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PreviewDashboardUserComponent>,
    public commonService:CommonService
  ) { }
  ngOnInit() {
    if(this.data.site == ''){
      this.dashboradService.allUserSiteList$.subscribe(()=>{
        //User this logic for resource module user preivew because get from another api 
        const modifiedArray = JSON.parse(JSON.stringify(this.dashboradService.allSiteData).slice(1, -1));
        let index = this.utilObj.getIndexOfArrayData(this.dashboradService.allSiteData[0].userData,'assignId',this.data.user?.usrId)
        this.data.site = modifiedArray 
        this.data.user = index != -1 ? this.dashboradService.allSiteData[0].userData[index] : ''
      })
    }
    this.dashboradService.getUserDetails(this.data.user.assignId ? this.data.user.assignId :this.data.user.usrId ? this.data.user.usrId : '')
    this.dashboradService.siteNameList()
  }
  assginUser(siteData:any){
      if((this.data.site.usrId == this.commonService.loginUserDetail.usrId || this.data.user.assignId == this.data.site.usrId) && this.commonService.loginUserDetail.usrType == 2 && this.data.user.suStatus != 3){
        Swal.fire({
          icon: 'warning',
          text: `Do you want to move ${this.data.user.usrFirstname} to ${siteData.siteName} site`,
          width: '27rem',
          confirmButtonText: 'Yes',
          confirmButtonColor: 'rgb(223,129,62)',
          cancelButtonText: 'No',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
              this.dashboradService.assignUserInSite(siteData.siteId,siteData.usrId,this.data.assignId ? this.data.assignId : this.data.user && this.data.user.assignId ,this.data.site.siteId)
              this.dialogRef.close('success')
          }
        });
      }else{
        this.commonService.Alert('Sorry, only site leaders are authorized to assign users from one site to another.','error')
      }
  }
  closeDialog(){
    this.dialogRef.close()
  }
}
