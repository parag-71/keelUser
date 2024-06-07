import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { DashboradService } from '../../dashborad/dashborad-service/dashborad.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  public sendList:any
  public siteList:any
  public requestTypeSubject = new Subject<void>();
  public DashSelectIndex:any = 0 
  requestTypeSubject$ = this.requestTypeSubject.asObservable();
  public sentSiteList:any
  constructor(
    public endUserService:EndUserService,
    public commonService:CommonService,
  ) { }
  siteUserRequestList(type:any,siteId:any){
    this.endUserService.siteUserRequestList({type :type,siteIds:siteId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.sendList = result.data 
        type == 2 ? this.commonService.requestCount = this.sendList.length : ''
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  cancelSiteUserRequest(suId:any){
    this.endUserService.cancelSiteUserRequest({suId :suId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
        this.commonService.siteIdList.length ? this.siteUserRequestList(this.DashSelectIndex+1,this.commonService.siteIdList) : '' 
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  acceptSiteUser(userData:any){
    this.endUserService.acceptSiteUser({suId:userData.suId,assignId:userData.assignId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
        this.commonService.siteIdList.length ? this.siteUserRequestList(this.DashSelectIndex+1,this.commonService.siteIdList) : '' 
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  sentRequestSiteNameList(){
    this.endUserService.sentRequestSiteNameList({}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.sentSiteList = result.data
        this.commonService.siteIdList = []
        this.sentSiteList.map((res:any)=>{
          this.commonService.siteIdList.push(res.siteId)
        })
        this.commonService.siteIdList.length ? this.siteUserRequestList(this.DashSelectIndex+1,this.commonService.siteIdList) : '' 
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
}
