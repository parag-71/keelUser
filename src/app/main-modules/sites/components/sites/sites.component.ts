import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddEditSitesComponent } from '../add-edit-sites/add-edit-sites.component';
import Swal from 'sweetalert2';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { CommonService } from 'src/app/core/services/common.service';
import { SiteService } from '../../site-service/site.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss']
})
export class SitesComponent {
  public siteCount:any
  public pagination:any ={ index:'0',limit:'25',search:''}
  public cols:any=[
    { field: 'siteNo', header: 'Site. No.' },
    { field: 'siteName', header: 'Site Name' },
    { field: 'usrFirstname', header: 'Site Leader' },
    { field: 'totalUser', header: 'No. of Resource' },
  ]
  constructor(
    public dialog: MatDialog,
    public endUserService:EndUserService,
    public commonService:CommonService,
    public siteService:SiteService,
		public router: Router
    ) {}

   ngOnInit(){
    this.siteService.pageIndex = 1
    this.siteService.getSiteList('')
   } 
  openEditSite(Data:any,from:any){
    const dialogRef = this.dialog.open(AddEditSitesComponent, {
      data:{siteData: Data,from:from},
      width: '27rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      result == 'success' ? this.siteService.getSiteList('') : ''
    })
  }
  preSiteUser(site:any){
    this.router.navigate(['sites/preview-site-user',site.siteId]);
  }
  getSiteList(){
    this.siteService.getSiteList('')
  }
  deleteSite(SiteData:any){
    this.siteService.deleteSite(SiteData)
  }
  deleteSiteAlert(SiteData:any){
    if(SiteData.totalUser == 0){
      Swal.fire({
        icon: "warning",
        title:'Are you sure?',
        text: 'You want to delete this Site?',
        width: '27rem',
        confirmButtonText:'Yes',
        cancelButtonText:'No',
        showCancelButton:true,
        confirmButtonColor: 'rgb(223,129,62)',
      }).then((result) => {
        result.isConfirmed == true ? this.deleteSite(SiteData) : ''
      });
    }else{
      this.commonService.Alert('This site cannot be deleted as it has active users in it, to delete a site you will need to move resources to another site and they should be accepted on their new site before this site can be deleted.','error')
    }
     
  }

  onPageChange($event:any){
    this.pagination.index = ($event.pageIndex) * $event.pageSize 
    this.pagination.limit = $event.pageSize
    this.siteService.pageIndex = this.pagination.index + 1
    this.siteService.getSiteList(this.pagination)
  }
  
}
