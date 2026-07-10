import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import * as Global from '../../../../../environments/environment'
import { MatDialog } from '@angular/material/dialog';
import { PreviewDashboardUserComponent } from 'src/app/main-modules/dashborad/components/preview-dashboard-user/preview-dashboard-user.component';
import { PreviewDashboardPlantComponent } from 'src/app/main-modules/dashborad/components/preview-dashboard-plant/preview-dashboard-plant.component';
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
  public resourceType: 'people' | 'plant' | 'both' = 'people'
  constructor(
    public dashboradService:DashboradService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    ) {}

  ngOnInit() {
    this.siteId = this.route.snapshot.params['siteId']
    const type = this.route.snapshot.queryParams['type']
    this.resourceType = type === 'plant' ? 'plant' : type === 'both' ? 'both' : 'people'
    // Single call populates both People and Plant boards from one response.
    this.dashboradService.getAllSitesUserList({}, this.siteId)
  }
  // "Both" view: this page is already filtered to a single siteId, so this
  // just pairs that site's userData (from displaySiteData) with its
  // plantData (from displayPlantSiteData) into one row for the template.
  get combinedSiteData(): any[] {
    const peopleSite = (this.dashboradService.displaySiteData && this.dashboradService.displaySiteData[0]) || null;
    const plantSite = (this.dashboradService.displayPlantSiteData && this.dashboradService.displayPlantSiteData[0]) || null;
    if (!peopleSite && !plantSite) {
      return [];
    }
    return [{
      siteId: (peopleSite && peopleSite.siteId) || (plantSite && plantSite.siteId),
      usrId: (peopleSite && peopleSite.usrId) || (plantSite && plantSite.usrId),
      siteName: (peopleSite && peopleSite.siteName) || (plantSite && plantSite.siteName),
      userData: (peopleSite && peopleSite.userData) || [],
      plantData: (plantSite && plantSite.plantData) || []
    }];
  }
  previewUser(user: any, site: any) {
    const dialogRef = this.dialog.open(PreviewDashboardUserComponent, {
      data: { user: user, site: site }, width: '43rem', autoFocus: false, disableClose: true,
    })
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'success') {
        this.dashboradService.getAllSitesUserList({}, this.siteId)
      }
      this.dashboradService.userDetails = ''
    })
  }

   removeFilter(item:any,index:any){
    this.dashboradService.removeFilterLabel.next({item,index})
  }

  previewPlant(plant: any, site: any) {
    const dialogRef = this.dialog.open(PreviewDashboardPlantComponent, {
      data: { plant: plant, site: site }, width: '43rem', autoFocus: false, disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'success') {
        this.dashboradService.getAllSitesPlantList({}, this.siteId)
      }
      this.dashboradService.plantDetails = '';
    });
  }

  ngOnDestroy() {
    this.dashboradService.allSiteData = []
    this.dashboradService.displaySiteData = []
    this.dashboradService.allPlantSiteData = []
    this.dashboradService.displayPlantSiteData = []
  }
}
