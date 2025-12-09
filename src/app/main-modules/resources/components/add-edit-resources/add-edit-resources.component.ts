import { Component, ElementRef, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/core/services/common.service';
import { ResourceService } from '../../add-resources-service/resource.service';
import * as Global from '../../../../../environments/environment'
import { EndUserService } from 'src/app/core/services/end-user.service';
import { SiteService } from 'src/app/main-modules/sites/site-service/site.service';
import Swal from 'sweetalert2';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Util } from 'src/app/core/resource/utils';
import { DatePipe } from '@angular/common';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import imageCompression from 'browser-image-compression';
import { LoaderService } from 'src/app/core/services/loader.service';

const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD   /   MM   /  YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};
@Component({
  selector: 'app-add-edit-resources',
  templateUrl: './add-edit-resources.component.html',
  styleUrls: ['./add-edit-resources.component.scss'],
  providers:[
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class AddEditResourcesComponent {
  public imageUrl:any
  public selectedDate:any
  public addUpdateUserGrp:any
  public from:any
  public userEditData:any
  public uploadedFile:any
  public EditImages:any
  public selectedTrainingRecords:any
  public selectedLicences:any
  public selectedCompetencies:any
  public tabName:any = 'Resource'
  public userLicencesListSubjDestroy:any
  public userTrainingListSubjDestroy:any
  public userCompetenciesListSubjDestroy:any
  public saveType:any
  public isAdminChecked = false
  public isKeelChecked = false
  public imageSizeOverOneMB:any = false
  utilObj = new Util();
  previousTab:any 
  currentTab:any = this.resourceService.selectedTabIndex
  public userDetails =this.utilObj.getLoginUser();
  @ViewChildren(MatDatepicker) datepicker: QueryList<MatDatepicker<Date>>|any;
  baseUrl = Global.environment.BASE_URL;
  constructor(
    public dialogRef: MatDialogRef<AddEditResourcesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public commonService:CommonService,
    public resourceService:ResourceService,
    public endUserService:EndUserService,
    public siteService:SiteService,
    public datePipe: DatePipe,
    public dashboradService:DashboradService,
    public loaderService:LoaderService
    ){}
  ngOnInit(){
    this.from = this.data.from
    this.userEditData = this.data.userData
    this.dashboradService.siteNameList()
    this.resourceService.roleList ? '' : this.resourceService.getRoleList()
    this.selectedTrainingRecords = ''
    this.selectedCompetencies = ''
    this.selectedLicences = ''
    this.userLicencesListSubjDestroy = this.resourceService.userLicencesListSuccess$.subscribe(() => {
      this.selectedLicences = this.resourceService.userLicences
      this.resourceService.licencesList.forEach((selectedItem:any, selectedIndex:any) => {
        const correspondingIndex = this.resourceService.userLicences.findIndex((item:any) => item.licId === selectedItem.licId);
        if (correspondingIndex !== -1) {
          this.resourceService.userLicences[correspondingIndex].ulExpiredate = this.parseDate(this.resourceService.userLicences[correspondingIndex].ulExpiredate)
          this.resourceService.licencesList[selectedIndex] = this.resourceService.userLicences[correspondingIndex];
        }
      });
    });
    this.userTrainingListSubjDestroy = this.resourceService.userTrainingListSuccess$.subscribe(() => {
      this.selectedTrainingRecords = this.resourceService.userTrainingRecord
      this.resourceService.trainingList.forEach((selectedItem:any, selectedIndex:any) => {
        const correspondingIndex = this.resourceService.userTrainingRecord.findIndex((item:any) => item.trId === selectedItem.trId);
        if (correspondingIndex !== -1) {
          this.resourceService.userTrainingRecord[correspondingIndex].utrExpiredate = this.parseDate(this.resourceService.userTrainingRecord[correspondingIndex].utrExpiredate)
          this.resourceService.trainingList[selectedIndex] = this.resourceService.userTrainingRecord[correspondingIndex];
        }
      });
    });
    this.userCompetenciesListSubjDestroy = this.resourceService.userCompetenciesListSuccess$.subscribe(() => {
      this.selectedCompetencies = this.resourceService.userCompetencies
        this.resourceService.competenciesList.forEach((selectedItem:any, selectedIndex:any) => {
          const correspondingIndex = this.resourceService.userCompetencies.findIndex((item:any) => item.comptId === selectedItem.comptId);
          if (correspondingIndex !== -1) {
            this.resourceService.userCompetencies[correspondingIndex].ucExpiredate = this.parseDate(this.resourceService.userCompetencies[correspondingIndex].ucExpiredate)
            this.resourceService.competenciesList[selectedIndex] = this.resourceService.userCompetencies[correspondingIndex];
          }
        });
    });
    if(this.from == 'edit'){
      this.resourceService.userId = this.userEditData.usrId
      this.resourceService.userTrainingRecordList(this.data.userData.usrId)
      this.resourceService.userLicencesList(this.data.userData.usrId)
      this.resourceService.userCompetenciesList(this.data.userData.usrId)
    }
    this.addUpdateUserGrp = this.fb.group({
      usrFirstname:[this.from == 'edit' ? this.userEditData.usrFirstname : '' ,[Validators.required,this.commonService.noWhitespace,Validators.maxLength(50)]],
      usrLastname:[this.from == 'edit' ? this.userEditData.usrLastname : '',[Validators.required,this.commonService.noWhitespace,Validators.maxLength(50)]],
      usrEmail:[ this.from == 'edit' ? this.userEditData.usrEmail : '' ,[Validators.email ]],
      usrPhone:[this.from == 'edit' ? this.userEditData.usrPhone : '',[Validators.pattern(/^\d+$/)]],
      usrLocation:[this.from == 'edit' ? this.userEditData.usrLocation : '',[]],
      roleId:[this.from == 'edit' ? this.userEditData.roleId : '',[]],
      siteId:[{value:this.from == 'edit' ? this.userEditData.siteId : '', disabled:this.data.from == 'edit' && this.userEditData.siteId},[Validators.required]],
      usrType:[this.from == 'edit' ? this.userEditData.usrType == 2 ? true : false : false,[]],
      usrKeelAccount:[this.from == 'edit' ? this.userEditData.usrKeelAccount == 1 ? true : false : false],
      plannerPermission:[this.from == 'edit'? this.userEditData.usrPlannerAccess :  0],
      readWritePermission:[ this.from === 'edit' ? (this.userEditData.usrPlannerAccess === 0 ? 1 : this.userEditData.usrPlannerAccess) : 1],
      sendInvitation:[]
    })
    const shouldRequireEmail = this.userEditData.usrType == 2 || this.userEditData.usrKeelAccount == 1;
    if (shouldRequireEmail) {
      this.addUpdateUserGrp.get('usrEmail')?.setValidators([
        Validators.required,
        Validators.email
      ]);
      this.addUpdateUserGrp.get('usrEmail')?.updateValueAndValidity();
    }
    this.userEditData && this.userEditData.imageUrl ? this.EditImages = this.baseUrl+this.userEditData.imageUrl : ''    
  }

  tabChange($event:any){
    this.previousTab = this.currentTab;
    this.currentTab = this.resourceService.selectedTabIndex;
    if(!this.isFormSave() && this.saveType != 'next'){
      Swal.fire({
        icon: "error",
        text: 'Looks like you have selected a record, please click on update and then move to the next tab or else the data will not be saved.',
        width: '27rem',
        confirmButtonText:'Go back',
        confirmButtonColor: 'rgb(223,129,62)',
        showCancelButton:true,
        cancelButtonText:'Move to next',
      }).then((result) => {
        if(result.isConfirmed){
          this.resourceService.selectedTabIndex = this.previousTab
        }else{
          if(this.previousTab == 1){
            this.selectedTrainingRecords = this.resourceService.userTrainingRecord
            this.resourceService.trainingList?.forEach((element:any) => {
              const foundTraining = this.resourceService.userTrainingRecord?.find((tr:any) =>{return tr.trId == element.trId})
              if(foundTraining == undefined){
                element.isRowSelected = true
                element.utrExpiredate = ''
                element.utrNeverExpire = 0
              }
            });
          }else if(this.previousTab == 2){
            this.selectedLicences = this.resourceService.userLicences
            this.resourceService.userLicences?.forEach((element:any) => {
              const foundTraining = this.resourceService.userLicences?.find((tr:any) =>{return tr.licId == element.licId})
              if(foundTraining == undefined){
                element.isRowSelected = true
                element.ulExpiredate = ''
                element.ulNeverExpire = 0
              }
            });
          }else if(this.previousTab == 3){
            this.selectedCompetencies = this.resourceService.userCompetencies
            this.resourceService.userCompetencies?.forEach((element:any) => {
              const foundTraining = this.resourceService.competenciesList?.find((tr:any) =>{return tr.comptId == element.comptId})
              if(foundTraining == undefined){
                element.isRowSelected = true
                element.ucExpiredate = ''
                element.ucNeverExpire = 0
              }
            });
          }
        }
			});
    }
    this.saveType = ''
    if(!this.addUpdateUserGrp.valid || !this.resourceService.userId){
      this.resourceService.selectedTabIndex = 0
      Swal.fire({
        icon: "error",
        text: 'Please first fill and save personal details',
        width: '27rem',
        confirmButtonText:'Ok',
        confirmButtonColor: 'rgb(223,129,62)',
      }).then((result) => {
        this.commonService.markFormGroupTouched(this.addUpdateUserGrp)
			});
    }
     this.resourceService.selectedTabIndex == 0 ? this.tabName = 'Resource' : this.tabName = $event.tab.textLabel
  }

  isFormSave(){
      switch(this.previousTab) {
        case 1:
          if(this.selectedTrainingRecords && this.resourceService.userTrainingRecord){
            if(this.selectedTrainingRecords.length  == this.resourceService.userTrainingRecord.length) return true
            return false;
          }
          return true
        case 2:
          if(this.selectedLicences && this.resourceService.userLicences){
            if(this.selectedLicences.length == this.resourceService.userLicences.length) return true
            return false;
          }
          return true
        case 3:
          if(this.selectedCompetencies && this.resourceService.userCompetencies){
            if(this.selectedCompetencies.length == this.resourceService.userCompetencies.length) return true
            return false;
          }
          return true
        default:
          return true
      }
  }

  AddUpdateResourceData(value:any,type:any){
    this.saveType = type
    !this.addUpdateUserGrp.valid ? this.commonService.markFormGroupTouched(this.addUpdateUserGrp) : ''
      switch(this.resourceService.selectedTabIndex) {
        case 0:
          this.addUpdateUserGrp.valid ? this.AddUpdateCustomer(value,type) : this.commonService.markFormGroupTouched(this.addUpdateUserGrp)
        break;
        case 1:
          const updatedTraining = this.selectedTrainingRecords.length ? this.selectedTrainingRecords.map((val:any) => ({ ...val, usrId: this.resourceService.userId, utrExpiredate: this.formatDate(val)})) : []
          const isValidTr = updatedTraining.every((val:any) => val.utrExpiredate || val.utrNeverExpire != 0)
            isValidTr ? this.resourceService.updateUserTrainingRecord(updatedTraining,this.resourceService.userId,type) : this.commonService.Alert('Please select one between date or checkbox of selected training records','error')
        break;
        case 2:
            const updatedLicences = this.selectedLicences.length ? this.selectedLicences.map((val:any) => ({ ...val, usrId: this.resourceService.userId,ulExpiredate: this.formatDate(val) })) : []
            const isValidLi = updatedLicences.every((val:any) => val.ulExpiredate || val.ulNeverExpire != 0)
            isValidLi ? this.resourceService.updateUserLicences(updatedLicences,this.resourceService.userId,type) : this.commonService.Alert('Please select one between date or checkbox of selected Licences','error')
        break;
        case 3:
            const updatedCompetencies = this.selectedCompetencies.length ? this.selectedCompetencies.map((val:any) => ({ ...val, usrId: this.resourceService.userId,ucExpiredate:this.formatDate(val) })) : []
            const isValidCo = updatedCompetencies.every((val:any) => val.ucExpiredate || val.ucNeverExpire != 0)
            isValidCo ? this.resourceService.updateUserCompetencies(updatedCompetencies,this.resourceService.userId,type) : this.commonService.Alert('Please select one between date or checkbox of selected Competencies','error')
        break;
      }
  }
  selectRow($event:any,data:any){
    data['isRowSelected'] ? data['isRowSelected'] = false : data['isRowSelected'] = true
    switch(this.resourceService.selectedTabIndex) {
      case 1:
        data.utrExpiredate = ''
        data.utrNeverExpire = 0
        break;
      case 2:
          data.ulExpiredate = ''
          data.ulNeverExpire = 0
          break; 
      case 3:
        data.ucExpiredate = ''
        data.ucNeverExpire = 0
        break;
      }
  }

  AddUpdateCustomer(value:any,type:any){
    // let updatedData = this.getUpdatedValues(this.addUpdateUserGrp);
    let fd = new FormData()
    if(this.from == "edit" || this.resourceService.userId){
      fd.append('usrId',this.userEditData.usrId ? this.userEditData.usrId : this.resourceService.userId) 
    }
    
    value.siteId ? fd.append('siteId',value.siteId || '') : ''
    let siteIndex = this.utilObj.getIndexOfArrayData(this.dashboradService.siteList,'siteId',value.siteId ? value.siteId : this.userEditData.siteId)
    siteIndex != -1 ? fd.append('receiverId',this.dashboradService.siteList[siteIndex].usrId || '') : ''
    fd.append('usrFirstname',value.usrFirstname || '')
    fd.append('usrLastname',value.usrLastname || '')
    fd.append('usrKeelAccount',value.usrKeelAccount ? '1' : '0');//send mail to user
    if(this.from == 'edit' && ((value.usrKeelAccount && this.addUpdateUserGrp.controls['usrKeelAccount'].dirty) || (value.usrType && this.addUpdateUserGrp.controls['usrType'].dirty) || value.sendInvitation)) fd.append('sendMail', '1');
    if(this.addUpdateUserGrp.controls['usrEmail'].dirty) fd.append('usrEmail', value.usrEmail || '')
    fd.append('usrPhone',value.usrPhone || '')
    fd.append('usrLocation',value.usrLocation || '')
    fd.append('usrPlannerAccess',!value.plannerPermission ? Number(value.plannerPermission) : value.readWritePermission || 1)
    fd.append('roleId',value.roleId || 0)
    if(this.data.userData.usrType == 1){
      fd.append('usrType','1') 
    }else{
      fd.append('usrType',value.usrType == true ? '2' : '3') 
    }
    if(this.from == 'edit' && this.uploadedFile != undefined){
    if(this.from == 'edit' && this.uploadedFile && !this.userEditData.imageUrl){
      this.uploadedFile ? fd.append('image',this.uploadedFile) : ''
    }else if(this.from == 'edit' && this.userEditData.imageUrl && this.uploadedFile){
      fd.append('deleteImage','1')
      fd.append('usrOldImage',this.userEditData.usr_image)
      fd.append('image',this.uploadedFile) 
    }else if(!this.uploadedFile && this.userEditData.imageUrl ){
      fd.append('deleteImage','1')
      fd.append('usrOldImage',this.userEditData.usr_image)
    }
  }else if(this.from == 'add' && this.uploadedFile){
   fd.append('image',this.uploadedFile) 
  }
    this.resourceService.addOrUpdateUser(fd,type)
  }

  selectCheckbox($event:any,data:any){
      switch(this.resourceService.selectedTabIndex) {
        case 1:
              if($event.checked){
                delete data.utrExpiredate
                data.utrNeverExpire = 1
              }
          break;
        case 2:
              if($event.checked){
                delete data.ulExpiredate
                data.ulNeverExpire = 1 
              }
          break;
        case 3:
              if($event.checked){
                delete data.ucExpiredate
                data.ucNeverExpire =1
              }
          break;
        default:
      }
  }

  selectDate($event:any,data:any){
    switch(this.resourceService.selectedTabIndex) {
      case 1:
            if($event){
              delete data.utrNeverExpire
            }
        break;
      case 2:
            if($event){
              delete data.ulNeverExpire
            }
        break;
      case 3:
            if($event){
              delete data.ucNeverExpire
            }
        break;
      default:
    }
  }

  formatDate(Date:any){
    if((Date.utrExpiredate || Date.ulExpiredate || Date.ucExpiredate)  && moment(Date.utrExpiredate ? Date.utrExpiredate : Date.ulExpiredate ? Date.ulExpiredate : Date.ucExpiredate ? Date.ucExpiredate : '', 'DD-MMM-YYYY', true).isValid()){
      return this.resourceService.selectedTabIndex == 1 ? moment(Date.utrExpiredate).format("DD-MM-YYYY") : this.resourceService.selectedTabIndex == 2 ? moment(Date.ulExpiredate).format("DD-MM-YYYY") : this.resourceService.selectedTabIndex == 3 ? moment(Date.ucExpiredate).format("DD-MM-YYYY") : ''
    }else if(this.from == 'edit'){
      switch(this.resourceService.selectedTabIndex) {
        case 1:
            return Date.utrExpiredate
        case 2:
            return Date.ulExpiredate
        case 3:
            return Date.ucExpiredate
        }
    }
    return ''
  }

  onFileSelected(event: any) {
    const file: File = event?.target?.files?.[0];
    // const fileSize = event.target.files[0].size / (1024 * 1024)
    const fileSizeMB = file?.size / (1024 * 1024);
    if (fileSizeMB >= 2) {
      this.imageSizeOverOneMB = true;
      return; // 🚫 Stop further processing
    } else {
      this.imageSizeOverOneMB = false;
    }
    if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) ) {
       this.loaderService.show()
      const options = {
        maxSizeMB: 0.2,            // Smaller max size in MB (~200 KB)
        maxWidthOrHeight: 800,     // Resize to max 800px on longest side
        useWebWorker: true,
        initialQuality: 0.5
      };
      imageCompression(file, options)
        .then((compressedFile: any) => {
          if (!(compressedFile instanceof File)) {
            this.uploadedFile = new File(
              [compressedFile],
              file.name,
              { type: compressedFile.type }
            );
          } else {
            this.uploadedFile = compressedFile;
          }
          this.from == 'edit' ? this.EditImages = '' : '';
          const compressedReader = new FileReader();
          compressedReader.onload = () => {
            this.imageUrl = compressedReader.result;
             this.loaderService.hide()
          };
          compressedReader.readAsDataURL(compressedFile);
        })
        .catch(error => {
          console.error('Compression error:', error);
          this.commonService.Alert('Image compression failed.', 'error');
          this.loaderService.hide()
        });
        
      // reader.readAsDataURL(file);
      // this.uploadedFile = file
      // this.from == 'edit' ? this.EditImages = '' : ''
    } else {
      this.commonService.Alert("Invalid filetype upload. Please make sure you are only uploading 'jpg, png, jpeg' formats.", 'error')
    }
  }

  openDatepicker(datepicker: MatDatepicker<any>) {
    datepicker.open();
  } 

  parseDate(dateString: string): any {
    if(dateString){
    const parts = moment(dateString, 'DD-MMM-YYYY', true).isValid() ? moment(dateString).format("DD-MM-YYYY").split('-') :  dateString.split('-');
    const year = +parts[2];
    const month = +parts[1] - 1;
    const day = +parts[0];
    return new Date(year, month, day);
    }
  }

  isAdminFn($event:any){
    this.isAdminChecked = $event.checked
    if($event.checked){
      this.addUpdateUserGrp.get('usrEmail').setValidators([Validators.required,this.commonService.noWhitespace,Validators.email])
      this.addUpdateUserGrp.controls["usrEmail"].updateValueAndValidity();
    }else if(!this.isKeelChecked && !this.isAdminChecked && this.userEditData.usrKeelAccount != 1){
      this.addUpdateUserGrp.get('usrEmail').setValidators(this.commonService.noWhitespace,Validators.email)
      this.addUpdateUserGrp.controls["usrEmail"].updateValueAndValidity();
    }
  }
  isKeelUserFn($event:any){
    this.isKeelChecked = $event.checked
    if($event.checked){
      this.addUpdateUserGrp.get('usrEmail').setValidators([Validators.required,this.commonService.noWhitespace,Validators.email])
      this.addUpdateUserGrp.controls["usrEmail"].updateValueAndValidity();
    }else if(!this.isKeelChecked && !this.isAdminChecked && this.userEditData.usrKeelAccount != 1){
      this.addUpdateUserGrp.get('usrEmail').setValidators(this.commonService.noWhitespace,Validators.email)
      this.addUpdateUserGrp.controls["usrEmail"].updateValueAndValidity();
    }
  }
  removeImage(){
    this.imageUrl = null;
    this.uploadedFile = ''
    this.EditImages = ''
    this.imageSizeOverOneMB = false
  }

  closeDialog(){
    this.previousTab = this.resourceService.selectedTabIndex
    if(!this.isFormSave()){
      Swal.fire({
        icon: "error",
        text: 'Looks like you have unsaved data here. Do you want to save data or close the pop up?',
        width: '27rem',
        confirmButtonText:'Save',
        confirmButtonColor: 'rgb(223,129,62)',
        showCancelButton:true,
        cancelButtonText:'Close',
      }).then((result) => {
        result.isConfirmed ? this.AddUpdateResourceData(this.addUpdateUserGrp.value ,'close') : this.dialogRef.close()
      })
    }else{
      this.dialogRef.close()
    }
  }

  getErrorMessage(type:any) {
		switch (type) {
      case "usrFirstname":
				return this.addUpdateUserGrp.get('usrFirstname').hasError('required') || this.addUpdateUserGrp.get('usrFirstname').hasError('whitespace') ?  'First Name is required' : !this.addUpdateUserGrp.get('usrFirstname').hasError('maxLength') ? 'First name cannot be more than 50 characters.' : '';
			case "usrLastname":
        return this.addUpdateUserGrp.get('usrLastname').hasError('required') || this.addUpdateUserGrp.get('usrLastname').hasError('whitespace') ?  'Last Name is required' : !this.addUpdateUserGrp.get('usrLastname').hasError('maxLength') ? 'Last name cannot be more than 50 characters.' : '';
      case "usrPhone":
				return this.addUpdateUserGrp.get('usrPhone').hasError('pattern')  ?  'Please Enter Valid Phone number' : '';
      case "siteId":
				return this.addUpdateUserGrp.get('siteId').hasError('required')  ?  'Site is required' : '';
			case "usrEmail":
				return this.addUpdateUserGrp.get('usrEmail').hasError('required') || this.addUpdateUserGrp.get('usrEmail').hasError('whitespace') ? 'E-Mail is required' : this.addUpdateUserGrp.get('usrEmail').hasError('email') ? 'Please Enter Valid Mail' : '';
			default:
				return '';
		}
	}
  ngOnDestroy(){
    this.userLicencesListSubjDestroy && this.userLicencesListSubjDestroy.unsubscribe();
    this.userTrainingListSubjDestroy && this.userTrainingListSubjDestroy.unsubscribe()
    this.userCompetenciesListSubjDestroy && this.userCompetenciesListSubjDestroy.unsubscribe()
    this.resourceService.userTrainingRecord = []
    this.resourceService.userCompetencies = []
    this.resourceService.userLicences =[]
  }

}
