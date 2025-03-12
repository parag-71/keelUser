import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import * as Global from './../resource/global';

@Injectable({
  providedIn: 'root'
})
export class EndUserService {

  constructor(public http: HttpService) { }

  login(paramData:any):any{
    return this.http.post(
			Global.login,
			paramData
		);
  }

  logout(paramData:any):any{
    return this.http.post(
			Global.logout,
			paramData
		);
  }

  changeUserPassword(paramData:any):any{
    return this.http.post(
			Global.changeUserPassword,
			paramData
		);
  }

  getUserAccess(paramData:any):any{
    return this.http.post(
			Global.getUserAccess,
			paramData,
      'backgroundApi'
		);
  }

  //Site API Fn
  addOrUpdateSite(paramData:any):any{
    return this.http.post(
			Global.addOrUpdateSite,
			paramData
		);
  }

  siteList(paramData:any):any{
    return this.http.post(
			Global.siteList,
			paramData
		);
  }

  deleteSite(paramData:any):any{
    return this.http.post(
			Global.deleteSite,
			paramData
		);
  }

  //Resource API Fn
  addOrUpdateUser(paramData:any):any{
    return this.http.post(
			Global.addOrUpdateUser,
			paramData
		);
  }
  userList(paramData:any):any{
    return this.http.post(
			Global.userList,
			paramData
		);
  }
  changeUserStatus(paramData:any):any{
    return this.http.post(
			Global.changeUserStatus,
			paramData
		);
  }
  deleteUser(paramData:any):any{
    return this.http.post(
			Global.deleteUser,
			paramData
		);
  }
  userNameList(paramData:any):any{
    return this.http.post(
			Global.userNameList,
			paramData
		);
  }

  updateUserTrainingRecord(paramData:any):any{
    return this.http.post(
			Global.updateUserTrainingRecord,
			paramData
		);
  }

  userTrainingRecordList(paramData:any):any{
    return this.http.post(
			Global.userTrainingRecordList,
			paramData
		);
  }

  updateUserLicences(paramData:any):any{
    return this.http.post(
			Global.updateUserLicences,
			paramData
		);
  }
  userLicencesList(paramData:any):any{
    return this.http.post(
			Global.userLicencesList,
			paramData
		);
  }

  updateUserCompetencies(paramData:any):any{
    return this.http.post(
			Global.updateUserCompetencies,
			paramData
		);
  }

  userCompetenciesList(paramData:any):any{
    return this.http.post(
			Global.userCompetenciesList,
			paramData
		);
  }

  userDetails(paramData:any):any{
    return this.http.post(
			Global.userDetails,
			paramData
		);
  }


  // Role API
  roleList(paramData:any):any{
    return this.http.post(
			Global.roleList,
			paramData
		);
  }

  // training Record
  trainingRecordList(paramData:any):any{
    return this.http.post(
			Global.trainingRecordList,
			paramData
		);
  }

  // licences Record
  licencesList(paramData:any):any{
    return this.http.post(
			Global.licencesList,
			paramData
		);
  }

  // competencies API
  competenciesList(paramData:any):any{
    return this.http.post(
			Global.competenciesList,
			paramData
		);
  }

  //dashboard API
  allSitesUserList(paramData:any):any{
    return this.http.post(
			Global.allSitesUserList,
			paramData
		);
  }

  assignUserInSite(paramData:any):any{
    return this.http.post(
			Global.assignUserInSite,
			paramData
		);
  }

  siteNameList(paramData:any):any{
    return this.http.post(
			Global.siteNameList,
			paramData
		);
  }
  

  //Request
  acceptSiteUser(paramData:any):any{
    return this.http.post(
			Global.acceptSiteUser,
			paramData
		);
  }

  siteUserRequestList(paramData:any):any{
    return this.http.post(
			Global.siteUserRequestList,
			paramData
		);
  }

  cancelSiteUserRequest(paramData:any):any{
    return this.http.post(
			Global.cancelSiteUserRequest,
			paramData
		);
  }
  sentRequestSiteNameList(paramData:any):any{
    return this.http.post(
			Global.sentRequestSiteNameList,
			paramData
		);
  }

  //forgot password
  forgotPassword(paramData:any):any{
    return this.http.post(
			Global.forgotPassword,
			paramData
		);
  }

  resetPassword(paramData:any):any{
    return this.http.post(
			Global.resetPassword,
			paramData
		);
  }


  // request demo 
  requestDemo(paramData:any):any{
    return this.http.post(
			Global.requestDemo,
			paramData
		);
  }

  //Resource Planner
  resourceList(paramData:any):any{
    return this.http.post(
			Global.resourceList,
			paramData
		);
  }
  addOrUpdateResourcePlanner(paramData:any):any{
    return this.http.post(
			Global.addOrUpdateResourcePlanner,
			paramData
		);
  }
  resourcePlannerList(paramData:any):any{
    return this.http.post(
			Global.resourcePlannerList,
			paramData
		);
  }
  deleteResourcePlan(paramData:any):any{
    return this.http.post(
			Global.deleteResourcePlan,
			paramData
		);
  }
 
  //add Dummy Resource
  addOrUpdateDummyUser(paramData:any):any{
    return this.http.post(
			Global.addOrUpdateDummyUser,
			paramData
		);
  }
  DummyUserList(paramData:any):any{
    return this.http.post(
			Global.DummyUserList,
			paramData
		);
  }
  deleteDummyUser(paramData:any):any{
    return this.http.post(
			Global.deleteDummyUser,
			paramData
		);
  }
}





