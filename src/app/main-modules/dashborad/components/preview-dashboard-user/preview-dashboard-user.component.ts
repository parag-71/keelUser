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
  // FIX: same authorization fix as PreviewDashboardPlantComponent.assginPlant() -
  // uses commonService.usrpermission (admin 1/2, or source-site leader) instead
  // of the mismatched commonService.loginUserDetail.usrType == 2-only check.
  assginUser(siteData:any){
      const perm = this.commonService.usrpermission;
      const isAdmin = perm?.usrType == 2 || perm?.usrType == 1;
      const isSourceSiteLeader = this.data.site.usrId == perm?.usrId;
      const hasPendingTransfer = this.data.user.suStatus == 3 || this.data.user.suStatus == 1;

      if(!(isAdmin || isSourceSiteLeader)){
        // FIX: this message should ONLY show when the actual reason is a
        // permission failure, not when the resource simply has a pending
        // incoming/outgoing transfer. Previously both cases were merged
        // into one condition and always showed this same misleading text.
        this.commonService.Alert('Sorry, only site leaders are authorized to assign users from one site to another.','error')
      }else if(hasPendingTransfer){
        this.commonService.Alert('This user already has a pending transfer request. Please resolve it before reassigning.','error')
      }else{
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
      }
  }
  closeDialog(){
    this.dialogRef.close()
  }
}
