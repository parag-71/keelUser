import { Injectable } from '@angular/core';
import { PaginationModal } from 'src/app/core/model/admin-model';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { RequestService } from '../../request/request-service/request.service';

@Injectable({
  providedIn: 'root'
})
export class SiteService {
  public siteList:any
  public siteCount:any
  public pageIndex:number = 1
  public pagination:any ={ index:'0',limit:'25',search:''}
  constructor( 
    public endUserService:EndUserService,
    public commonService:CommonService,
    public requestService:RequestService
    ) { }
  getSiteList(pagination:any){
    let siteListModal = new PaginationModal()
      siteListModal.search = pagination && pagination.search ? pagination.search : ''
      siteListModal.index = pagination && pagination.index ? pagination.index : '0'
      siteListModal.limit = pagination && pagination.limit ? pagination.limit : '25'
    this.endUserService.siteList(siteListModal).subscribe((result:any)=>{
      if(result.status == '200'){
        this.siteList = result.data;
        this.siteList.sort((a:any, b:any) => {
          if (a.siteType === 0 && b.siteType !== 0) {
              return -1;
          } else if (a.siteType !== 0 && b.siteType === 0) {
              return 1;
          } else {
              return 0;
          }
      });
      this.siteCount = result.totalCount.totalCount
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  deleteSite(SiteData:any){
    this.endUserService.deleteSite({siteId:SiteData.siteId}).subscribe((result:any)=>{
      if (result.status == 200 ){
        this.getSiteList('')
        this.pageIndex = 1
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
}
