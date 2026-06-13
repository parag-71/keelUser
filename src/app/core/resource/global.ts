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



//Plant Resource API
export const addPlant = environment.API_ENDPOINT + "addPlant"
export const plantList = environment.API_ENDPOINT + "plantList"
export const plantDetails = environment.API_ENDPOINT + "plantDetails"
export const updatePlant = environment.API_ENDPOINT + "updatePlant"
export const plantNameList = environment.API_ENDPOINT + "plantNameList"
export const deletePlant = environment.API_ENDPOINT + "deletePlant"
export const updatePlantResourceLicences = environment.API_ENDPOINT + "updatePlantResourceLicences"
export const plantResourceLicencesList = environment.API_ENDPOINT + "plantResourceLicencesList"

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
export const assignUsersInSitesByAdmin = environment.API_ENDPOINT + "assignUsersInSitesByAdmin"


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

//settins Api

//Role
export const addOrUpdateCompanyRole = environment.API_ENDPOINT + "addOrUpdateCompanyRole"
export const companyRoleList = environment.API_ENDPOINT + "CompanyRoleList"
export const deleteCompanyRole = environment.API_ENDPOINT + "deleteCompanyRole"

//training
export const addOrUpdateCompanyTrainingRecord = environment.API_ENDPOINT + "addOrUpdateCompanyTrainingRecord"
export const companyTrainingRecordList = environment.API_ENDPOINT + "CompanyTrainingRecordList"
export const deleteCompanyTrainingRecord = environment.API_ENDPOINT + "deleteCompanyTrainingRecord"

//Licences
export const addOrUpdateCompanyLicences = environment.API_ENDPOINT + "addOrUpdateCompanyLicences"
export const companyLicencesList = environment.API_ENDPOINT + "companyLicencesList"
export const deleteCompanyLicences = environment.API_ENDPOINT + "deleteCompanyLicences"

//Competencies
export const addOrUpdateCompanyCompetencies = environment.API_ENDPOINT + "addOrUpdateCompanyCompetencies"
export const companyCompetenciesList = environment.API_ENDPOINT + "companyCompetenciesList"
export const deleteCompanyCompetencies = environment.API_ENDPOINT + "deleteCompanyCompetencies"

//Plant Licences
export const addOrUpdateCompanyPlantLicences = environment.API_ENDPOINT + "addOrUpdateCompanyPlantLicences"
export const companyPlantLicencesList = environment.API_ENDPOINT + "companyPlantLicencesList"
export const deleteCompanyPlantLicences = environment.API_ENDPOINT + "deleteCompanyPlantLicences"




