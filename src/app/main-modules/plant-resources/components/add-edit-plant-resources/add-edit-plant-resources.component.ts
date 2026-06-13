import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/core/services/common.service';
import { PlantResourceService } from '../../plant-resource-service/plant-resource.service';
import * as Global from '../../../../../environments/environment'
import { EndUserService } from 'src/app/core/services/end-user.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { Util } from 'src/app/core/resource/utils';
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
  selector: 'app-add-edit-plant-resources',
  templateUrl: './add-edit-plant-resources.component.html',
  styleUrls: ['./add-edit-plant-resources.component.scss'],
  providers:[
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class AddEditPlantResourcesComponent {
  public imageUrl:any
  public addUpdatePlantGrp:any
  public from:any
  public plantEditData:any
  public uploadedFile:any
  public EditImages:any
  public imageSizeOverOneMB:any = false
  public selectedTabIndex:any = 0
  public selectedSafety:any = []
  public safety:any = []
  public safetyInput:any = ''
  public tags:any = []
  public tagInput:any = ''
  public originalSafety:any = []
  public originalTags:any = []
  utilObj = new Util();
  baseUrl = Global.environment.BASE_URL;
  constructor(
    public dialogRef: MatDialogRef<AddEditPlantResourcesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public commonService:CommonService,
    public plantResourceService:PlantResourceService,
    public endUserService:EndUserService,
    public dashboradService:DashboradService,
    public loaderService:LoaderService
    ){}

  ngOnInit() {
    this.from = this.data.from
    this.plantEditData = this.data.plantData || {}

    this.addUpdatePlantGrp = this.fb.group({
      pltTitle: [this.from == 'edit' ? this.plantEditData.pltTitle : '', [Validators.required, this.commonService.noWhitespace, Validators.maxLength(100)]],
      pltCode: [this.from == 'edit' ? this.plantEditData.pltCode : '', [Validators.maxLength(50)]],
      pltCompany: [this.from == 'edit' ? this.plantEditData.pltCompany : '', [Validators.required, this.commonService.noWhitespace, Validators.maxLength(100)]],
      siteId:[{value:this.from == 'edit' ? this.plantEditData.siteId : '', disabled:this.from == 'edit'},[Validators.required]],
      pltAttachment: [this.from == 'edit' ? this.plantEditData.pltAttachment : '', []],
      pltServiceNote: [this.from == 'edit' ? this.plantEditData.pltServiceNote : '', []],
    })
    this.plantEditData && this.plantEditData.imageUrl ? this.EditImages = this.baseUrl + this.plantEditData.imageUrl : ''

    // Defer API calls one tick so the global loader (toggled by the HTTP interceptor) does not
    // change during the dialog's first change-detection pass — avoids NG0100.
    setTimeout(() => {
      this.dashboradService.siteNameList()
      if (this.from == 'edit') {
        this.plantResourceService.plantId = this.plantEditData.pltId
        this.getPlantSafetyList(() => {
          this.getPlantDetails(this.plantEditData.pltId)
          this.getPlantAssignedLicences(this.plantEditData.pltId)
        })
      } else {
        this.getPlantSafetyList()
      }
    }, 0)
  }

  getPlantSafetyList(afterLoad?:any){
    this.endUserService.companyPlantLicencesList({}).subscribe((result:any)=>{
      if(result.status == '200'){
        this.plantResourceService.safetyList = (result.data || []).map((row:any)=>({
          ...row, isRowSelected:true, pltExpiredate:'', pltNeverExpire:0
        }))
        afterLoad ? afterLoad() : ''
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  getPlantDetails(pltId:any){
    this.endUserService.plantDetails({pltId:pltId}).subscribe((result:any)=>{
      if(result.status == '200'){
        const details = result.data
        this.plantEditData = details
        this.addUpdatePlantGrp.patchValue({
          pltTitle: details.pltTitle,
          pltCode: details.pltCode,
          pltCompany: details.pltCompany,
          siteId: details.siteId,
          pltAttachment: details.pltAttachment,
          pltServiceNote: details.pltServiceNote,
        })
        details.imageUrl ? this.EditImages = this.baseUrl+details.imageUrl : ''
        this.tags = Array.isArray(details.tagData) ? details.tagData.map((t:any)=> t.pt_tag) : []
        this.safety = Array.isArray(details.safetyData) ? details.safetyData.map((s:any)=> s.ps_safety) : []
        this.originalSafety = [...this.safety]
        this.originalTags = [...this.tags]
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  applySafetySelection(licences:any){
    const selMap:any = {}
    ;(licences || []).forEach((s:any)=>{ selMap[s.cplId] = s })
    this.selectedSafety = []
    this.plantResourceService.safetyList.forEach((row:any)=>{
      const sel = selMap[row.cplId]
      if(sel){
        row.isRowSelected = false
        row.pltNeverExpire = sel.plNeverExpire == 1 ? 1 : 0
        row.pltExpiredate = sel.plNeverExpire == 1 ? '' : this.parseDate(sel.plExpiredate)
        this.selectedSafety.push(row)
      }
    })
  }

  // Load licences already assigned to this plant and pre-select them in the table (edit mode).
  getPlantAssignedLicences(pltId:any){
    this.endUserService.plantResourceLicencesList({pltId:pltId}).subscribe((result:any)=>{
      if(result.status == '200'){
        this.applySafetySelection(result.data || [])
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }

  selectRow($event:any,data:any){
    data['isRowSelected'] ? data['isRowSelected'] = false : data['isRowSelected'] = true
    data.pltExpiredate = ''
    data.pltNeverExpire = 0
  }

  selectCheckbox($event:any,data:any){
    if($event.checked){
      delete data.pltExpiredate
      data.pltNeverExpire = 1
    }
  }

  selectDate($event:any,data:any){
    if($event){
      delete data.pltNeverExpire
    }
  }

  openDatepicker(datepicker: MatDatepicker<any>) {
    datepicker.open();
  }

  formatSafetyDate(row:any){
    return row && row.pltExpiredate ? moment(row.pltExpiredate).format("YYYY-MM-DD") : ''
  }

  parseDate(dateString: string): any {
    return dateString ? moment(dateString, ['YYYY-MM-DD','DD-MM-YYYY']).toDate() : '';
  }

  addTag(event:any){
    event && event.preventDefault ? event.preventDefault() : ''
    const value = (this.tagInput || '').trim()
    if(value && this.tags.indexOf(value) == -1){
      this.tags.push(value)
    }
    this.tagInput = ''
  }

  removeTag(index:any){
    this.tags.splice(index,1)
  }

  addSafety(event:any){
    event && event.preventDefault ? event.preventDefault() : ''
    const value = (this.safetyInput || '').trim()
    if(value && this.safety.indexOf(value) == -1){
      this.safety.push(value)
    }
    this.safetyInput = ''
  }

  removeSafety(index:any){
    this.safety.splice(index,1)
  }

   onSafetyBackspace(event:any){
    // Empty input + Backspace removes the last chip
    if(!this.safetyInput && this.safety.length){
      this.safety.pop()
    }
  }

  onTagBackspace(event:any){
    if(!this.tagInput && this.tags.length){
      this.tags.pop()
    }
  }

  savePlantLicences(type: any) {
    const pltId = this.plantEditData && this.plantEditData.pltId ? this.plantEditData.pltId : this.plantResourceService.plantId
    if (!pltId) {
      this.commonService.Alert('Please save the plant details first, then add licences.', 'error')
      this.selectedTabIndex = 0
      return
    }
    const licencesData = (this.selectedSafety || []).map((val: any) => {
      const item: any = { cplId: val.cplId }
      if (val.pltNeverExpire == 1) {
        item.plNeverExpire = 1
      } else {
        item.plExpiredate = this.formatSafetyDate(val)
      }
      return item
    })
    const isValid = licencesData.every((v: any) => v.plExpiredate || v.plNeverExpire == 1)
    if (!isValid) {
      this.commonService.Alert('Please select either an expiry date or No expiration date for selected licences', 'error')
      return
    }
    this.plantResourceService.updatePlantResourceLicences(licencesData, pltId, type)
  }

  AddUpdatePlantData(value: any, type: any) {
    // Licences tab (index 1) is saved via the dedicated licence API — same pattern as People.
    if (this.selectedTabIndex == 1) {
      this.savePlantLicences(type)
      return
    }

    if (!this.addUpdatePlantGrp.valid) {
      this.commonService.markFormGroupTouched(this.addUpdatePlantGrp)
      this.selectedTabIndex = 0
      return
    }

    let fd = new FormData()
    const isEdit = this.from == 'edit' || this.plantResourceService.plantId
    if(isEdit){
      fd.append('pltId',this.plantEditData.pltId ? this.plantEditData.pltId : this.plantResourceService.plantId)
    }
    fd.append('pltTitle',value.pltTitle || '')
    fd.append('pltCompany',value.pltCompany || '')
    fd.append('pltCode',value.pltCode || '')
    fd.append('pltAttachment',value.pltAttachment || '')
    fd.append('pltServiceNote',value.pltServiceNote || '')
    // Site is chosen only while ADDING. The update API does not allow siteId/receiverId, so skip both on edit.
    if(!isEdit){
      value.siteId ? fd.append('siteId',value.siteId) : ''
      let siteIndex = this.utilObj.getIndexOfArrayData(this.dashboradService.siteList,'siteId',value.siteId)
      siteIndex != -1 ? fd.append('receiverId',this.dashboradService.siteList[siteIndex].usrId || '') : ''
    }

    // Safety / Tags (per backend contract):
    //  - changed & has items  -> send safetyArray[] / tagArray[]  (backend replaces)
    //  - changed & now empty   -> send deleteSafety / deleteTag = 1 (backend clears)
    //  - unchanged             -> send nothing (absence must NOT be read as "clear")
    const safetyChanged = JSON.stringify([...(this.safety||[])].sort()) !== JSON.stringify([...(this.originalSafety||[])].sort())
    if(safetyChanged){
      if(this.safety && this.safety.length){
        this.safety.forEach((s:any)=> fd.append('safetyArray[]', s))
      }else{
        fd.append('deleteSafety','1')
      }
    }
    const tagsChanged = JSON.stringify([...(this.tags||[])].sort()) !== JSON.stringify([...(this.originalTags||[])].sort())
    if(tagsChanged){
      if(this.tags && this.tags.length){
        this.tags.forEach((t:any)=> fd.append('tagArray[]', t))
      }else{
        fd.append('deleteTag','1')
      }
    }

    // NOTE: The Licences tab (expiry-based table) UI is ready but its backend contract is
    // not finalised yet, so it is intentionally NOT submitted. When the backend is defined,
    // build the payload from `selectedSafety` (cplId + pltExpiredate + pltNeverExpire) and append here.

    if(isEdit && this.uploadedFile != undefined){
      if(this.uploadedFile && !this.plantEditData.imageUrl){
        fd.append('image',this.uploadedFile)
      }else if(this.plantEditData.imageUrl && this.uploadedFile){
        fd.append('deleteImage','1')
        fd.append('pltOldImage',this.plantEditData.plt_image)
        fd.append('image',this.uploadedFile)
      }else if(!this.uploadedFile && this.plantEditData.imageUrl){
        fd.append('deleteImage','1')
        fd.append('pltOldImage',this.plantEditData.plt_image)
      }
    }else if(this.from == 'add' && this.uploadedFile){
      fd.append('image',this.uploadedFile)
    }
    this.plantResourceService.addOrUpdatePlant(fd,type,isEdit)
  }

  onFileSelected(event: any) {
    const file: File = event?.target?.files?.[0];
    const fileSizeMB = file?.size / (1024 * 1024);
    if (fileSizeMB >= 2) {
      this.imageSizeOverOneMB = true;
      return;
    } else {
      this.imageSizeOverOneMB = false;
    }
    if (file && ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type) ) {
      this.loaderService.show()
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 800,
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
    } else {
      this.commonService.Alert("Invalid filetype upload. Please make sure you are only uploading 'jpg, png, jpeg' formats.", 'error')
    }
  }

  removeImage(){
    this.imageUrl = null;
    this.uploadedFile = ''
    this.EditImages = ''
    this.imageSizeOverOneMB = false
  }

  closeDialog(){
    this.dialogRef.close()
  }

  getErrorMessage(type:any) {
    switch (type) {
      case "pltTitle":
        return this.addUpdatePlantGrp.get('pltTitle').hasError('required') || this.addUpdatePlantGrp.get('pltTitle').hasError('whitespace') ? 'Title is required' : this.addUpdatePlantGrp.get('pltTitle').hasError('maxlength') ? 'Title cannot be more than 100 characters.' : '';
      case "pltCompany":
        return this.addUpdatePlantGrp.get('pltCompany').hasError('required') || this.addUpdatePlantGrp.get('pltCompany').hasError('whitespace') ? 'Company is required' : this.addUpdatePlantGrp.get('pltCompany').hasError('maxlength') ? 'Company cannot be more than 100 characters.' : '';
      case "pltCode":
        return this.addUpdatePlantGrp.get('pltCode').hasError('maxlength') ? 'Plant ID cannot be more than 50 characters.' : '';
      case "siteId":
        return this.addUpdatePlantGrp.get('siteId').hasError('required') ? 'Site is required' : '';
      default:
        return '';
    }
  }
}
