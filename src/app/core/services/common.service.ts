import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Util } from '../resource/utils';
import { Subject } from 'rxjs';
import { EndUserService } from './end-user.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
	public isDesktop:any
  utilObj = new Util();
  public localStorageSubject = new Subject<void>();
  localStorageSubject$ = this.localStorageSubject.asObservable();
  public loginUserDetail:any
  public siteIdList:any
  public userCount:any
  public requestCount:any
  public userSiteList:any
  public searchSiteList:any
  public search:any
  public usrpermission:any
  resourcePlannerSub: Subject<any> = new Subject()
  constructor(
    private deviceService: DeviceDetectorService,
    public route:Router,
    public toastr: ToastrService,
    public endUserService:EndUserService,
    ) { 
    this.loginUserDetail = this.utilObj.getLoginUser();
	  this.deviceCheck()
  }
  deviceCheck(){
    this.isDesktop = this.deviceService.isDesktop();
  }
  noWhitespace(c: any): any {
		if (c.value) {
			let isWhitespace = (c.value || '').trim().length === 0;
			let isValid = !isWhitespace;
			return isValid ? null : { 'whitespace': true }
		}
	}

  ApiErrAlert(result:any){
    if(result.status == '401'){
      Swal.fire({
        icon: "error",
        text: result.message,
        width: '27rem',
        confirmButtonText:'Ok',
        confirmButtonColor: 'rgb(223,129,62)',
      }).then((result) => {
				localStorage.removeItem('user_details')
        this.route.navigate(['/login'])
			});
    }else{
      this.Alert(result.message,'error');
    }
  }
  Alert(text:any,icon:any){
    Swal.fire({
      icon: icon,
      text: text,
      confirmButtonColor: 'rgb(223,129,62)',
      width: '27rem',
    });
  }
  successAlert(text:any){
    this.toastr.show(text)
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  siteNameList(usrId?:any){
    this.endUserService.siteNameList({usrId:usrId,siteType:[0,1]}).subscribe((result:any)=>{
      if (result.status == '200' ){
        let site:any = []
        usrId ? this.userSiteList = result.data : ''
        result.data.map((val:any)=> {
          site.push(val.siteId)
        })
        site.length ? this.siteUserRequestList(site) : ''
        site = []
      }else{
        this.ApiErrAlert(result)
      }
    })
  }
  searchFilterSiteList(){
    this.endUserService.siteNameList({siteType:[0,1]}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.searchSiteList = result.data
      }else{
        this.ApiErrAlert(result)
      }
    })
  }


  siteUserRequestList(siteId:any){
    this.endUserService.siteUserRequestList({type :2,siteIds:siteId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.requestCount = result.data.length
      }else{
        this.ApiErrAlert(result)
      }
    })
  }

  updateLocalStorage(data:any){
    var userDetails = this.utilObj.getLoginUser()
     data.filter((item:any)=>{
      if(item.usrId == userDetails.usrId){
        userDetails.usrFirstname = item.usrFirstname
        userDetails.usrLastname = item.usrLastname
        userDetails.imageUrl = item.imageUrl
      }
    })
      this.utilObj.setLoginUser(userDetails)
      this.localStorageSubject.next();
  }

  getUserAccess(){
    this.endUserService.getUserAccess({usrId:this.utilObj.getLoginUser().usrId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.usrpermission = result.data[0] 
      }else{
        this.ApiErrAlert(result)
      }
    })
  }
 

}
