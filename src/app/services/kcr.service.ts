import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface WordItem { word: string; confidence: number; }
export interface CharItem { character: string; confidence: number; }
export interface EnhancedWordAnalysis {
  filename: string;
  enhanced_image: string;
  regions: WordItem[];
}

@Injectable({
  providedIn: 'root'
})
export class KcrService {
  private base = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  listImages(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/list_images`);
  }
  upload(file: File): Observable<HttpEvent<any>> {
    const fd = new FormData();
    fd.append('file', file, file.name);

    const req = new HttpRequest('POST', `${this.base}/upload`, fd, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  deleteImage(filename: string): Observable<any> {
    const safe = encodeURIComponent(filename);
    return this.http.delete(`${this.base}/delete/${safe}`);
  }

  
  charAnalyse(filename?: string, params?: { [k: string]: any }): Observable<CharItem[]> {
    let httpParams = new HttpParams();
    if (filename) {
      httpParams = httpParams.set('filename', filename);
    }
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null) {
          httpParams = httpParams.set(k, String(params[k]));
        }
      });
    }
    return this.http.get<CharItem[]>(`${this.base}/char_analyse`, { params: httpParams });
  }

 
  wordAnalyse(filename?: string, params?: { [k: string]: any }): Observable<EnhancedWordAnalysis[]> {
    let httpParams = new HttpParams();
    if (filename) {
      httpParams = httpParams.set('filename', filename);
    }
    if (params) {
      Object.keys(params).forEach(k => {
        if (params[k] !== undefined && params[k] !== null) {
          httpParams = httpParams.set(k, String(params[k]));
        }
      });
    }
    return this.http.get<EnhancedWordAnalysis[]>(`${this.base}/word_analyse_with_image`, { params: httpParams });
  }
}
