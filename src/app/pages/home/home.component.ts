import { HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CharItem, EnhancedWordAnalysis, KcrService } from '../../services/kcr.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  imagesList: string[] = [];
  selectedImage: string | null = null;
  results: any[] | null = null;
  uploading = false;
  uploadProgress = 0;
  backendBase = 'http://localhost:8000';
  processing: boolean = false;

  constructor(private kcr: KcrService) {}

  ngOnInit(): void {
    this.refreshList();
  }

  refreshList() {
    this.kcr.listImages().subscribe({
      next: list => {
        this.imagesList = list;
        // if nothing selected, pick first
        if (!this.selectedImage && list.length) {
          this.selectedImage = list[0];
        }
      },
      error: err => console.error('Failed to load image list', err)
    });
  }

  selectImage(filename: string) {
    this.selectedImage = filename;
    this.results = null;
  }

  onFileSelected(ev: any) {
    const file: File = ev.target.files && ev.target.files[0];
    if (!file) return;
    this.uploading = true;
    this.uploadProgress = 0;

    this.kcr.upload(file).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round((100 * (event.loaded || 0)) / (event.total || 1));
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.uploadProgress = 100;
          // refresh list and auto-select uploaded file if server returns filename
          const body: any = event.body;
          if (body && body.filename) {
            this.refreshList();
            // small delay to let list refresh
            setTimeout(() => this.selectImage(body.filename), 300);
          } else {
            this.refreshList();
          }
        }
      },
      error: err => {
        console.error('Upload failed', err);
        this.uploading = false;
        this.uploadProgress = 0;
      }
    });
  }

  deleteImage(filename: string) {
    if (!confirm(`Delete image ${filename}?`)) return;
    this.kcr.deleteImage(filename).subscribe({
      next: () => {
        if (this.selectedImage === filename) this.selectedImage = null;
        this.refreshList();
      },
      error: err => console.error('Delete failed', err)
    });
  }

  // char analyse for selected file
  doCharAnalyse() {
    if (!this.selectedImage) return;
    // example: pass tuned params by second arg if you exposed them
    const tuned = {
     
    };
    this.kcr.charAnalyse(this.selectedImage, tuned).subscribe({
      next: (data: CharItem[]) => {
        this.results = data;
      },
      error: err => {
        console.error('Char analyse error', err);
        this.results = null;
      }
    });
  }

  // word analyse
  doWordAnalyse() {
    if (!this.selectedImage) return;
    const tuned = {}; // or pass tuned params
    this.processing = true;    // show overlay

    this.kcr.wordAnalyse(this.selectedImage, tuned)
      .pipe(finalize(() => { this.processing = false; })) // always hide overlay
      .subscribe({
        next: (data: EnhancedWordAnalysis[]) => {
          this.results = data;
          console.log(this.results[0].regions)
        },
        error: err => {
          console.error('Word analyse error', err);
          this.results = null;
        }
      });
  }

  getImageUrl(filename: string): string {
    return `${this.backendBase}/uploads/${encodeURIComponent(filename)}`;
  }
}
