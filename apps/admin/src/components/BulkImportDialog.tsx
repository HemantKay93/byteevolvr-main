import React, { useState, useRef } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Upload, X, Check, AlertCircle, FileText, Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AdminService } from '@byteevolvr/api-client';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@byteevolvr/ui';

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkImportDialog({ isOpen, onClose, onSuccess }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        setPreviewData(json.slice(0, 5)); // Show first 5 for preview
        setError(null);
      } catch (err) {
        // eslint-disable-line @typescript-eslint/no-unused-vars
        setError('Failed to parse file. Please ensure it is a valid CSV or Excel file.');
        setPreviewData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        // eslint-disable-line @typescript-eslint/no-explicit-any

        const products = json
          .map((item) => {
            // eslint-disable-line complexity
            const imagesFromCols = [
              item.Image1 || item.image1,
              item.Image2 || item.image2,
              item.Image3 || item.image3,
              item.Image4 || item.image4,
              item.Image5 || item.image5,
              item.Image6 || item.image6,
            ].filter((url) => url && url.toString().trim() !== '');

            const imagesFromList = (item.Images || item.images || '')
              .toString()
              .split(',')
              .map((s: string) => s.trim())
              .filter((s: string) => s !== '');

            const allImages = [
              ...imagesFromCols,
              ...imagesFromList,
              item['Image Link'] || item.image_link,
            ]
              .filter((url) => url && url.toString().trim() !== '')
              .map((url) => url.toString())
              .slice(0, 6);

            return {
              name: item.Name || item.name || item.product_name,
              description: item.Description || item.description || '',
              price: parseFloat(item.Price || item.price || '0'),
              original_price:
                item.OriginalPrice || item.original_price
                  ? parseFloat(item.OriginalPrice || item.original_price)
                  : null,
              sku: item.SKU || item.sku || '',
              stock_quantity: parseInt(item.Stock || item.stock || item.stock_quantity || '0'),
              category: item.Category || item.category || 'General',
              brand: item.Brand || item.brand || '',
              status: (item.Status || item.status || 'active').toLowerCase(),
              image_url: allImages[0] || item.ImageUrl || item.image_url || '',
              images: allImages,
            };
          })
          .filter((p) => p.name);

        const result = await AdminService.bulkImportProducts(products);
        setSuccessCount(result.length || products.length);
        onSuccess();
        setTimeout(() => {
          onClose();
          setFile(null);
          setPreviewData([]);
          setSuccessCount(0);
        }, 2000);
      } catch (err: any) {
        // eslint-disable-line @typescript-eslint/no-explicit-any
        setError(err.customMessage || err.message || 'An error occurred during import.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Example Product',
        sku: 'EX-SKU-001',
        price: 99.99,
        stock: 50,
        category: 'Electronics',
        brand: 'BrandX',
        description: 'Product description here',
        status: 'active',
        image_link: 'https://example.com/image.jpg',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h2 className="text-xl font-bold text-on-surface">Bulk Import Products</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container transition-colors"
          >
            <X className="h-5 w-5 text-on-surface-variant" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-outline-variant rounded-xl p-12 text-center hover:bg-surface-container-low transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-on-surface">
                Click to upload or drag and drop
              </h3>
              <label htmlFor="bulk-file-upload" className="sr-only">
                Upload spreadsheet file
              </label>
              <input
                id="bulk-file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="hidden"
                aria-label="Upload spreadsheet file"
              />
              <Button
                variant="outline"
                className="mt-6 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate();
                }}
              >
                <Download className="h-4 w-4" /> Download Template
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{file.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewData([]);
                  }}
                  className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {previewData.length > 0 && (
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <div className="bg-surface-container-low px-4 py-2 border-b border-outline-variant text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Data Preview (First 5 rows)
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">SKU</TableHead>
                          <TableHead className="text-xs">Price</TableHead>
                          <TableHead className="text-xs">Stock</TableHead>
                          <TableHead className="text-xs">Image</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs truncate max-w-[150px]">
                              {row.Name || row.name || '-'}
                            </TableCell>
                            <TableCell className="text-xs font-mono">
                              {row.SKU || row.sku || '-'}
                            </TableCell>
                            <TableCell className="text-xs">
                              ₹{row.Price || row.price || '0'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {row.Stock || row.stock || row.stock_quantity || '0'}
                            </TableCell>
                            <TableCell className="text-xs truncate max-w-[100px]">
                              {row['Image Link'] ||
                                row.image_link ||
                                row.ImageUrl ||
                                row.image_url ||
                                '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 text-error rounded-lg">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {successCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 text-success rounded-lg">
                  <Check className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Successfully imported {successCount} products!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-outline-variant bg-surface-container-low/50">
          <Button variant="outline" onClick={onClose} disabled={importing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing || !!successCount}
            className="min-w-[120px] gap-2"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {importing ? 'Importing...' : 'Start Import'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
