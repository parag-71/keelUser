import { Component } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { SettingService } from '../../setting.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent {
  public inputList:any
  public selectedItem:any = 'Role'
  public role:any
  public addNewRole:any = false
  public ParamName:any = 'roleName'
  public settingId:any = 'roleId'
  public popupType:any
  public settingEditData:any
  constructor(
    public commonService:CommonService,
    public SettingsService:SettingService
  ) {}
  ngOnInit() {
      this.inputList = ['Role','Training Record','Licences','Competencies']
      this.SettingsService.settingType(this.selectedItem,'getList')
  }
  selectItem(item: string) {
    this.selectedItem = (this.selectedItem === item) ? this.selectedItem  : item;
    this.addNewRole = false
    this.SettingsService.settingType(this.selectedItem,'getList')
    this.ParamName = item == 'Role' ? 'roleName' : item == 'Training Record' ? 'trName' : item == 'Licences' ? 'licName' : item == 'Competencies' ? 'comptName' : ''
    this.settingId = item == 'Role' ? 'roleId' : item == 'Training Record' ? 'trId' : item == 'Licences' ? 'licId' : item == 'Competencies' ? 'comptId' : ''
  }
  openAddSettingPopup(){
    this.addNewRole = true
    this.settingEditData = ''
  }
  editSetting(setting:any){
    this.addNewRole = true
    this.settingEditData = {
    settingId:setting[this.settingId],
    settingName:setting[this.ParamName],
    settingType:'edit'
    }
  }
  deleteRole(deleteId:any){
    Swal.fire({
      icon: "warning",
      title:'Are you sure?',
      text: `You want to delete this ${this.selectedItem}?`,
      width: '27rem',
      confirmButtonText:'Yes',
      cancelButtonText:'No',
      showCancelButton:true,
      confirmButtonColor: 'rgb(223,129,62)',
    }).then((result) => {
      if(result.isConfirmed == true){
        this.SettingsService.settingType(this.selectedItem,'delete',deleteId)
        this.addNewRole = false
      }
    });
  }
  receiveData(data:any){
    this.addNewRole = false
  }

}
