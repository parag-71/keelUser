import { Component, Inject } from '@angular/core';
import { DashboradService } from '../../dashborad-service/dashborad.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Global from '../../../../../environments/environment'
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import { Util } from 'src/app/core/resource/utils';
@Component({
  selector: 'app-preview-dashboard-plant',
  templateUrl: './preview-dashboard-plant.component.html',
  styleUrls: ['./preview-dashboard-plant.component.scss']
})
export class PreviewDashboardPlantComponent {
  baseUrl = Global.environment.BASE_URL
  utilObj = new Util();
  constructor(
    public dashboradService:DashboradService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PreviewDashboardPlantComponent>,
    public commonService:CommonService
  ) { }
  ngOnInit() {
    this.dashboradService.getPlantDetails(this.data.plant.assignId ? this.data.plant.assignId : this.data.plant.pltId ? this.data.plant.pltId : '')
    this.dashboradService.siteNameList()
  }
  // FIX: was checking `commonService.loginUserDetail.usrType == 2` only, which
  // blocked usrType==1 admins even though the dashboard's own drag-and-drop
  // already allows usrType 1 OR 2 unconditionally. Now uses the SAME
  // authorization rule as dashborad.component.ts's drop handlers:
  // admin (usrType 1 or 2) -> always allowed
  // otherwise -> allowed only if you're the leader (usrId) of the SOURCE site
  assginPlant(siteData:any){
      const perm = this.commonService.usrpermission;
      const isAdmin = perm?.usrType == 2 || perm?.usrType == 1;
      const isSourceSiteLeader = this.data.site.usrId == perm?.usrId;
      const hasPendingTransfer = this.data.plant.spStatus == 3 || this.data.plant.spStatus == 1;

      if(!(isAdmin || isSourceSiteLeader)){
        // FIX: this message should ONLY show when the actual reason is a
        // permission failure, not when the resource simply has a pending
        // incoming/outgoing transfer. Previously both cases were merged
        // into one condition and always showed this same misleading text.
        this.commonService.Alert('Sorry, only site leaders are authorized to assign plants from one site to another.','error')
      }else if(hasPendingTransfer){
        this.commonService.Alert('This plant already has a pending transfer request. Please resolve it before reassigning.','error')
      }else{
        Swal.fire({
          icon: 'warning',
          text: `Do you want to move ${this.data.plant.pltTitle} to ${siteData.siteName} site`,
          width: '27rem',
          confirmButtonText: 'Yes',
          confirmButtonColor: 'rgb(223,129,62)',
          cancelButtonText: 'No',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
              this.dashboradService.assignPlantInSite(siteData.siteId,siteData.usrId,this.data.plant.assignId,this.data.site.siteId)
              this.dialogRef.close('success')
          }
        });
      }
  }
  closeDialog(){
    this.dialogRef.close()
  }
}
