import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Util } from 'src/app/core/resource/utils';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonService } from 'src/app/core/services/common.service';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import * as Global from '../../../../environments/environment'
import { ImageCheckService } from 'src/app/core/services/image-check.service';
@Component({
  selector: 'app-left-site-menu',
  templateUrl: './left-site-menu.component.html',
  styleUrls: ['./left-site-menu.component.scss']
})
export class LeftSiteMenuComponent {
  utilObj = new Util();
  public currentRouteName:any
  baseUrl = Global.environment.BASE_URL
  imageAvailable: boolean | null = null;
  constructor(
    public authService:AuthService,
    public dashboradService:DashboradService,
    public commonService:CommonService,
    public router: Router,
    public imageCheckService:ImageCheckService
    ){
      this.commonService.loginUserDetail = this.utilObj.getLoginUser();
      this.currentRouteName = this.router.url.replace(/\//g, '');
      this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd | any) => {
        this.currentRouteName = event.url.replace(/\//g, '');
        (this.currentRouteName != 'login' && this.currentRouteName != 'forgot-password' && this.currentRouteName != 'reset-password') && (this.currentRouteName == 'dashboard' || !this.commonService.requestCount) ? this.commonService.siteNameList(this.commonService.loginUserDetail['usrId']) : ''
      });
      
  }
  ngOnInit(): void {
    // const url = this.baseUrl + this.commonService.loginUserDetail.compImageUrl
    const url = `${this.baseUrl}/${this.commonService.loginUserDetail.compImageUrl}`
    this.imageCheckService.isImageAvailable(url).then((isAvailable) =>{
      this.imageAvailable = isAvailable
    });
  }
  hideNav(){
    this.currentRouteName != 'dashboard' ? this.commonService.siteNameList(this.commonService.loginUserDetail['usrId']) : ''
  }
  logoutUser(){
    this.authService.logoutUser()
  }
}
