import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import * as Global from '../../../../../environments/environment'
import { MatDialog } from '@angular/material/dialog';
import { PreviewDashboardUserComponent } from 'src/app/main-modules/dashborad/components/preview-dashboard-user/preview-dashboard-user.component';
@Component({
  selector: 'app-site-user-preview',
  templateUrl: './site-user-preview.component.html',
  styleUrls: ['./site-user-preview.component.scss']
})
export class SiteUserPreviewComponent {
  pagination:any = {
    search:'',
    limit:'',
    index:'',
  }
  baseUrl = Global.environment.BASE_URL
  public siteId:any
  public resourceType:string = 'people'
  constructor(
    public dashboradService:DashboradService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    ) {}

  ngOnInit() {
    this.siteId = this.route.snapshot.params['siteId']
    this.resourceType = this.route.snapshot.queryParams['type'] === 'plant' ? 'plant' : 'people'
    if (this.resourceType === 'plant') {
      this.dashboradService.getAllSitesPlantList({}, this.siteId)
    } else {
      this.dashboradService.getAllSitesUserList({}, this.siteId)
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
      this.dashboradService.userDetails = ''
    })
   }

   removeFilter(item:any,index:any){
    this.dashboradService.removeFilterLabel.next({item,index})
  }

  ngOnDestroy() {
    this.dashboradService.allSiteData = []
    this.dashboradService.allPlantSiteData = []
    this.dashboradService.displayPlantSiteData = []
  }
}
