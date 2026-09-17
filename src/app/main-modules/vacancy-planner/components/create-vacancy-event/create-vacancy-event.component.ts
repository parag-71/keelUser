import { Component, Inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, map, Observable, of, startWith } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AddVacancyRoleComponent } from '../add-vacancy-role/add-vacancy-role.component';
import { AddVacancyPlantComponent } from '../add-vacancy-plant/add-vacancy-plant.component';

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
  selector: 'app-create-vacancy-event',
  templateUrl: './create-vacancy-event.component.html',
  styleUrls: ['./create-vacancy-event.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class CreateVacancyEventComponent {
  vacancyForm: any;
  sitesList: any;
  filteredSites: Observable<any[]> | any;
  filteredEntities: Observable<any[]> | any;
  /**
   * Local, independently-refreshable copy of the dropdown's entity list.
   * `data.entityList` is only a snapshot from the moment this dialog was opened —
   * mutating the parent's array later wouldn't be visible here. Editing/deleting a
   * planner role or plant from inside this dialog refetches into this copy instead,
   * so the dropdown updates immediately without closing this dialog.
   */
  entityList: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateVacancyEventComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public commonService: CommonService,
    public endUserService: EndUserService,
    public loaderService: LoaderService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    const isEdit = this.data.type == 'edit';
    const defaultEndDate = new Date(new Date(this.data.selectInfo.end).setDate(new Date(this.data.selectInfo.end).getDate() - 1));
    this.vacancyForm = this.fb.group({
      // Name-based (not id-based) so the field can be a type-to-search
      // autocomplete like Select Site. The id is resolved from the name on
      // submit, exactly how the site field resolves siteId.
      // `preselectedEntityName` is set when this was opened from the manage
      // dialog's "Add to Planner", so the picked role/plant is already in the
      // field. It's still a normal editable autocomplete value — it can be
      // changed here like any other.
      entityName: [isEdit ? this.data.selectInfo.extendedProps.entityName : (this.data.preselectedEntityName || ''), Validators.required],
      siteName: [isEdit ? this.data.selectInfo.extendedProps.siteName : '', Validators.required],
      startDates: [this.data.selectInfo.start, Validators.required],
      endDates: [isEdit ? this.data.selectInfo.end : defaultEndDate, Validators.required],
      // maxlength on the textarea blocks typing past 256; this covers a longer
      // value arriving from an existing record or a paste.
      description: [isEdit ? this.data.selectInfo.extendedProps.description : '', Validators.maxLength(256)],
    });
    this.entityList = this.data.entityList;
    this.sitesList = this.data.siteList;
    this.filteredEntities = this.vacancyForm.controls['entityName'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterEntities(value || ''))
    );
    this.filteredSites = this.vacancyForm.controls['siteName'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterSites(value || ''))
    );
  }

  /** entityList is already normalised to { entityId, entityName } by the planner. */
  getEntityName(entity: any) {
    return entity.entityName;
  }

  getEntityId(entity: any) {
    return entity.entityId;
  }

  closeDialog() {
    this.dialogRef.close('close');
  }

  /**
   * Opens the Add Role / Add Plant dialog on top of this dialog, so the person
   * doesn't lose the vacancy plan form they're partway through filling in. On
   * success the new entry is refreshed straight into the dropdown.
   */
  openAddEntityDialog() {
    // Typed as ComponentType<any> because the ternary otherwise infers the union
    // `typeof AddVacancyPlantComponent | typeof AddVacancyRoleComponent`, which
    // dialog.open() won't accept (it needs a single concrete component type).
    const addDialog: ComponentType<any> = this.data.vacancyType == 'plant' ? AddVacancyPlantComponent : AddVacancyRoleComponent;
    const dialogRef = this.dialog.open(addDialog, {
      data: { from: 'add' },
      width: '27rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.status == 'success') {
        // Select the new role/plant straight away so it's ready to use without
        // the person having to find it in the list again. `result.entity` is
        // present when an existing one was picked from the dialog's search
        // suggestions; it's kept so the selection still resolves even if the
        // planner's own list endpoint doesn't return that record.
        this.refreshEntityList(result.entityName, result.entity);
      }
    });
  }

  private _filterEntities(value: any): any[] {
    const filterValue = String(value || '').toLowerCase();
    return (this.entityList || []).filter((entity: any) =>
      (this.getEntityName(entity) || '').toLowerCase().includes(filterValue));
  }

  showAllEntities() {
    this.filteredEntities = of(this.entityList || []);
  }

  filterEntities() {
    const inputValue = this.vacancyForm.controls['entityName'].value;
    this.filteredEntities = of(this._filterEntities(inputValue));
  }

  /** entityType 2 = added from this planner. Only those get edit/delete controls. */
  isPlannerEntity(entity: any): boolean {
    return entity.entityType == 2;
  }

  /**
   * Opens the Edit Role / Edit Plant dialog on top of this dialog, so the person
   * doesn't lose the vacancy plan form they're partway through filling in.
   */
  editEntity(entity: any, event: Event) {
    event.stopPropagation();
    const editDialog: ComponentType<any> = this.data.vacancyType == 'plant' ? AddVacancyPlantComponent : AddVacancyRoleComponent;
    const dialogRef = this.dialog.open(editDialog, {
      data: { from: 'edit', entityId: entity.entityId, entityName: entity.entityName },
      width: '27rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.status == 'success') {
        // If the renamed entity was the one selected in the field, carry the new
        // name across so the field doesn't keep showing the old (now invalid) one.
        const wasSelected = this.vacancyForm.get('entityName').value == entity.entityName;
        this.refreshEntityList(wasSelected ? result.entityName : undefined);
      }
    });
  }

  deleteEntity(entity: any, event: Event) {
    event.stopPropagation();
    const label = this.data.vacancyConfig.entityLabel.toLowerCase();
    Swal.fire({
      icon: 'warning',
      text: `Deleting this ${label} will also delete all the entries related to it in the planner`,
      width: '27rem',
      confirmButtonText: 'Yes',
      confirmButtonColor: 'rgb(223,129,62)',
      cancelButtonText: 'No',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteApi = this.data.vacancyType == 'plant'
          ? this.endUserService.deletePlant({ pltId: entity.entityId })
          : this.endUserService.deleteCompanyRole({ roleId: entity.entityId });
        this.loaderService.show();
        deleteApi.pipe(finalize(() => this.loaderService.hide())).subscribe((res: any) => {
          if (res.status == 200 || res.status == '200') {
            this.commonService.successAlert(res.message);
            // If the deleted entity was the one currently typed in, clear the
            // field so the form can't submit a now-nonexistent entity.
            if (this.vacancyForm.get('entityName').value == entity.entityName) {
              this.vacancyForm.get('entityName').setValue('');
            }
            // Deleting the role/plant also removes its planner entries on the
            // backend, but the planner grid behind this dialog still holds the
            // now-stale plans. `data` is the same object the planner passed in,
            // so flagging it here tells the planner to refetch the plan list
            // once this dialog closes.
            this.data.entityDeleted = true;
            this.refreshEntityList();
          } else {
            this.commonService.ApiErrAlert(res);
          }
        });
      }
    });
  }

  /**
   * Re-fetches the dropdown source and updates the local copy in place.
   *
   * `selectEntityName` (optional) is the role/plant to leave selected in the
   * field once the fresh list arrives — used after adding or renaming one, so
   * it's immediately usable instead of the person having to search for it.
   */
  private refreshEntityList(selectEntityName?: string, ensureEntity?: any) {
    const entityApi = this.data.vacancyType == 'plant'
      ? this.endUserService.plantListForVacantPlanner({})
      : this.endUserService.resourceRoleList({});
    entityApi.subscribe((result: any) => {
      if (result.status == '200') {
        this.entityList = (result.resources || []).map((entity: any) => ({
          entityId: entity.id ?? entity.pltId ?? entity.roleId,
          entityName: entity.title ?? entity.pltTitle ?? entity.roleName,
          entityType: entity.roleType ?? entity.pltType,
          sites: entity.sites || []
        }));
        // A role/plant picked from the Add dialog's search suggestions comes
        // from companyRoleList / plantList, which can return records that
        // resourceRoleList / plantListForVacantPlanner do not. Add it here if
        // it's missing, otherwise createEvent() couldn't resolve the name back
        // to an id and Confirm would reject a selection the person did make.
        if (ensureEntity?.entityId
            && !this.entityList.some((item: any) => item.entityId == ensureEntity.entityId)) {
          this.entityList = [...this.entityList, ensureEntity];
        }
        // Set before filterEntities() below, so the list it builds is filtered
        // against the new name and therefore contains it.
        if (selectEntityName) {
          this.vacancyForm.get('entityName').setValue(selectEntityName);
        }
        // The autocomplete's option list is a snapshot (`of(...)`), so it has to
        // be rebuilt from the new entityList or the panel would keep showing the
        // pre-add/edit/delete options.
        this.filterEntities();
      } else {
        this.commonService.ApiErrAlert(result);
      }
    });
  }

  private _filterSites(value: any): any[] {
    const filterValue = value.toLowerCase();
    return this.sitesList.filter((site: any) => site.siteName.toLowerCase().includes(filterValue));
  }

  showAllSites() {
    this.filteredSites = of(this.data.siteList);
  }

  filterSites() {
    const inputValue = this.vacancyForm.controls['siteName'].value;
    this.filteredSites = of(this._filterSites(inputValue));
  }

  createEvent() {
    const selectedEntity = (this.entityList || []).find(
      (entity: any) => this.getEntityName(entity) === this.vacancyForm.get('entityName').value);
    if (!selectedEntity) {
      this.commonService.Alert(`Please select a valid ${this.data.vacancyConfig.entityLabel.toLowerCase()}.`, 'warning');
      return;
    }
    const selectedSite = this.data.siteList.find((site: any) => site.siteName === this.vacancyForm.get('siteName').value);
    if (!selectedSite) {
      this.commonService.Alert('Please select a valid site.', 'warning');
      return;
    }
    const startDate = new Date(this.vacancyForm.value.startDates);
    const endDate = new Date(this.vacancyForm.value.endDates);
    if (endDate < startDate) {
      this.commonService.Alert('The end date must be later than the start date.', 'warning');
      return;
    }
    const formData: any = {
      startDates: this.vacancyForm.value.startDates,
      endDates: this.vacancyForm.value.endDates,
      entityId: this.getEntityId(selectedEntity),
      description: this.vacancyForm.value.description,
      siteId: selectedSite.siteId,
      planId: this.data.type === 'edit' ? this.data.selectInfo.id : null
    };
    this.dialogRef.close({
      selectedSite,
      formData,
      type: this.data.type
    });
  }

  deleteEventAlert() {
    Swal.fire({
      icon: 'warning',
      text: 'Are you sure you want to delete this vacancy plan?',
      width: '27rem',
      confirmButtonText: 'Yes',
      confirmButtonColor: 'rgb(223,129,62)',
      cancelButtonText: 'No',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteVacancyPlan();
      }
    });
  }

  deleteVacancyPlan() {
    const paramData: any = {};
    paramData[this.data.vacancyConfig.deleteIdKey] = this.data.selectInfo.id;
    const deleteApi = this.data.vacancyType == 'plant'
      ? this.endUserService.deletePlantVacantPlan(paramData)
      : this.endUserService.deleteResourceVacantPlan(paramData);
    this.loaderService.show();
    deleteApi.pipe(finalize(() => this.loaderService.hide())).subscribe((result: any) => {
      if (result.status == '200') {
        this.commonService.successAlert(result.message);
        this.dialogRef.close('delete');
      } else {
        this.commonService.ApiErrAlert(result);
      }
    });
  }
}
