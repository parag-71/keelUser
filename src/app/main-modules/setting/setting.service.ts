import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  public allSettingList:any
  constructor(
    public endUserService:EndUserService,
    public commonService:CommonService
    ) { }

    settingType(settingName:any,actionName:any,value?:any){
    switch(actionName) {
      case 'add':
        this.addSetting(settingName,value)
        break;
      case 'delete':
        this.deleteSetting(settingName,value)
        break;
      case 'getList':
        this.settingList(settingName)
        break;
    }
  }
  addSetting(settingName:any,value:any){
    switch(settingName) {
      case 'Role':
        this.addRole(value)
        break;
      case 'Training Record':
        this.addTraining(value)
        break;
      case 'People Licences':
        this.addLicences(value)
        break;
      case 'Plant Licences':
        this.addPlantLicences(value)
        break;
      case 'Competencies':
        this.addCompetencies(value)
        break;
    }
  }

  deleteSetting(settingName:any,value:any){
    switch(settingName) {
      case 'Role':
        this.deleteRole(value)
        break;
      case 'Training Record':
        this.deleteTraining(value)
        break;
      case 'People Licences':
        this.deleteLicences(value)
        break;
      case 'Plant Licences':
        this.deletePlantLicences(value)
        break;
      case 'Competencies':
        this.deleteCompetencies(value)
        break;
    }
  }
  settingList(settingName:any){
    switch(settingName) {
      case 'Role':
        this.getRoleList()
        break;
      case 'Training Record':
        this.getTrainingList()
        break;
      case 'People Licences':
        this.getLicencesList()
        break;
      case 'Plant Licences':
        this.getPlantLicencesList()
        break;
      case 'Competencies':
        this.getCompetenciesList()
        break;
    }
  }

  addRole(value:any){
    this.endUserService.addOrUpdateCompanyRole({roleName:value.settingName.trim(),roleId:value.settingId ? value.settingId : ''}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getRoleList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  deleteRole(value:any){
    this.endUserService.deleteCompanyRole({roleId:value.roleId}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getRoleList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getRoleList(){
    this.endUserService.companyRoleList({}).subscribe((result:any)=>{
      if (result.status == 200){
        this.allSettingList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  addTraining(value:any){
    this.endUserService.addOrUpdateCompanyTrainingRecord({trName:value.settingName.trim(),trId:value.settingId ? value.settingId : ''}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getTrainingList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  deleteTraining(value:any){
    this.endUserService.deleteCompanyTrainingRecord({trId:value.trId}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getTrainingList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getTrainingList(){
    this.endUserService.companyTrainingRecordList({}).subscribe((result:any)=>{
      if (result.status == 200){
        this.allSettingList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  addLicences(value:any){
    this.endUserService.addOrUpdateCompanyLicences({licName:value.settingName.trim(),licId:value.settingId ? value.settingId : ''}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getLicencesList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  deleteLicences(value:any){
    this.endUserService.deleteCompanyLicences({licId:value.licId}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getLicencesList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getLicencesList(){
    this.endUserService.companyLicencesList({}).subscribe((result:any)=>{
      if (result.status == 200){
        this.allSettingList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  addCompetencies(value:any){
    this.endUserService.addOrUpdateCompanyCompetencies({comptName:value.settingName.trim(),comptId:value.settingId ? value.settingId : ''}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getCompetenciesList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  deleteCompetencies(value:any){
    this.endUserService.deleteCompanyCompetencies({comptId:value.comptId}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getCompetenciesList();
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  getCompetenciesList(){
    this.endUserService.companyCompetenciesList({}).subscribe((result:any)=>{
      if (result.status == 200){
        this.allSettingList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  addPlantLicences(value:any){
    this.endUserService.addOrUpdateCompanyPlantLicences({cplName:value.settingName.trim(),cplId:value.settingId ? value.settingId : ''}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getPlantLicencesList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  deletePlantLicences(value:any){
    this.endUserService.deleteCompanyPlantLicences({cplId:value.cplId}).subscribe((result:any)=>{
      if (result.status == 200){
        this.getPlantLicencesList()
        this.commonService.successAlert(result.message)
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getPlantLicencesList(){
    this.endUserService.companyPlantLicencesList({}).subscribe((result:any)=>{
      if (result.status == 200){
        this.allSettingList = result.data
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
}
