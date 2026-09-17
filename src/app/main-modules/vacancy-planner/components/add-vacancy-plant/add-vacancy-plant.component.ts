import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, Observable, of, Subject, switchMap } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';

/**
 * Minimal "Add Plant" / "Edit Plant" dialog opened from the Plant Vacancy Planner.
 *
 * Mirrors the "Add Role" dialog: a small name-only form. It saves through the
 * dedicated planner-plant API (`addOrUpdatePlannerPlant`), which stores the record
 * as a planner-only plant. This keeps the plant out of the Plant Resources master
 * list while still making it available in the planner's own plant dropdown (served
 * by `plantListForVacantPlanner`).
 *
 * data: { from: 'add' } | { from: 'edit', entityId, entityName }
 */
@Component({
  selector: 'app-add-vacancy-plant',
  templateUrl: './add-vacancy-plant.component.html',
  styleUrls: ['./add-vacancy-plant.component.scss']
})
export class AddVacancyPlantComponent {
  public addPlantGrp: any;
  public isEdit: boolean = false;
  /** Existing plants matching what's typed, shown as an autocomplete dropdown. */
  public matchingPlants: Observable<any[]> | any = of([]);
  private plantSearch$ = new Subject<string>();
  private searchMinChars = 3;

  constructor(
    public dialogRef: MatDialogRef<AddVacancyPlantComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public commonService: CommonService,
    public endUserService: EndUserService,
    public loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.isEdit = this.data?.from == 'edit';
    this.addPlantGrp = this.fb.group({
      pltTitle: [this.isEdit ? this.data.entityName : '', [Validators.required, this.commonService.noWhitespace, Validators.maxLength(100)]]
    });
    this.setupPlantSearch();
  }

  /**
   * Typing 3+ characters queries plantListForVacantPlanner with a `search` param
   * and offers the matches as a dropdown, so the person can pick a plant that
   * already exists instead of creating a near-duplicate. They can still ignore
   * the suggestions and press Add New to create a genuinely new one.
   */
  private setupPlantSearch() {
    this.plantSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // switchMap so a slow earlier response can't overwrite a newer one.
      switchMap((term: string): Observable<any[]> => {
        const search = (term || '').trim();
        if (search.length < this.searchMinChars) {
          return of([]);
        }
        // plantList (not plantListForVacantPlanner) because only this endpoint
        // supports `search`. It returns `data`, not `resources`, and is
        // paginated — index/limit must be sent or the API gets undefined for
        // both. No pltType is sent, so master and planner-added plants are
        // both offered.
        return this.endUserService.plantList({ index: '0', limit: '25', search }).pipe(
          map((result: any) => (result.status == '200' || result.status == 200)
            ? (result.data || []).map((plant: any) => ({
                entityId: plant.pltId,
                entityName: plant.pltTitle
              }))
            : []),
          catchError(() => of([]))
        );
      })
    ).subscribe((list: any) => {
      this.matchingPlants = of(list || []);
    });
  }

  /** Called on every keystroke in the Plant Name field. */
  onPlantNameInput() {
    this.plantSearch$.next(this.addPlantGrp.get('pltTitle').value || '');
  }

  /**
   * The person picked a plant that already exists, so nothing is created —
   * the dialog just hands the name back and the planner selects it.
   */
  selectExistingPlant(plant: any) {
    // The whole entity is handed back, not just the name: this suggestion came
    // from plantList, which can contain plants that plantListForVacantPlanner
    // (the planner's own dropdown source) does not return. Passing the id lets
    // the planner add it to its list so Confirm can still resolve it.
    this.dialogRef.close({ status: 'success', entityName: plant.entityName, entity: plant });
  }

  ngOnDestroy(): void {
    this.plantSearch$.complete();
  }

  addPlant(value: any) {
    const paramData: any = {
      pltTitle: value.pltTitle.trim()
    };
    // API #79: pltId is sent only when updating an existing planner plant.
    if (this.isEdit) {
      paramData.pltId = this.data.entityId;
    }
    this.loaderService.show();
    this.endUserService.addOrUpdatePlannerPlant(paramData)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe((result: any) => {
        if (result.status == 200 || result.status == '200') {
          this.commonService.successAlert(result.message);
          // The name is returned so the planner can pre-select the plant that was
          // just added/renamed, instead of making the user search for it again.
          this.dialogRef.close({ status: 'success', entityName: paramData.pltTitle });
        } else {
          this.commonService.ApiErrAlert(result);
        }
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getErrorMessage() {
    const control = this.addPlantGrp.get('pltTitle');
    if (control.hasError('required') || control.hasError('whitespace')) {
      return 'Plant name is required';
    }
    if (control.hasError('maxlength')) {
      return 'Plant name cannot be more than 100 characters.';
    }
    return '';
  }
}
