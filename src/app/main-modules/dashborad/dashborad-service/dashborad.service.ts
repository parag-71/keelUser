import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, from, mergeMap } from 'rxjs';
import { Util } from 'src/app/core/resource/utils';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { RequestService } from '../../request/request-service/request.service';
import { ResourceService } from '../../resources/add-resources-service/resource.service';
import * as Global from '../../../../environments/environment'
@Injectable({
  providedIn: 'root'
})
export class DashboradService {
  baseUrl = Global.environment.BASE_URL
  public allSiteData:any
  public displaySiteData: any
  public currentRouteName:any
  public dashboardFilterSite:any
  // Plant-board mirror of dashboardFilterSite: site-filtered, pre-search base.
  public dashboardFilterPlantSite:any
  public selectedSite:any = []
  public allUserSiteList = new Subject<void>();
  allUserSiteList$ = this.allUserSiteList.asObservable();
  removeFilterLabel: Subject<any> = new Subject()
  public dashboardFilterChips:any = []
  public originalSiteData: any[] = [];
  public allPlantSiteData: any
  public displayPlantSiteData: any
  public originalPlantSiteData: any[] = [];
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
  public plantDetails:any
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

  // allSitesUserList already returns userData[] AND plantData[] per site, so
  // one call populates both the People and Plant boards.
  getAllSitesUserList(pagination:any,siteId?:any){
    this.endUserService.allSitesUserList(pagination).subscribe(async (result:any)=>{
      if (result.status == '200' ){
        this.allSiteData = result.data
        this.updateSuStatus(this.allSiteData)
        if (siteId) {
          this.allSiteData = this.allSiteData.filter((val: any) => val.siteId == siteId);
        }
        this.currentRouteName == 'resources' ? this.allUserSiteList.next() : ''
        this.dashboardFilterSite = this.allSiteData
	    this.displaySiteData = this.clone(this.allSiteData)
        this.originalSiteData = this.clone(this.allSiteData)
        this.commonService.userCount = this.countActive(this.allSiteData, 'userData', 'suStatus')

        // Plant board derived from the SAME response (no separate API call).
        this.allPlantSiteData = this.clone(this.allSiteData)
        this.updatePlantSpStatus(this.allPlantSiteData)
        this.dashboardFilterPlantSite = this.allPlantSiteData
        this.displayPlantSiteData = this.clone(this.allPlantSiteData)
        this.originalPlantSiteData = this.clone(this.allPlantSiteData)
        this.commonService.plantCount = this.countActive(this.allPlantSiteData, 'plantData', 'spStatus');

        // Re-apply any active header search on top of this freshly loaded data.
        (this.currentRouteName == 'dashboard' || this.currentRouteName == 'preview-site-user') ? this.applyHeaderSearch(this.commonService.search) : ''
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

  // Alias kept for existing callers - getAllSitesUserList() alone already
  // populates the Plant board too (no separate allSitesPlantList API call).
  getAllSitesPlantList(pagination: any, siteId?: any) {
    this.getAllSitesUserList(pagination, siteId)
  }
  assignPlantInSite(siteId:any,receiverId:any,assignId:any,preSiteId:any){
    this.endUserService.assignPlantInSite({siteId:siteId,receiverId:receiverId,assignId:assignId,preSiteId:preSiteId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
        const localSiteList:any = JSON.parse(localStorage.getItem('slectSite') || '[]')
        localSiteList.forEach((item: any) => {
          if (item.siteId) { this.pagination.siteIds.push(item.siteId); }
        });
        this.currentRouteName == 'dashboard' ? this.getAllSitesPlantList(this.pagination) : ''
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  // Admin-direct plant assign from the preview popup. Uses the same ByAdmin
  // endpoint the dashboard drag-and-drop uses, so the plant is moved
  // immediately instead of raising a transfer request - no Incoming/Outgoing
  // badge. (assignPlantInSite above is the request path, kept for site leaders.)
  assignPlantByAdmin(siteId:any,receiverId:any,assignId:any,preSiteId:any,senderId:any){
    this.endUserService.assignPlantsInSitesByAdmin({ plantSiteData: [{ siteId, receiverId, assignId, preSiteId, senderId }] }).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
        this.currentRouteName == 'dashboard' ? this.getAllSitesPlantList(this.pagination) : ''
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

  getPlantDetails(pltId: any) {
    this.endUserService.plantDetails({ pltId: pltId }).subscribe((result: any) => {
      if (result.status == '200') {
        this.plantDetails = result.data
      } else {
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
        this.currentRouteName == 'request' ? this.commonService.siteIdList.length ? this.requestService.loadRequestList(this.requestService.DashSelectIndex+1,this.commonService.siteIdList) : '' : ''
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
  updatePlantSpStatus(plantsArray:any){
    let assignIdCounts:any = {};
    plantsArray.forEach((site:any) => {
        site.plantData.forEach((plant:any) => {
            const { assignId } = plant;
            assignIdCounts[assignId] = (assignIdCounts[assignId] || 0) + 1;
        });
    });

    plantsArray.forEach((site:any) => {
        site.plantData.forEach((plant:any) => {
            const { assignId, spStatus } = plant;
            if (assignIdCounts[assignId] >= 2 && spStatus === 2) {
                plant.spStatus = 3;
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

  // =====================================================================
  // Dashboard search & filter pipeline (People + Plant), non-mutating:
  //   1) applySiteNameFilter()  -> "Sites" tab of the advanced popup
  //   2) role/licence/etc.      -> search-filter.component.ts (people only)
  //   3) applyHeaderSearch()    -> header search box (people + plant)
  // Layer 3 always reads from dashboardFilterSite/dashboardFilterPlantSite
  // (the output of layers 1+2), not the raw allSiteData/allPlantSiteData, so
  // search and the site filter compose instead of overwriting each other.
  // =====================================================================

  private clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data));
  }

  private countActive(sites: any[], listKey: 'userData' | 'plantData', statusKey: 'suStatus' | 'spStatus'): number {
    return (sites || []).reduce((total: number, site: any) =>
      total + (site[listKey] || []).filter((item: any) => item[statusKey] !== 1).length, 0);
  }

  // "Sites" tab of the advanced filter popup - shared by People + Plant boards.
  applySiteNameFilter(sites: any[], selectedSiteNames: string[]): any[] {
    const cloned = this.clone(sites || []);
    return selectedSiteNames?.length ? cloned.filter((site: any) => selectedSiteNames.includes(site.siteName)) : cloned;
  }

  // Plant-board base for the advanced filter popup. Role/Licence/Training/
  // Competency are PEOPLE-ONLY attributes - a plant can never match any of
  // them - so if any of those are selected, no plant can satisfy the same
  // AND-across-all-filters rule the People side uses, and the Plant board
  // must show nothing. Only when none of those are active does the "Sites"
  // selection apply on its own.
  computePlantFilterBase(sites: any[], filterItem: any[]): any[] {
    const hasPeopleOnlyFilter = filterItem[1].roleName.length || filterItem[2].licName.length
      || filterItem[3].trName.length || filterItem[4].comptName.length;
    return hasPeopleOnlyFilter ? [] : this.applySiteNameFilter(sites, filterItem[0].siteName);
  }

  // Header search - People: matches first name + last name + role name.
  filterPeopleBySearchTerm(sites: any[], searchText: string): any[] {
    const term = (searchText || '').toLowerCase().replace(/\s/g, '');
    if (!term) { return this.clone(sites || []); }
    return this.clone(sites || [])
      .map((site: any) => ({
        ...site,
        userData: (site.userData || []).filter((user: any) =>
          `${user.usrFirstname}${user.usrLastname}${user.roleName}`.toLowerCase().replace(/\s/g, '').includes(term))
      }))
      .filter((site: any) => site.userData.length > 0);
  }

  // Header search - Plant: matches title, id/code, company, site name, tags.
  filterPlantsBySearchTerm(sites: any[], searchText: string): any[] {
    const term = (searchText || '').trim().toLowerCase();
    if (!term) { return this.clone(sites || []); }
    return this.clone(sites || [])
      .map((site: any) => ({
        ...site,
        plantData: (site.plantData || []).filter((plant: any) => this.plantMatchesSearchTerm(plant, site.siteName, term))
      }))
      .filter((site: any) => site.plantData.length > 0);
  }

  private plantMatchesSearchTerm(plant: any, siteName: any, term: string): boolean {
    // pltId = internal DB key, pltCode = the "Plant ID" shown to the user.
    return [plant.pltTitle, plant.pltId, plant.pltCode, plant.pltCompany, siteName, this.plantTagsText(plant)]
      .map((val: any) => (val ?? '').toString())
      .join(' ')
      .toLowerCase()
      .includes(term);
  }

  // Tags may come through under different keys/shapes depending on the endpoint.
  private plantTagsText(plant: any): string {
    const tags = [plant.tagData, plant.tags, plant.plantTagData, plant.tagList, plant.plantTags]
      .find((c: any) => Array.isArray(c) && c.length) || [];
    return tags.map((t: any) => (typeof t === 'string' ? t : (t?.tagName ?? t?.pt_tag ?? t?.tag ?? t?.ct_tag ?? t?.name ?? ''))).join(' ');
  }

  // Single entry point for the header search box: layers `searchText` on top
  // of the current site/advanced-filter base (not the raw, unfiltered data),
  // so search + site filter compose instead of overwriting each other.
  applyHeaderSearch(searchText: string): void {
    this.displaySiteData = this.filterPeopleBySearchTerm(this.dashboardFilterSite || this.allSiteData || [], searchText);
    this.displayPlantSiteData = this.filterPlantsBySearchTerm(this.dashboardFilterPlantSite || this.allPlantSiteData || [], searchText);
  }
}