import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditPlantResourcesComponent } from '../add-edit-plant-resources/add-edit-plant-resources.component';
import { PlantResourceService } from '../../plant-resource-service/plant-resource.service';
import Swal from 'sweetalert2';
import * as Global from '../../../../../environments/environment'
import { Util } from 'src/app/core/resource/utils';
import { PreviewPlantResourcesComponent } from '../preview-plant-resources/preview-plant-resources.component';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-plant-resources',
  templateUrl: './plant-resources.component.html',
  styleUrls: ['./plant-resources.component.scss']
})
export class PlantResourcesComponent {
  public baseUrl = Global.environment.BASE_URL
  utilObj = new Util();
  public userDetails = this.utilObj.getLoginUser();
  public editPlantSubjectDestroy:any
  pagination:any = {index:'0',limit:'25',search:''}
  public cols:any=[
    { field: 'Sno', header: '#' },
    { field: 'pltTitle', header: 'Title' },
    { field: 'pltCode', header: 'Plant ID' },
    { field: 'pltCompany', header: 'Company' },
    { field: 'siteName', header: 'Current Site' },
  ]
  constructor(
    public dialog: MatDialog,
    public plantResourceService:PlantResourceService,
    public router: Router,
    public commonService:CommonService
    ) {}
    ngOnInit(): any {
      this.editPlantSubjectDestroy = this.plantResourceService.editPlantSubject.subscribe((res)=>{
          this.openAddUpdatePlant(res,'edit')
      })
      this.plantResourceService.pageIndex = 1
      this.plantResourceService.pagination = {index:'0',limit:'25',search:''}
      this.plantResourceService.visibleNoDataFound = false
      this.plantResourceService.plantList = []
      this.plantResourceService.getPlantList(this.plantResourceService.pagination)
      this.plantResourceService.getPlantSafetyList()
      this.plantResourceService.addPlantSuccess$.subscribe((res) => {
        this.dialog.closeAll();
      });
    }

  deletePlantAlert(plantData:any){
    Swal.fire({
      icon: "warning",
      text: 'Are you sure you want to delete this plant?',
      width: '27rem',
      confirmButtonText:'Yes',
      cancelButtonText:'No',
      showCancelButton:true,
      confirmButtonColor: 'rgb(223,129,62)',
    }).then((result) => {
      result.isConfirmed == true ? this.plantResourceService.deletePlant(plantData) : ''
    });
  }

  openAddUpdatePlant(PlantData:any,from:any){
    const dialogRef = this.dialog.open(AddEditPlantResourcesComponent, {
      data:{plantData: PlantData,from:from},
      width: '43rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.plantResourceService.pagination = {index:'0',limit:'25',search:''};
      this.plantResourceService.plantId = ''
      this.plantResourceService.safetyList.map((item:any)=>{ item.isRowSelected = false })
    })
  }

  previewPlant(PlantData:any){
    const dialogRef = this.dialog.open(PreviewPlantResourcesComponent, {
      data: PlantData,
      width: '43rem',
      autoFocus: false,
      disableClose: true,
    });
  }

  onPageChange($event:any){
    this.plantResourceService.pagination.index = ($event.pageIndex) * $event.pageSize
    this.plantResourceService.pagination.limit = $event.pageSize
    this.plantResourceService.pageIndex = this.plantResourceService.pagination.index + 1
    this.plantResourceService.getPlantList(this.plantResourceService.pagination)
  }

  ngOnDestroy(){
    this.editPlantSubjectDestroy && this.editPlantSubjectDestroy.unsubscribe();
  }
}
