import { Injectable } from '@angular/core';
import {  PaginationModal } from 'src/app/core/model/admin-model';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  pagination:any = {index:'0',limit:'25',search:''}
  public usersList:any
  public superAdmin:any
  public usrAdminMergedData:any
  public usersCount:any
  public roleList:any
  public trainingList:any
  public licencesList:any
  public competenciesList:any
  public userCompetencies:any = []
  public userTrainingRecord:any = []
  public userLicences:any = []
  public pageIndex:number = 1
  public userId:any
  public selectedTabIndex:any = 0
  public addResourceSuccessSubject = new Subject<void>();
  public userLicencesListSubject = new Subject<void>();
  public userTrainingListSubject = new Subject<void>();
  public userCompetenciesListSubject = new Subject<void>();
  public editResourceSubject = new Subject<void>();
  public visibleNoDataFound = false
  public superAdminData:any
  editResourceSubject$ = this.editResourceSubject.asObservable();
  userLicencesListSuccess$ = this.userLicencesListSubject.asObservable();
  userTrainingListSuccess$ = this.userTrainingListSubject.asObservable();
  userCompetenciesListSuccess$ = this.userCompetenciesListSubject.asObservable();
  addResourceSuccess$ = this.addResourceSuccessSubject.asObservable();

  constructor(
    public endUserService:EndUserService,
    public commonService:CommonService,
  ) { }

  addOrUpdateUser(fd:any,type:any){
    this.endUserService.addOrUpdateUser(fd).subscribe((result:any)=>{
      if(result.status == '200'){
        this.getUserList('')
        if(type == 'close'){
          this.addResourceSuccessSubject.next();
        }else{
          this.selectedTabIndex = 1
        }
        this.pageIndex = 1
        result.usrId ? this.userId = result.usrId : ''
        this.commonService.successAlert(result.message);
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getUserList(pagination:any){
    let paginationModal =  new PaginationModal()
    paginationModal.search = pagination && pagination.search ? pagination.search : this.commonService.search = ''
    paginationModal.index = pagination && pagination.index ? pagination.index : '0'
    paginationModal.limit = pagination && pagination.limit ? pagination.limit : '25'
    paginationModal.usrType = [2,3]
    this.endUserService.userList(paginationModal).subscribe((result:any)=>{
      if(result.status == '200'){
        this.getSuperAdmin(pagination)
        this.usersList = result.data
        this.commonService.updateLocalStorage(this.usersList)
        this.usersCount = result.totalCount.totalCount
        this.commonService.userCount = this.usersCount;
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getSuperAdmin(pagination:any){
    let paginationModal =  new PaginationModal()
    pagination && pagination.search ? paginationModal.search = pagination.search : ''
    paginationModal.usrType = [1]
    this.endUserService.userList(paginationModal).subscribe((result:any)=>{
      if(result.status == '200'){
        this.superAdminData = result.data
        this.usrAdminMergedData = [...result.data,...this.usersList]
        this.visibleNoDataFound = true
        let indexCounter = 1;
        this.usrAdminMergedData.forEach((item:any, idx:any) => {
        if (item.usrType !== 1) {
          item.index = pagination && pagination.index != 0 ? pagination.index + indexCounter++ : indexCounter++;
        } else {
            item.index = ''; // You can choose to set this to -1 or any other value to indicate it's not indexed
        }
    });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  deleteUser(userData:any){
    this.endUserService.deleteUser({usrId :userData.usrId,usrEmail:userData.usrEmail}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.getUserList('')
        this.commonService.successAlert(result.message)
        this.pageIndex = 1
      }else if(result.status == '403' && result.data.length){
        var Text:any = result.data.map((val:any)=>{return val.siteName})
        Swal.fire({
          icon: 'error',
          html:"<div style='font-size: 15px;font-weight: 500;'>"+result.message+"</div>" +"<div style='font-size: 15px;font-weight: 400;padding-top:10px;'>"+Text+"</div>",
          confirmButtonColor: 'rgb(223,129,62)',
          width: '50rem',
          customClass: {
            popup: 'swal-wide',  // Correct: Use 'popup' to style the popup container
          }
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  changeUserStatus(userData:any){
    this.endUserService.changeUserStatus({usrId :userData.usrId,usrStatus:userData.usrStatus ? '1' : '0'}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getRoleList(){
    this.endUserService.roleList('').subscribe((result:any)=>{
      if (result.status == '200' ){
        this.roleList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getTrainingRecord(){
    this.endUserService.trainingRecordList('').subscribe((result:any)=>{
      if (result.status == '200' ){
        this.trainingList = result.data
        this.trainingList.map((tr:any)=>{
          tr['isRowSelected'] = true
          tr['type'] = 'trainingData'
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getLicencesList(){
    this.endUserService.licencesList('').subscribe((result:any)=>{
      if (result.status == '200' ){
        this.licencesList = result.data
        this.licencesList.map((ls:any)=>{
          ls['isRowSelected'] = true
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getCompetenciesList(){
    this.endUserService.competenciesList('').subscribe((result:any)=>{
      if (result.status == '200' ){
        this.competenciesList = result.data
        this.competenciesList.map((co:any)=>{
          co['isRowSelected'] = true
        });
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }


  updateUserTrainingRecord(value:any,userId:any,type:any){
    this.endUserService.updateUserTrainingRecord({usrId:userId,trainingData:value}).subscribe((result:any)=>{
      if (result.status == '200' ){
        if(type == 'close'){
          this.addResourceSuccessSubject.next()
        }else{
          this.selectedTabIndex = 2
        }
        this.userTrainingRecordList(userId)
        this.commonService.successAlert(result.message);
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  userTrainingRecordList(usrId:any){
    this.endUserService.userTrainingRecordList({usrId:usrId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.userTrainingRecord = result.data
        this.userTrainingRecord.map((tr:any)=>{
          tr['isRowSelected'] = false
        });
        this.userTrainingListSubject.next()
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  updateUserLicences(value:any,userId:any,type:any){
    this.endUserService.updateUserLicences({usrId:userId,licencesData:value}).subscribe((result:any)=>{
      if (result.status == '200' ){
        if(type == 'close'){
          this.addResourceSuccessSubject.next()
        }else{
          this.selectedTabIndex = 3
        }
        this.userLicencesList(userId)
        this.commonService.successAlert(result.message);
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  userLicencesList(usrId:any){
    this.endUserService.userLicencesList({usrId:usrId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.userLicences = result.data
        this.userLicences.map((li:any)=>{
          li['isRowSelected'] = false
        });
        this.userLicencesListSubject.next()
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  updateUserCompetencies(value:any,userId:any,type:any){
    this.endUserService.updateUserCompetencies({usrId:userId,competenciesData:value}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.addResourceSuccessSubject.next()
        this.commonService.successAlert(result.message);
        this.userCompetenciesList(userId)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  userCompetenciesList(usrId:any){
    this.endUserService.userCompetenciesList({usrId:usrId}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.userCompetencies = result.data
        this.userCompetencies.map((co:any)=>{
          co['isRowSelected'] = false
        });
        this.userCompetenciesListSubject.next()
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
}
