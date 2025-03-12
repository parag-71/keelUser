export class LoginModel {
    usrEmail:any
    usrPassword:any
}
export class PaginationModal{
    index:any
    limit:any
    search:any
    usrType:any
    siteType:any
}
export class AddUpdateSiteModal{
    siteName:any
    usrId:any
    siteId:any
    siteLeaderChanged:any
    siteType:any
}
export class AddOrUpdateUser{
    usrId:any
    siteId:any
    roleId:any
    usrFirstname:any
    usrLastname:any
    usrEmail:any
    usrPhone:any
    usrLocation:any
    usrType:any
    createKeelAccount:any
    image:any
    deleteImage:any
    usrOldImage:any
}

export class RequestDemoModel{
    rdCompanyName :any
    rdName : any
    rdEmail : any
    rdPhone : any
    rdComment : any
}