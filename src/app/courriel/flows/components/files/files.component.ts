import {
  Component,
  forwardRef,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';
import { AppFile } from 'src/app/classes/file';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileService } from 'src/app/services/file.service';
import { skip } from 'rxjs/operators';

@Component({
  selector: 'files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilesComponent),
      multi: true,
    },
  ],
})
export class FilesComponent implements OnInit, ControlValueAccessor {
  files: AppFile[] = [];
  files$ = this.fileService.files$;

  progress$ = this.fileService.progress$;
  progress: number[] = [];

  @HostBinding('class.empty') empty = !this.files.length;

  constructor(private fileService: FileService) {}

  onChange!: (files: AppFile[] | null) => void;
  onTouched!: () => void;

  writeValue(obj: any): void {
    if (!obj) {
      this.files = [];
      return;
    }
    this.files = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setValue(files: AppFile[]) {
    if (!files.length) {
      this.onChange(null);
      return;
    }

    this.files = files;
    this.empty = !this.files.length;
    this.onChange(files);
    this.onTouched();
  }

  ngOnInit() {
    this.files$.pipe(skip(1)).subscribe((files) => {
      this.setValue(files);
    });
  }

  remove(file: AppFile) {
    this.files.splice(this.files.indexOf(file), 1);
    this.fileService.uploadedFiles.next(this.files);
  }
}
