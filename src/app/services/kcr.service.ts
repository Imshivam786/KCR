import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
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
  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

   getCases(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/cases?page=${page}&page_size=${pageSize}`);
  }

  // Delete a case and all its images
  deleteCase(caseId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cases/${caseId}`);
  }

  // Get all images for a specific case
  getCaseImages(caseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cases/${caseId}/images`);
  }

  // Upload image and create new case
  uploadToNewCase(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const req = new HttpRequest('POST', `${this.baseUrl}/cases/upload`, formData, {
      reportProgress: true
    });
    return this.http.request(req);
  }

  // Upload image to existing case
  uploadToCase(caseId: string, file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const req = new HttpRequest('POST', `${this.baseUrl}/cases/${caseId}/images`, formData, {
      reportProgress: true
    });
    return this.http.request(req);
  }

  // Delete an image from a case
  deleteImage(caseId: string, imageId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cases/${caseId}/images/${imageId}`);
  }

  // Analyze an image (OCR processing)
  analyzeImage(caseId: string, imageId: string, params: any = {}): Observable<any> {
    return this.http.post(`${this.baseUrl}/cases/${caseId}/images/${imageId}/analyze`, params);
  }

  // ===== KEEP YOUR EXISTING METHODS =====
  
  listImages(): Observable<string[]> {
    // Keep for backward compatibility if needed
    return this.http.get<string[]>(`${this.baseUrl}/list`);
  }

  charAnalyse(filename: string, tuned: any = {}): Observable<CharItem[]> {
    // Keep existing implementation
    return this.http.post<CharItem[]>(`${this.baseUrl}/char-analyse`, { filename, ...tuned });
  }

  wordAnalyse(filename: string, tuned: any = {}): Observable<EnhancedWordAnalysis[]> {
    // Keep existing implementation
    return this.http.post<EnhancedWordAnalysis[]>(`${this.baseUrl}/word-analyse`, { filename, ...tuned });
  }

  upload(file: File): Observable<HttpEvent<any>> {
    // Keep for backward compatibility if needed
    const formData = new FormData();
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
      reportProgress: true
    });
    return this.http.request(req);
  }
}
