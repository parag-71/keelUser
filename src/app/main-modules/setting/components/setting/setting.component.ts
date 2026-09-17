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
      this.inputList = ['Role','Training Record','People Licences','Plant Licences','Competencies']
      this.SettingsService.settingType(this.selectedItem,'getList')
  }
  selectItem(item: string) {
    this.selectedItem = (this.selectedItem === item) ? this.selectedItem  : item;
    this.addNewRole = false
    this.SettingsService.settingType(this.selectedItem,'getList')
    this.ParamName = item == 'Role' ? 'roleName' : item == 'Training Record' ? 'trName' : item == 'People Licences' ? 'licName' : item == 'Plant Licences' ? 'cplName' : item == 'Competencies' ? 'comptName' : ''
    this.settingId = item == 'Role' ? 'roleId' : item == 'Training Record' ? 'trId' : item == 'People Licences' ? 'licId' : item == 'Plant Licences' ? 'cplId' : item == 'Competencies' ? 'comptId' : ''
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
    // Deleting a role also removes every planner entry that uses it, so the
    // Role case gets the extra warning. The other setting types on this screen
    // (Training Record, Licences, Competencies) aren't used by the planner and
    // keep the plain confirmation.
    const isRole = this.selectedItem == 'Role'
    Swal.fire({
      icon: "warning",
      title:'Are you sure?',
      text: isRole
        ? 'Deleting this role will also delete all the entries related to it in the planner'
        : `You want to delete this ${this.selectedItem}?`,
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