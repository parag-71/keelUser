import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlantResourceService } from '../../plant-resource-service/plant-resource.service';
import * as Global from '../../../../../environments/environment'
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';

@Component({
  selector: 'app-preview-plant-resources',
  templateUrl: './preview-plant-resources.component.html',
  styleUrls: ['./preview-plant-resources.component.scss']
})
export class PreviewPlantResourcesComponent {
  baseUrl = Global.environment.BASE_URL
  public plantDetails:any
  public preSelectedTabIndex:any = 0
  constructor(
    public dialogRef: MatDialogRef<PreviewPlantResourcesComponent>,
    @Inject(MAT_DIALOG_DATA) public plantData: any,
    public plantResourceService:PlantResourceService,
    public commonService:CommonService,
    public endUserService:EndUserService
    ){
      this.getPlantDetails()
    }

  getPlantDetails(){
    this.endUserService.plantDetails({pltId:this.plantData.pltId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.plantDetails = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  edit(){
    this.plantResourceService.editPlantSubject.next(this.plantDetails);
    this.dialogRef.close()
  }

  closeDialog(){
    this.dialogRef.close();
  }
}
