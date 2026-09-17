import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { catchError, debounceTime, distinctUntilChanged, finalize, map, Observable, of, Subject, switchMap } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { EndUserService } from 'src/app/core/services/end-user.service';
import { LoaderService } from 'src/app/core/services/loader.service';

/**
 * Minimal "Add Role" / "Edit Role" dialog opened from the People Vacancy Planner.
 *
 * There is no reusable standalone "Add Role" modal (Settings' role management is
 * an inline panel), so this is a small name-only form. It saves through the same
 * `addOrUpdateCompanyRole` API as Settings but tags the record with `roleType: 2`
 * ("From Planner") so the role stays out of the Settings master list and the
 * People Resource "assign role" dropdown, while still showing up in the planner's
 * own role list.
 *
 * data: { from: 'add' } | { from: 'edit', entityId, entityName }
 */
@Component({
  selector: 'app-add-vacancy-role',
  templateUrl: './add-vacancy-role.component.html',
  styleUrls: ['./add-vacancy-role.component.scss']
})
export class AddVacancyRoleComponent {
  public addRoleGrp: any;
  public isEdit: boolean = false;
  /** Existing roles matching what's typed, shown as an autocomplete dropdown. */
  public matchingRoles: Observable<any[]> | any = of([]);
  private roleSearch$ = new Subject<string>();
  private searchMinChars = 3;

  constructor(
    public dialogRef: MatDialogRef<AddVacancyRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public commonService: CommonService,
    public endUserService: EndUserService,
    public loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.isEdit = this.data?.from == 'edit';
    this.addRoleGrp = this.fb.group({
      roleName: [this.isEdit ? this.data.entityName : '', [Validators.required, this.commonService.noWhitespace, Validators.maxLength(100)]]
    });
    this.setupRoleSearch();
  }

  /**
   * Typing 3+ characters queries resourceRoleList with a `search` param and
   * offers the matches as a dropdown, so the person can pick a role that already
   * exists instead of creating a near-duplicate. They can still ignore the
   * suggestions and press Add New to create a genuinely new one.
   */
  private setupRoleSearch() {
    this.roleSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // switchMap so a slow earlier response can't overwrite a newer one.
      switchMap((term: string): Observable<any[]> => {
        const search = (term || '').trim();
        if (search.length < this.searchMinChars) {
          return of([]);
        }
        // companyRoleList (not resourceRoleList) because only this endpoint
        // supports `search`. Note it returns `data`, not `resources`, and no
        // roleType is sent so both master and planner-added roles are offered.
        return this.endUserService.companyRoleList({ search }).pipe(
          map((result: any) => (result.status == '200' || result.status == 200)
            ? (result.data || []).map((role: any) => ({
                entityId: role.roleId,
                entityName: role.roleName
              }))
            : []),
          catchError(() => of([]))
        );
      })
    ).subscribe((list: any) => {
      this.matchingRoles = of(list || []);
    });
  }

  /** Called on every keystroke in the Role Name field. */
  onRoleNameInput() {
    this.roleSearch$.next(this.addRoleGrp.get('roleName').value || '');
  }

  /**
   * The person picked a role that already exists, so nothing is created —
   * the dialog just hands the name back and the planner selects it.
   */
  selectExistingRole(role: any) {
    // The whole entity is handed back, not just the name: this suggestion came
    // from companyRoleList, which can contain roles that resourceRoleList (the
    // planner's own dropdown source) does not return. Passing the id lets the
    // planner add it to its list so Confirm can still resolve it.
    this.dialogRef.close({ status: 'success', entityName: role.entityName, entity: role });
  }

  ngOnDestroy(): void {
    this.roleSearch$.complete();
  }

  addRole(value: any) {
    const paramData = {
      roleName: value.roleName.trim(),
      roleId: this.isEdit ? this.data.entityId : '',
      // roleType 2 = From Planner (planner-only role).
      roleType: 2
    };
    this.loaderService.show();
    this.endUserService.addOrUpdateCompanyRole(paramData)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe((result: any) => {
        if (result.status == 200 || result.status == '200') {
          this.commonService.successAlert(result.message);
          // The name is returned so the planner can pre-select the role that was
          // just added/renamed, instead of making the user search for it again.
          this.dialogRef.close({ status: 'success', entityName: paramData.roleName });
        } else {
          this.commonService.ApiErrAlert(result);
        }
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getErrorMessage() {
    const control = this.addRoleGrp.get('roleName');
    if (control.hasError('required') || control.hasError('whitespace')) {
      return 'Role name is required';
    }
    if (control.hasError('maxlength')) {
      return 'Role name cannot be more than 100 characters.';
    }
    return '';
  }
}
