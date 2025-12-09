import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SettingService } from '../../setting.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { SlideInOutAnimation } from 'src/app/core/resource/animations';

@Component({
  selector: 'app-add-update-setting',
  templateUrl: './add-update-setting.component.html',
  styleUrls: ['./add-update-setting.component.scss'],
  animations:[SlideInOutAnimation]
})
export class AddUpdateSettingComponent {
  @Output() isClose = new EventEmitter<boolean>();
  @Input() sectionType:any 
  @Input() settingData:any 

  public closePopup:boolean = true
  public addEditRoleGrp:any
  constructor(
    public fb: FormBuilder,
    public settingService:SettingService,
    public commonService:CommonService
    ) {}
  ngOnInit(){
    this.addEditRoleGrp = this.fb.group({
      settingName : [this.settingData.settingName,[Validators.required]],
    })
  }
  ngOnChanges(changes: SimpleChanges|any){
    if(this.addEditRoleGrp){
      this.addEditRoleGrp.controls['settingName'].setValue(this.settingData.settingName)
      this.addEditRoleGrp.controls['settingName'].markAsUntouched('')
    }
    
  }
  addSettings(value:any){
    this.settingService.settingType(this.sectionType,'add',value)
    this.addEditRoleGrp.controls['settingName'].setValue('')
    this.addEditRoleGrp.controls['settingName'].markAsUntouched('')
    this.isClose.emit(false)
  }
  editSettings(value:any){
    value['settingId']=this.settingData.settingId;
    this.settingService.settingType(this.sectionType,'add',value)
    this.addEditRoleGrp.controls['settingName'].setValue('')
    this.addEditRoleGrp.controls['settingName'].markAsUntouched('')
    this.isClose.emit(false)
  }
  close(){
    this.closePopup = false
    this.isClose.emit(false)
  }
  getErrorMessage(type:any) {
		switch (type) {
      case "setting":
				return this.addEditRoleGrp.get('settingName').hasError('required') || this.addEditRoleGrp.get('settingName').hasError('whitespace') ?  `${this.sectionType} is required` : '';
			default:
				return '';
		}
	}
}
