import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditResourcesComponent } from '../add-edit-resources/add-edit-resources.component';
import { ResourceService } from '../../add-resources-service/resource.service';
import Swal from 'sweetalert2';
import * as Global from '../../../../../environments/environment'
import { Util } from 'src/app/core/resource/utils';
import { PreviewResourcesComponent } from '../preview-resources/preview-resources.component';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { PreviewDashboardUserComponent } from 'src/app/main-modules/dashborad/components/preview-dashboard-user/preview-dashboard-user.component';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import { CommonService } from 'src/app/core/services/common.service';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent {
  public baseUrl = Global.environment.BASE_URL
  utilObj = new Util();
  public userDetails =this.utilObj.getLoginUser();
  public editResourceSubjectDestroy:any
  pagination:any = {
    siteIds:[]
  }
  public cols:any=[
    { field: 'Sno', header: '#' },
    { field: 'usrFirstname', header: 'Name' },
    { field: 'roleName', header: 'Role' },
    { field: 'usrEmail', header: 'Email' },
    { field: 'usrPhone', header: 'Phone' },
    { field: 'usrLocation', header: 'Location' },
    { field: 'siteName', header: 'Current Site' },
  ]
  constructor(
    public dialog: MatDialog,
    public resourceService:ResourceService,
		public router: Router,
    public dashboradService:DashboradService,
    public commonService:CommonService
    ) {}
    ngOnInit(): any {
      this.editResourceSubjectDestroy = this.resourceService.editResourceSubject.subscribe((res)=>{
          this.openAddUpdateUser(res,'edit')
      })
      this.resourceService.pageIndex = 1
      this.resourceService.pagination = {index:'0',limit:'25',search:''}
      this.resourceService.visibleNoDataFound = false
      this.resourceService.usrAdminMergedData = []
      this.resourceService.getUserList(this.resourceService.pagination)
      this.resourceService.trainingList ? '' : this.resourceService.getTrainingRecord()
      this.resourceService.licencesList ? '' : this.resourceService.getLicencesList()
      this.resourceService.competenciesList ? '' : this.resourceService.getCompetenciesList()
      this.resourceService.addResourceSuccess$.subscribe((res) => {
        this.dialog.closeAll();
      });
      this.resourceService.pagination = {index:'0',limit:'25',search:'',siteIds:[]}
    }

  changeStatus(userData:any){
    this.resourceService.changeUserStatus(userData)
  }
  deleteResourceAlert(userData:any){
    Swal.fire({
      icon: "warning",
      title:'Are you sure?',
      text: 'You want to delete this User?',
      width: '27rem',
      confirmButtonText:'yes',
      cancelButtonText:'No',
      showCancelButton:true,
      confirmButtonColor: 'rgb(223,129,62)',
    }).then((result) => {
      result.isConfirmed == true ? this.resourceService.deleteUser(userData) : '' 
    });
  }
  openAddUpdateUser(UserData:any,from:any){
    const dialogRef = this.dialog.open(AddEditResourcesComponent, {
      data:{userData: UserData,from:from},
      width: '43rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.resourceService.selectedTabIndex = 0
      this.resourceService.pagination =  {index:'0',limit:'25',search:'',siteIds:[]};
      this.resourceService.userId = ''
      this.resourceService.licencesList.map((item:any)=>{ 
        item.isRowSelected = true
        if(item.ulExpiredate || item.ulNeverExpire){
          item.ulExpiredate = ''
          item.ulNeverExpire = 0
        }
       })
      this.resourceService.competenciesList.map((item:any)=>{ 
        item.isRowSelected = true
        if(item.ucExpiredate || item.ucNeverExpire){
          item.ucExpiredate = ''
          item.ucNeverExpire = 0
        }
       })
      this.resourceService.trainingList.map((item:any)=>{ 
        item.isRowSelected = true
        if(item.utrExpiredate || item.utrNeverExpire){
          item.utrExpiredate = ''
          item.utrNeverExpire = 0
        }
       })
    })
  }
  previewResource(UserData:any){
    const dialogRef = this.dialog.open(PreviewResourcesComponent, {
      data: UserData,
      width: '43rem',
      autoFocus: false,
      disableClose: true,
    });
  }
  redirectDash(user:any){
      this.dashboradService.getAllSitesUserList(this.pagination,user.siteId)
      const dialogRef = this.dialog.open(PreviewDashboardUserComponent, {
        data:{user: user, site : ''},
        width: '43rem',
        autoFocus: false,
        disableClose: true,
      })
      dialogRef.afterClosed().subscribe(result => {
        this.dashboradService.userDetails = ''
      })
    
  }
  onPageChange($event:any){
  this.resourceService.pagination.index = ($event.pageIndex) * $event.pageSize 
  this.resourceService.pagination.limit = $event.pageSize
  this.resourceService.pageIndex = this.resourceService.pagination.index + 1
  this.resourceService.getUserList(this.resourceService.pagination)
  }
  ngOnDestroy(){
    this.editResourceSubjectDestroy && this.editResourceSubjectDestroy.unsubscribe();
    this.commonService.userCount = ''
  }
}
