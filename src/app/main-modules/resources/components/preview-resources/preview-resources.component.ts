import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ResourceService } from '../../add-resources-service/resource.service';
import * as Global from '../../../../../environments/environment'
import { CommonService } from 'src/app/core/services/common.service';
@Component({
  selector: 'app-preview-resources',
  templateUrl: './preview-resources.component.html',
  styleUrls: ['./preview-resources.component.scss']
})
export class PreviewResourcesComponent {
  public tabName:any = 'Resource'
  public preSelectedTabIndex:any = 0
  baseUrl = Global.environment.BASE_URL
  constructor(
    public dialogRef: MatDialogRef<PreviewResourcesComponent>,
    @Inject(MAT_DIALOG_DATA) public userData: any,
    public resourceService:ResourceService,
    public commonService:CommonService
    ){
      this.resourceService.userTrainingRecordList(userData.usrId)
      this.resourceService.userLicencesList(userData.usrId)
      this.resourceService.userCompetenciesList(userData.usrId)
    }
    tabChange($event:any){
      this.tabName = $event.tab.textLabel
      this.preSelectedTabIndex == 0 ? this.tabName = 'Resource' : this.tabName = $event.tab.textLabel
    }
    edit(){
      this.resourceService.selectedTabIndex = this.preSelectedTabIndex
      this.resourceService.editResourceSubject.next(this.userData);
      this.dialogRef.close()
    }
    closeDialog(){
    this.dialogRef.close();
    }
}
