import { Component, Inject } from '@angular/core';
import { MatDialogRef , MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DashboradService } from 'src/app/main-modules/dashborad/dashborad-service/dashborad.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { map, Observable, of, startWith } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AddEditSitesComponent } from 'src/app/main-modules/sites/components/add-edit-sites/add-edit-sites.component';

const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD / MM / YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};
@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.scss'],
  providers:[
     {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
     { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
   ]
})

export class CreateEventComponent {
  siteName:any= ''
  siteForm: any;
  isSiteNameChange: boolean = false
  sitesList:any
  filteredSites: Observable<any[]>|any;
  constructor(
    public dialogRef: MatDialogRef<CreateEventComponent>,
    public dashboradService:DashboradService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public commonService:CommonService,
    public endUserService:EndUserService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }
  ngOnInit(): void {
    this.siteForm = this.fb.group({
      siteName: [this.data.type == 'edit' ? this.data.selectInfo.extendedProps.siteName : '', Validators.required],
      startDates: [this.data.selectInfo.start,Validators.required],
      endDates: [this.data.type == 'edit' ? this.data.selectInfo.end : new Date(new Date(this.data.selectInfo.end).setDate(new Date(this.data.selectInfo.end).getDate() - 1)),Validators.required],
    });
    this.sitesList = this.data.siteList;
    this.filteredSites = this.siteForm.controls['siteName'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterSites(value || ''))
    );
  }
  closeDialog() {
    this.dialogRef.close('close');
  }
  private _filterSites(value: any): any[] {
    const filterValue = value.toLowerCase();
    return this.sitesList.filter((site:any) => site.siteName.toLowerCase().includes(filterValue));
  }
  showAllSites() {
    this.filteredSites = of(this.data.siteList);
  }
  filterSites() {
    const inputValue = this.siteForm.controls['siteName'].value;
    this.filteredSites = of(this._filterSites(inputValue)); 
  }
  createEvent(){
    const selectedSite = this.data.siteList.find((site:any) => site.siteName === this.siteForm.get('siteName').value);
    const formData: any = {
      startDates:this.siteForm.value.startDates,
      endDates:this.siteForm.value.endDates,
      usrId: this.data.type === 'edit' ? this.data.selectInfo.extendedProps.usrId : null,
      rpId: this.data.type === 'edit' ? this.data.selectInfo.id : null,
      siteName: selectedSite.siteId
    };
    const startDate = new Date(formData.startDates);
    const endDate = new Date(formData.endDates);
    if (endDate < startDate) {
      this.commonService.Alert('The end date must be later than the start date.','warning')
      return; 
    }
    formData.siteName = selectedSite.siteId;
    this.dialogRef.close({
      selectedSite,
      formData,
      type: this.data.type
    });
  }
  deleteEventAlert(){
    Swal.fire({
      icon: 'warning',
      text: 'Are you sure you want to delete this scheduled task?',
      width: '27rem',
      confirmButtonText: 'Yes',
      confirmButtonColor: 'rgb(223,129,62)',
      cancelButtonText: 'No',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteResourcePlan()
      }
    });
  }
  deleteResourcePlan(){
    this.endUserService.deleteResourcePlan({rpId:this.data.selectInfo.id}).subscribe((result:any)=>{
      if (result.status == '200' ){
        this.commonService.successAlert(result.message)
        this.dialogRef.close('delete');
      }else{
        this.commonService.ApiErrAlert(result)
      }
    })
  }
  openSiteDilog(){
      this.dialogRef.close('addSite');
  }
}
