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
import { EndUserService } from 'src/app/core/services/end-user.service';
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
  pendingChanges: any[] = [];
  constructor(
    public dashboradService:DashboradService,
    public dialog: MatDialog,
    public commonService:CommonService,
    public router: Router,
    public endUserService: EndUserService

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
  drop(event: CdkDragDrop<string[]> | any) {
    var assignId = event.previousContainer.data[event.previousIndex].assignId
    var senderId = event.previousContainer.data[event.previousIndex].senderId
    var assignName = event.previousContainer.data[event.previousIndex].usrFirstname
    var preSiteId = event.previousContainer.id.split('_', 3)[0]
    var siteId = event.container.id.split('_', 1)[0]
    var receiverId = event.container.id.split('_', 2)[1]
    var siteName = event.container.id.split('_', 3)[2]

    if (this.commonService?.usrpermission.usrType == 2 || this.commonService?.usrpermission.usrType == 1) {
      // ✅ Check if dropped into another site (not the same one)
      if (preSiteId !== siteId) {
        if (event.previousContainer !== event.container) {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        }
        const existingIndex = this.pendingChanges.findIndex(
          (c) => c.assignId === assignId
        );

        if (existingIndex > -1) {
          this.pendingChanges[existingIndex] = { siteId, receiverId, assignId, preSiteId, senderId };
        } else {
          this.pendingChanges.push({ siteId, receiverId, assignId, preSiteId, senderId });
        }
      }
    } else if (event.previousContainer.id.split('_', 3)[1] == this.commonService?.usrpermission.usrId) {
      if (event.previousContainer != event.container) {
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
            this.dashboradService.assignUserInSite(siteId, receiverId, assignId, preSiteId);
          }
        });
      }
    }
  }

  saveChanges() {
    if (!this.pendingChanges.length) {
      this.commonService.Alert('No changes to save.', 'info');
      return;
    }

    Swal.fire({
      icon: 'warning',
      text: 'Do you want to save all changes?',
      width: '27rem',
      confirmButtonText:'Yes',
      cancelButtonText:'No',
      showCancelButton:true,
      confirmButtonColor: 'rgb(223,129,62)',
    }).then((result) => {
      if (result.isConfirmed) {
        this.assignUsersInSitesByAdmin()
      }
    });
  }

  assignUsersInSitesByAdmin() {
    const paramData = {
      userSiteData: this.pendingChanges
    };
    this.endUserService.assignUsersInSitesByAdmin(paramData).subscribe((result: any) => {
      if (result.status == '200') {
        this.commonService.successAlert(result.message);
        this.dashboradService.originalSiteData = JSON.parse(JSON.stringify(this.dashboradService.displaySiteData));
        this.pendingChanges = [];
      } else {
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  cancelChanges() {
    Swal.fire({
      icon: 'warning',
      text: 'All unsaved changes will be reverted.',
      width: '27rem',
      confirmButtonText:'Yes',
      cancelButtonText:'No',
      showCancelButton:true,
      confirmButtonColor: 'rgb(223,129,62)',
    }).then((result) => {
      if (result.isConfirmed) {
        // revert to original snapshot
        this.dashboradService.displaySiteData = JSON.parse(
          JSON.stringify(this.dashboradService.originalSiteData)
        );
        this.pendingChanges = [];
      }
    });
  }

  onDragStarted(event: CdkDragStart): void {
    if(event.source.data.suStatus == 1){
      this.commonService.Alert('This user is pending for approval','error')
    }
    if(event.source.data.suStatus == 3){
      this.commonService.Alert('The user is already assigned to a site and pending for approval.','error')
    }
  }
  
  trackByUserId(index: number, user: any) {
    return user.usrId;
  }
  trackBySiteId(index: number, site: any){
    return site.siteId
  }
  getChipKey(index: number): string {
    const keys = ['siteName', 'roleName', 'licName', 'trName', 'comptName'];
    return keys[index];
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
