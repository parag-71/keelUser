import { Component, HostListener, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Util } from 'src/app/core/resource/utils';
import { CommonService } from 'src/app/core/services/common.service';
import { ResourceService } from 'src/app/main-modules/resources/add-resources-service/resource.service';
import { PlantResourceService } from 'src/app/main-modules/plant-resources/plant-resource-service/plant-resource.service';
import { SiteService } from 'src/app/main-modules/sites/site-service/site.service';
import * as Global from '../../../../environments/environment'
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdatePasswordComponent } from '../update-password/update-password.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  public isDesktop:any
  public userDetails:any
  public currentRouteName:any
  public customImg:any
  utilObj = new Util();
  baseUrl = Global.environment.BASE_URL
  public pagination = {
    index: '0',
    limit: '10',
    search: '',
  };
  public resourcesPagination = {
    index: '0',
    limit: '25',
    search: '',
  };
  public plantResourcesPagination = {
    index: '0',
    limit: '25',
    search: '',
  };
  @Input() inputSideNav: any;
  public showFilter:any = false
  constructor(
    public commonService:CommonService,
    public router: Router,
    public siteService:SiteService,
    public resourceService :ResourceService,
    public plantResourceService :PlantResourceService,
    public dashboradService:DashboradService,
    public dialog: MatDialog,
    ) { 
  }
  ngOnInit(){
   this.commonService.localStorageSubject$.subscribe((res)=>{
      this.userDetails = this.utilObj.getLoginUser();
    })
    this.userDetails = this.utilObj.getLoginUser();
    this.currentRouteName = this.router.url.split('/')[2] ? this.router.url.split('/')[2] : this.router.url.split('/')[1];
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd | any) => {
        this.commonService.search = ''
        this.currentRouteName = event.url.split('/')[2] ? event.url.split('/')[2] : event.url.split('/')[1];
      });
  }

  openUpdatePassDialog(){
    const dialogRef = this.dialog.open(UpdatePasswordComponent, {
      width: '27rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
    })
  }

  searchCustomer(){
    // Dashboard/site-preview filtering is client-side only - no min-length
    // gate needed there (unlike the server-searched routes below, where a
    // 3-char minimum avoids firing an API call on every keystroke).
    if (this.currentRouteName == 'dashboard' || this.currentRouteName == 'preview-site-user') {
      this.callSearchListApi(this.currentRouteName)
      return
    }
    if(this.commonService.search.length >= 3){
      this.pagination.search = this.commonService.search
      this.resourcesPagination.search = this.commonService.search
      this.plantResourcesPagination.search = this.commonService.search
      this.callSearchListApi(this.currentRouteName)
    }else if(this.commonService.search.length == 0){
      this.pagination.search = ''
      this.resourcesPagination.search = ''
      this.plantResourcesPagination.search = ''
      this.callSearchListApi(this.currentRouteName)
      this.commonService.resourcePlannerSub.next('')
    }
  }
  clearSearch(){
    this.commonService.search = ''
    this.pagination.search = ''
    this.resourcesPagination.search = ''
    this.plantResourcesPagination.search = ''
    // Search is already reset above, so re-running the same per-route logic
    // in callSearchListApi() clears everything without duplicating it here.
    this.callSearchListApi(this.currentRouteName)
  }
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const outerDiv = document.querySelector<HTMLElement>('#outerDiv');

    if (outerDiv && !outerDiv.contains(clickedElement)) {
      this.showFilter = false
    }
  }
  receiveDataFromChild(){
    this.showFilter = false
  }
  openSearchFilter(){
    this.showFilter = true
  }
  searchFn(){
    this.showFilter = false
  }
  callSearchListApi(route:any){
    switch (route) {
      case "sites":
        this.siteService.getSiteList(this.pagination)
        return ''
      case "resources":
        this.resourceService.getUserList(this.resourcesPagination)
      return ''
      case "plant-resources":
        this.plantResourceService.getPlantList(this.plantResourcesPagination)
      return ''
      case "dashboard":
      case "preview-site-user":
      // Layers the search term on top of the current site/advanced filter
      // for BOTH People and Plant boards - see DashboradService.applyHeaderSearch().
      this.dashboradService.applyHeaderSearch(this.commonService.search)
      return ''
      case "planner":
      this.commonService.resourcePlannerSub.next(this.commonService.search)                                                     
      return ''
      default:
				return '';
    }
  }
}
