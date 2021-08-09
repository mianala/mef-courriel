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
export class FilesComponent implements OnInit {
  @HostBinding('class.empty') empty = true;

  constructor(public fileService: FileService) {}

  ngOnInit() {
    this.fileService.files$.subscribe((files: AppFile[]) => {
      this.empty = !files.length;
    });
  }
}
