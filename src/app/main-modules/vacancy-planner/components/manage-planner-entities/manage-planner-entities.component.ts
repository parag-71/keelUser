import { Component, ElementRef, Inject } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AddVacancyRoleComponent } from '../add-vacancy-role/add-vacancy-role.component';
import { AddVacancyPlantComponent } from '../add-vacancy-plant/add-vacancy-plant.component';

/**
 * "Manage Roles" / "Manage Plants" dialog, opened from the gear icon in the
 * planner's resource-column header.
 *
 * Lists both types in separate sections:
 *   - type 2 (added from the planner)  -> editable and deletable here
 *   - type 1 (Settings / Plant Resources master records) -> read-only, shown
 *     only so the person can see what already exists
 *
 * Picking a row marks it as selected and keeps it that way, so it stays obvious
 * which record the footer's "Add to Planner" will use. Only one row is selected
 * at a time.
 *
 * data: { vacancyType: 'people' | 'plant', entityLabel: string }
 * Closes with:
 *   - 'changed' if anything was added, edited or deleted, so the planner knows
 *     to refresh its dropdown and grid
 *   - { action: 'addToPlanner', entity, changed } from the "Add to Planner"
 *     button, so the planner opens the vacancy plan dialog with that role/plant
 */
@Component({
  selector: 'app-manage-planner-entities',
  templateUrl: './manage-planner-entities.component.html',
  styleUrls: ['./manage-planner-entities.component.scss']
})
export class ManagePlannerEntitiesComponent {
  /** Split by type so the list can show them as two separate sections. */
  masterEntities: any[] = [];
  plannerEntities: any[] = [];
  /**
   * The row the person picked, and the value "Add to Planner" sends on. The
   * template reads its id to mark the row as selected, but the value itself
   * lives here rather than in the CSS class, so it can't be lost by a re-render.
   */
  selectedEntity: any = null;
  private changed = false;
  /** Set when the next load should scroll the picked row into view. */
  private revealAfterLoad = false;

  constructor(
    public dialogRef: MatDialogRef<ManagePlannerEntitiesComponent>,
    private host: ElementRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public commonService: CommonService,
    public endUserService: EndUserService,
    public loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.loadEntities();
  }

  private get isPlant(): boolean {
    return this.data.vacancyType == 'plant';
  }

  loadEntities() {
    // companyRoleList / plantList are used rather than the planner's own list
    // endpoints because sending no roleType / pltType returns BOTH types in a
    // single call, which is exactly what this screen shows.
    const entityApi = this.isPlant
      ? this.endUserService.plantList({ index: '0', limit: '100' })
      : this.endUserService.companyRoleList({ search: '' });
    this.loaderService.show();
    entityApi.pipe(finalize(() => this.loaderService.hide())).subscribe((result: any) => {
      if (result.status == '200' || result.status == 200) {
        const all = (result.data || []).map((entity: any) => ({
          entityId: this.isPlant ? entity.pltId : entity.roleId,
          entityName: this.isPlant ? entity.pltTitle : entity.roleName,
          entityType: this.isPlant ? entity.pltType : entity.roleType
        }));
        // Anything not explicitly type 2 is treated as a master record, so an
        // API that omits the type field can't accidentally expose delete on one.
        this.plannerEntities = all.filter((entity: any) => entity.entityType == 2);
        this.masterEntities = all.filter((entity: any) => entity.entityType != 2);
        this.syncSelectedEntity(all);
        // Only after the Add dialog handed a record back — a reload triggered by
        // a delete shouldn't scroll the list around on its own.
        if (this.revealAfterLoad) {
          this.revealAfterLoad = false;
          this.revealSelected();
        }
      } else {
        this.commonService.ApiErrAlert(result);
      }
    });
  }

  /**
   * Re-resolves the picked row against the list that was just loaded, so a
   * rename is carried across and a delete drops the pick instead of leaving
   * "Add to Planner" pointing at a record that no longer exists.
   */
  private syncSelectedEntity(all: any[]) {
    if (!this.selectedEntity) {
      return;
    }
    this.selectedEntity = all.find((entity: any) => entity.entityId == this.selectedEntity.entityId) || null;
  }

  /**
   * Picking a row replaces whatever was picked before, so only the latest one
   * is ever selected and only that one is handed to "Add to Planner".
   */
  selectEntity(entity: any) {
    this.selectedEntity = entity;
  }

  /** Drives the selected styling in the template. */
  isSelected(entity: any): boolean {
    return !!this.selectedEntity && entity.entityId == this.selectedEntity.entityId;
  }

  /**
   * Brings the selected row into view. The list can be long enough to scroll,
   * so a row picked through the Add dialog's suggestions would otherwise sit
   * off-screen and the person wouldn't see that it had been selected at all.
   *
   * The timeout lets Angular render the rows first — the element doesn't exist
   * yet at the moment the data is assigned.
   */
  private revealSelected() {
    if (!this.selectedEntity) {
      return;
    }
    setTimeout(() => {
      const row = this.host.nativeElement.querySelector('.selected_row');
      row?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  /**
   * Hands the picked role/plant back to the planner, which opens the vacancy
   * plan dialog with it already filled in. The planner is the one that owns the
   * site list and the save call, so the dialog is opened from there rather than
   * stacked on top of this one.
   */
  addToPlanner() {
    if (!this.selectedEntity) {
      this.commonService.Alert(`Please select a ${this.data.entityLabel.toLowerCase()} first.`, 'warning');
      return;
    }
    this.dialogRef.close({
      action: 'addToPlanner',
      entity: this.selectedEntity,
      changed: this.changed
    });
  }

  openAddEdit(entity?: any) {
    const dialogType: ComponentType<any> = this.isPlant ? AddVacancyPlantComponent : AddVacancyRoleComponent;
    const dialogRef = this.dialog.open(dialogType, {
      data: entity
        ? { from: 'edit', entityId: entity.entityId, entityName: entity.entityName }
        : { from: 'add' },
      width: '27rem',
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.status != 'success') {
        return;
      }
      if (result.entity) {
        // An existing record was picked from the Add dialog's suggestions —
        // nothing was created, so treat it exactly like picking the row itself.
        this.selectedEntity = result.entity;
        this.revealAfterLoad = true;
      } else {
        this.changed = true;
      }
      this.loadEntities();
    });
  }

  deleteEntity(entity: any) {
    const label = this.data.entityLabel.toLowerCase();
    Swal.fire({
      icon: 'warning',
      text: `Deleting this ${label} will also delete all the entries related to it in the planner`,
      width: '27rem',
      confirmButtonText: 'Yes',
      confirmButtonColor: 'rgb(223,129,62)',
      cancelButtonText: 'No',
      showCancelButton: true,
    }).then((confirm) => {
      if (!confirm.isConfirmed) {
        return;
      }
      const deleteApi = this.isPlant
        ? this.endUserService.deletePlant({ pltId: entity.entityId })
        : this.endUserService.deleteCompanyRole({ roleId: entity.entityId });
      this.loaderService.show();
      deleteApi.pipe(finalize(() => this.loaderService.hide())).subscribe((res: any) => {
        if (res.status == 200 || res.status == '200') {
          this.commonService.successAlert(res.message);
          this.changed = true;
          this.loadEntities();
        } else {
          this.commonService.ApiErrAlert(res);
        }
      });
    });
  }

  closeDialog() {
    this.dialogRef.close(this.changed ? 'changed' : '');
  }
}
