declare module "pdf-parse" {
    interface PDFInfo {
      numpages: number;
      numrender: number;
      info: any;
      metadata: any;
      text: string;
      version: string;
    }
  
    function pdf(dataBuffer: Buffer, options?: any): Promise<PDFInfo>;
    export default pdf;
  }
  