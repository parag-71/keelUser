import { Injectable } from '@angular/core';
import { PaginationModal } from 'src/app/core/model/admin-model';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PlantResourceService {
  pagination:any = {index:'0',limit:'25',search:''}
  public plantList:any = []
  public plantsCount:any
  public safetyList:any = []
  public pageIndex:number = 1
  public plantId:any
  public visibleNoDataFound = false
  public addPlantSuccessSubject = new Subject<void>();
  public editPlantSubject = new Subject<void>();
  editPlantSubject$ = this.editPlantSubject.asObservable();
  addPlantSuccess$ = this.addPlantSuccessSubject.asObservable();

  constructor(
    public endUserService:EndUserService,
    public commonService:CommonService,
  ) { }

  addOrUpdatePlant(fd:any,type:any,isEdit:any){
    const apiCall = isEdit ? this.endUserService.updatePlant(fd) : this.endUserService.addPlant(fd)
    apiCall.subscribe((result:any)=>{
      if(result.status == '200'){
        this.getPlantList('')
        if(type == 'close'){
          this.addPlantSuccessSubject.next();
        }
        this.pageIndex = 1
        result.pltId ? this.plantId = result.pltId : ''
        this.commonService.successAlert(result.message);
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getPlantList(pagination:any){
    let paginationModal = new PaginationModal()
    paginationModal.search = pagination && pagination.search ? pagination.search : this.commonService.search = ''
    paginationModal.index = pagination && pagination.index ? pagination.index : '0'
    paginationModal.limit = pagination && pagination.limit ? pagination.limit : '25'
    this.endUserService.plantList(paginationModal).subscribe((result:any)=>{
      if(result.status == '200'){
        this.plantList = result.data
        this.plantsCount = result.totalCount.totalCount
        this.visibleNoDataFound = true
        let indexCounter = 1;
        this.plantList.forEach((item:any) => {
          item.index = pagination && pagination.index != 0 ? pagination.index + indexCounter++ : indexCounter++;
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  deletePlant(plantData:any){
    this.endUserService.deletePlant({pltId:plantData.pltId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.getPlantList('')
        this.commonService.successAlert(result.message)
        this.pageIndex = 1
      }else if(result.status == '403' && result.data && result.data.length){
        var Text:any = result.data.map((val:any)=>{return val.siteName})
        Swal.fire({
          icon: 'error',
          html:"<div style='font-size: 15px;font-weight: 500;'>"+result.message+"</div>" +"<div style='font-size: 15px;font-weight: 400;padding-top:10px;'>"+Text+"</div>",
          confirmButtonColor: 'rgb(223,129,62)',
          width: '50rem',
          customClass: {
            popup: 'swal-wide',
          }
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getPlantSafetyList(){
    this.endUserService.companyPlantLicencesList({}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.safetyList = result.data
        this.safetyList.map((sf:any)=>{
          sf['isRowSelected'] = false
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  // Licences are saved via a dedicated API (not the main plant update) — same pattern as People's updateUserLicences.
  updatePlantResourceLicences(value:any,pltId:any,type:any){
    this.endUserService.updatePlantResourceLicences({pltId:pltId, licencesData:value}).subscribe((result:any)=>{
      if (result.status == '200' ){
        if(type == 'close'){
          this.addPlantSuccessSubject.next();
        }
        this.commonService.successAlert(result.message);
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
}
