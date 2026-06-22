import { Component, Input } from '@angular/core';
import { RequestService } from '../../request-service/request.service';
import { Util } from 'src/app/core/resource/utils';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.scss']
})
export class RequestComponent {
  utiObj = new Util();
  userDetails:any
  public sites:any = 'all'
  @Input() inputFromParent: any;
  constructor(
    public requestService:RequestService,
    public dashboradService:DashboradService,
    public commonService:CommonService
  ){} 
  ngOnInit(){
    this.requestService.DashSelectIndex = 0
    this.requestService.resourceType = 'people'
    this.userDetails = this.utiObj.getLoginUser()
    this.requestService.requestTypeSubject.next(this.requestService.DashSelectIndex)
    if(this.requestService.DashSelectIndex == 0 ){
      this.requestService.sentRequestSiteNameList() 
    }else{
      this.dashboradService.siteNameList(this.userDetails.usrId)
    }
  }
  tabChange($event:any){
    this.requestService.sendList = []
    this.requestService.requestTypeSubject.next(this.requestService.DashSelectIndex)
    this.sites = 'all'
    if(this.requestService.DashSelectIndex == 0 ){
      this.requestService.sentRequestSiteNameList() 
    }else{
      this.dashboradService.siteNameList(this.userDetails.usrId)
    }
  }
  changeResource(type:any){
    if(this.requestService.resourceType == type) return
    this.requestService.resourceType = type
    this.requestService.sendList = []
    this.sites = 'all'
    this.requestService.requestTypeSubject.next(this.requestService.DashSelectIndex)
    if(this.requestService.DashSelectIndex == 0 ){
      this.requestService.sentRequestSiteNameList()
    }else{
      this.dashboradService.siteNameList(this.userDetails.usrId)
    }
  }
  changeSite(){
    if(this.sites == 'all'){
      this.requestService.loadRequestList(this.requestService.DashSelectIndex+1,this.commonService.siteIdList)
    }else{
      this.requestService.loadRequestList(this.requestService.DashSelectIndex+1,[this.sites])
    }
  }
  ngOnDestroy() {
    this.requestService.sendList =[]
  }
}
