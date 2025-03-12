import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter } from 'rxjs';
import { Util } from 'src/app/core/resource/utils';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { RequestService } from '../../request/request-service/request.service';
import { ResourceService } from '../../resources/add-resources-service/resource.service';

@Injectable({
  providedIn: 'root'
})
export class DashboradService {
  public allSiteData:any
  public displaySiteData: any
  public currentRouteName:any
  public dashboardFilterSite:any
  public selectedSite:any = []
  public allUserSiteList = new Subject<void>();
  allUserSiteList$ = this.allUserSiteList.asObservable();
  removeFilterLabel: Subject<any> = new Subject()
  public dashboardFilterChips:any = []
	public filterItem: any = [
		{ searchType: '1', siteName: [] },
		{ searchType: '2', roleName: [] },
		{ searchType: '3', licName: [] },
		{ searchType: '4', trName: [] },
		{ searchType: '5', comptName: [] }
	]
  pagination:any = {
    siteIds:[]
  }
  public userDetails:any
  public siteList:any
  utiObj = new Util();
  constructor(
    public endUserService:EndUserService,
    public commonService:CommonService,
    public router: Router,
    public requestService:RequestService,
    public resourceService:ResourceService
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd | any) => {
        this.currentRouteName = event.url.split('/').pop();
      });
   }

  getAllSitesUserList(pagination:any,siteId?:any){
    this.endUserService.allSitesUserList(pagination).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.allSiteData = result.data
        this.updateSuStatus(this.allSiteData)
        if(siteId){//for show site user preview 
          this.allSiteData = this.allSiteData.filter((val:any)=>{
            if(siteId == val.siteId){
              return this.allSiteData
            }
          })
        }
        this.currentRouteName == 'resources' ? this.allUserSiteList.next() : ''
        this.dashboardFilterSite = this.allSiteData
		this.displaySiteData = JSON.parse(JSON.stringify(this.allSiteData))
        this.commonService.userCount = this.allSiteData.reduce((total:any, site:any) => {
          const filteredUsers = site.userData.filter((user:any) => user.suStatus !== 1);
          return total + filteredUsers.length;
        }, 0);
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  assignUserInSite(siteId:any,receiverId:any,assignId:any,preSiteId:any){
    this.endUserService.assignUserInSite({siteId:siteId,receiverId:receiverId,assignId:assignId,preSiteId:preSiteId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
        const localSiteList:any = JSON.parse(localStorage.getItem('slectSite') || '[]')
        localSiteList.forEach((item: any) => {
        if (item.siteId) {
            this.pagination.siteIds.push(item.siteId);
        }
        });
        this.currentRouteName == 'dashboard' ? this.getAllSitesUserList(this.pagination) : ''
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  setinitialData(){
    this.resourceService.roleList = ''
    this.resourceService.trainingList = ''
    this.resourceService.competenciesList = ''
    this.resourceService.licencesList = ''
    this.commonService.searchSiteList = ''
    this.dashboardFilterChips = [
      { searchType: '1', siteName: [] },
      { searchType: '2', roleName: [] },
      { searchType: '3', licName: [] },
      { searchType: '4', trName: [] },
      { searchType: '5', comptName: [] }
    ]
    this.filterItem = [
      { searchType: '1', siteName: [] },
      { searchType: '2', roleName: [] },
      { searchType: '3', licName: [] },
      { searchType: '4', trName: [] },
      { searchType: '5', comptName: [] }
    ]
  }

  getUserDetails(usrId:any){
    this.endUserService.userDetails({usrId:usrId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.userDetails = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  siteNameList(usrId?:any){
    this.endUserService.siteNameList({usrId:usrId,siteType:[0,1]}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.siteList = result.data
        this.commonService.siteIdList = []
        this.siteList.map((res:any)=>{
          this.commonService.siteIdList.push(res.siteId)
        })
        this.currentRouteName == 'request' ? this.commonService.siteIdList.length ? this.requestService.siteUserRequestList(this.requestService.DashSelectIndex+1,this.commonService.siteIdList) : '' : ''
        this.currentRouteName == 'dashboard' ? this.filterDashboardSite() : ''
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  updateSuStatus(usersArray:any){
    let assignIdCounts:any = {};
    usersArray.forEach((site:any) => {
        site.userData.forEach((user:any) => {
            const { assignId } = user;
            assignIdCounts[assignId] = (assignIdCounts[assignId] || 0) + 1;
        });
    });

    usersArray.forEach((site:any) => {
        site.userData.forEach((user:any) => {
            const { assignId, suStatus } = user;
            if (assignIdCounts[assignId] >= 2 && suStatus === 2) {
                user.suStatus = 3;
            }
        });
    });
  }
  filterDashboardSite(){
    this.siteList.unshift({ siteId: '', siteName: 'All' });
    if (!localStorage.getItem('slectSite')) {
      this.selectedSite = this.siteList
      this.selectedSite.length != this.siteList.length ? this.selectedSite = this.selectedSite.filter((site:any)=>site.siteId != '') : ''
      localStorage.setItem('slectSite',JSON.stringify(this.siteList))
    }else{
      var localSiteList:any = localStorage.getItem('slectSite')
      this.selectedSite = JSON.parse(localSiteList)
      this.selectedSite.length != this.siteList.length ? this.selectedSite = this.selectedSite.filter((site:any)=>site.siteId != '') : this.selectedSite.unshift({ siteId: '', siteName: 'All' })
    }
  }
}
