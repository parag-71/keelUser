import { environment } from "src/environments/environment"

export const base_url = environment.BASE_URL

//System Admin login logout Api 
export const login = environment.API_ENDPOINT + "login"
export const logout = environment.API_ENDPOINT + "logout"
export const changeUserPassword = environment.API_ENDPOINT + "changeUserPassword"
export const getUserAccess = environment.API_ENDPOINT + "getUserAccess"

//site API
export const addOrUpdateSite = environment.API_ENDPOINT + "addOrUpdateSite"
export const siteList = environment.API_ENDPOINT + "siteList"
export const deleteSite = environment.API_ENDPOINT + "deleteSite"

//Resource API 
export const addOrUpdateUser = environment.API_ENDPOINT + "addOrUpdateUser"
export const userList = environment.API_ENDPOINT + "userList"
export const changeUserStatus = environment.API_ENDPOINT + "changeUserStatus"
export const deleteUser = environment.API_ENDPOINT + "deleteUser"
export const userNameList = environment.API_ENDPOINT + "userNameList"
export const userDetails = environment.API_ENDPOINT + "userDetails"

export const updateUserTrainingRecord = environment.API_ENDPOINT + "updateUserTrainingRecord"
export const userTrainingRecordList = environment.API_ENDPOINT + "userTrainingRecordList"

export const updateUserLicences = environment.API_ENDPOINT + "updateUserLicences"
export const userLicencesList = environment.API_ENDPOINT + "userLicencesList"

export const updateUserCompetencies = environment.API_ENDPOINT + "updateUserCompetencies"
export const userCompetenciesList = environment.API_ENDPOINT + "userCompetenciesList"



//role API
export const roleList = environment.API_ENDPOINT + "roleList"

//training Record API
export const trainingRecordList = environment.API_ENDPOINT + "trainingRecordList"

//licences Record API
export const licencesList = environment.API_ENDPOINT + "licencesList"

//competencies Record API
export const competenciesList = environment.API_ENDPOINT + "competenciesList"

//dashboard API 
export const allSitesUserList = environment.API_ENDPOINT + "allSitesUserList"
export const assignUserInSite = environment.API_ENDPOINT + "assignUserInSite"
export const siteNameList = environment.API_ENDPOINT + "siteNameList"

//request API 
export const acceptSiteUser = environment.API_ENDPOINT + "acceptSiteUser"
export const siteUserRequestList = environment.API_ENDPOINT + "siteUserRequestList"
export const cancelSiteUserRequest = environment.API_ENDPOINT + "cancelSiteUserRequest"
export const sentRequestSiteNameList = environment.API_ENDPOINT + "sentRequestSiteNameList"

//Forget Password
export const forgotPassword = environment.API_ENDPOINT + "forgotPassword"
export const resetPassword = environment.API_ENDPOINT + "resetPassword"

//request demo 
export const requestDemo = environment.API_ENDPOINT + "requestDemo"

//resource planner
export const addOrUpdateResourcePlanner = environment.API_ENDPOINT + "addOrUpdateResourcePlanner"
export const resourceList = environment.API_ENDPOINT + "resourceList"
export const resourcePlannerList = environment.API_ENDPOINT + "resourcePlannerList"
export const deleteResourcePlan = environment.API_ENDPOINT + "deleteResourcePlan"

//add Dummy resource
export const addOrUpdateDummyUser = environment.API_ENDPOINT + "addOrUpdateDummyUser"
export const DummyUserList = environment.API_ENDPOINT + "DummyUserList"
export const deleteDummyUser = environment.API_ENDPOINT + "deleteDummyUser"







