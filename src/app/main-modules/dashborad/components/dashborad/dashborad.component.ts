import { Component } from '@angular/core';
import {  CdkDragDrop, CdkDragStart, transferArrayItem } from '@angular/cdk/drag-drop';
import { DashboradService } from '../../dashborad-service/dashborad.service';
import * as Global from '../../../../../environments/environment'
import { MatDialog } from '@angular/material/dialog';
import { PreviewDashboardUserComponent } from '../preview-dashboard-user/preview-dashboard-user.component';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import { Router } from '@angular/router';
import { Util } from 'src/app/core/resource/utils';
@Component({
  selector: 'app-dashborad',
  templateUrl: './dashborad.component.html',
  styleUrls: ['./dashborad.component.scss']
})
export class DashboradComponent {
  baseUrl = Global.environment.BASE_URL
  utiObj = new Util();
  pagination:any = {
    siteIds:[]
  }
  constructor(
    public dashboradService:DashboradService,
    public dialog: MatDialog,
    public commonService:CommonService,
    public router: Router

  ) {
    this.dashboradService.allSiteData = []
	this.dashboradService.displaySiteData = []
   }
  ngOnInit() {
    this.dashboradService.siteNameList()
    const localSiteList:any = JSON.parse(localStorage.getItem('slectSite') || '[]')
    localSiteList.forEach((item: any) => {
      if (item.siteId) {
        this.pagination.siteIds.push(item.siteId);
      }
    });
    this.dashboradService.getAllSitesUserList(this.pagination)
  }
  drop(event: CdkDragDrop<string[]>|any) {
    var assignId = event.previousContainer.data[event.previousIndex].assignId
    var assignName = event.previousContainer.data[event.previousIndex].usrFirstname
    var siteId = event.container.id.split('_',1)[0]
    var receiverId = event.container.id.split('_',2)[1]
    var siteName = event.container.id.split('_',3)[2]
    var preSiteId = event.previousContainer.id.split('_',3)[0]
    if(event.previousContainer.id.split('_',3)[1] == this.commonService.loginUserDetail.usrId && !event.previousContainer.data[event.previousIndex].local && event.previousContainer.data[event.previousIndex].suStatus != 1 || (assignId == event.previousContainer.id.split('_',3)[1] && (this.commonService.loginUserDetail.usrType == 2))){
      if (event.previousContainer != event.container  ) {
        Swal.fire({
          icon: 'warning',
          text: `Do you want to move ${assignName} to ${siteName} site`,
          width: '27rem',
          confirmButtonText: 'Yes',
          confirmButtonColor: 'rgb(223,129,62)',
          cancelButtonText: 'No',
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed && event.previousContainer != event.container) {
              this.dashboradService.assignUserInSite(siteId,receiverId,assignId,preSiteId);
          }
        });
      }
    }else{
      event.previousContainer.data[event.previousIndex]['local'] = true
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
      
  }
  onDragStarted(event: CdkDragStart): void {
    if(event.source.data.suStatus == 1){
      this.commonService.Alert('This user is pending for approval','error')
    }
    if(event.source.data.suStatus == 3){
      this.commonService.Alert('The user is already assigned to a site and pending for approval.','error')
    }
  }
  
  previewUser(user:any,site:any){
    const dialogRef = this.dialog.open(PreviewDashboardUserComponent, {
      data:{user: user, site : site},
      width: '43rem',
      autoFocus: false,
      disableClose: true,
    })
    dialogRef.afterClosed().subscribe(result => {
      result == 'success' ? this.dashboradService.getAllSitesUserList(this.pagination) : ''
      this.dashboradService.userDetails = ''
    })
  }
  redirectToSite(site:any){
    this.router.navigate(['sites/preview-site-user',site.siteId]);
  }
  selectSite(site:any){
    var localSiteList:any = JSON.parse(localStorage.getItem('slectSite') || '[]')
    var check = localSiteList.some((list:any)=>list.siteId == site.siteId)
    var siteIds:any = []
    if(site.siteName == 'All'){
      if(check){
      this.pagination.siteIds = []
      this.dashboradService.selectedSite = []
      this.dashboradService.getAllSitesUserList(this.pagination)
      localStorage.setItem('slectSite',JSON.stringify(this.dashboradService.selectedSite))
      }else{
        this.dashboradService.selectedSite = this.dashboradService.siteList
        this.dashboradService.selectedSite.map((id:any)=>id.siteId ? siteIds.push(id.siteId) : '')
        this.pagination.siteIds = siteIds
        localStorage.setItem('slectSite',JSON.stringify(this.dashboradService.selectedSite))
      }
    }else if(check){
      let updatedSite = localSiteList.filter((val:any)=>val.siteId != site.siteId)
      let siteIndex = this.utiObj.getIndexOfArrayData(updatedSite, "siteName", "All")
      siteIndex != -1 ? updatedSite.splice(siteIndex, 1) : ''
      updatedSite.map((id:any)=>id.siteId ? siteIds.push(id.siteId) : '')
      this.pagination.siteIds = siteIds
      this.dashboradService.selectedSite.length != this.dashboradService.siteList.length ? this.dashboradService.selectedSite = this.dashboradService.selectedSite.filter((site:any)=>site.siteId != '') : ''
      localStorage.setItem('slectSite',JSON.stringify(updatedSite))
    }else{
      localSiteList.push(site)
      localSiteList.map((id:any)=>id.siteId ? siteIds.push(id.siteId) : '')
      this.pagination.siteIds = siteIds
      this.dashboradService.selectedSite.length+1 != this.dashboradService.siteList.length ? this.dashboradService.selectedSite = this.dashboradService.selectedSite.filter((site:any)=>site.siteId != '') : this.dashboradService.selectedSite =localSiteList
      localStorage.setItem('slectSite',JSON.stringify(localSiteList))
    }
    this.dashboradService.getAllSitesUserList(this.pagination)
  }
  compareFn(site1: any, site2: any): boolean {
    return site1 && site2 ? site1.siteId === site2.siteId  : site1 === site2;
  }
  removeFilter(item:any,index:any){
    this.dashboradService.removeFilterLabel.next({item,index})
  }
  getSelectedLabel(){
    if(this.dashboradService.selectedSite.some((element:any)=>element.siteName == 'All')){
      return "All"
    }else{
      return this.dashboradService.selectedSite.map((option:any) => option.siteName).join(', ');
    }
  }
  ngOnDestroy() {
    this.dashboradService.allSiteData =[]
	  this.dashboradService.displaySiteData = []
    this.commonService.userCount = ''
    this.dashboradService.setinitialData()
  }
}
