export interface OCRResult {
  text: string;
  provider: string;
  confidence?: number;
}

export class OCRService {
  private ocrSpaceKey: string | undefined;

  constructor() {
    this.ocrSpaceKey = process.env.OCR_SPACE_API_KEY;
  }

  isConfigured(): boolean {
    return Boolean(this.ocrSpaceKey && this.ocrSpaceKey.trim().length > 0);
  }

  async extractText(imageBuffer: Buffer, mimeType: string): Promise<OCRResult> {
    if (!this.isConfigured()) {
      return {
        text: '',
        provider: 'OCR.Space (Not Configured)',
      };
    }

    try {
      const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      const formData = new URLSearchParams();
      formData.append('base64Image', base64Image);
      formData.append('apikey', this.ocrSpaceKey!);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OCR.Space HTTP error: ${response.status}`);
      }

      const data = await response.json();
      if (data.IsErroredOnProcessing) {
        throw new Error(`OCR.Space processing error: ${data.ErrorMessage?.[0] || 'Unknown error'}`);
      }

      const parsedText = data.ParsedResults?.[0]?.ParsedText || '';
      return {
        text: parsedText.trim(),
        provider: 'OCR.Space',
      };
    } catch (err: any) {
      console.warn(`OCR.Space extraction failed: ${err.message}`);
      return {
        text: '',
        provider: 'OCR.Space (Failed)',
      };
    }
  }
}
