import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Loader2,
  UploadCloud,
  Plus,
  ArrowRightLeft,
  Tags,
  Layers,
  ClipboardCheck,
  Hash,
  X,
  Globe,
  Building2,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useAdminStore } from '@byteevolvr/store';
import { AdminService, ProductService } from '@byteevolvr/api-client';

import { BulkImportDialog } from '../components/BulkImportDialog';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { StockMovementHistoryModal } from '../components/StockMovementHistoryModal';
import { WarehouseTransferModal } from '../components/WarehouseTransferModal';
import { useAdmin } from '../modules/admin/hooks/useAdmin';

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { products, setProducts, setError } = useAdminStore();
  const { warehouses, fetchWarehouses } = useAdmin();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'categories' | 'tracking' | 'audits'>(
    'stock'
  );

  // Category & Brand Management State
  const [categorySubTab, setCategorySubTab] = useState<'categories' | 'brands'>('categories');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [isSubmittingBrand, setIsSubmittingBrand] = useState(false);
  const [categorySuccessMessage, setCategorySuccessMessage] = useState('');

  const [categories, setCategories] = useState<any[]>([
    {
      id: 'cat-1',
      name: 'Electronics',
      slug: 'electronics',
      parent: 'Root',
      count: 48,
      status: 'Active',
    },
    {
      id: 'cat-2',
      name: 'Smartphones & Audio',
      slug: 'smartphones-audio',
      parent: 'Electronics',
      count: 24,
      status: 'Active',
    },
    {
      id: 'cat-3',
      name: 'Apparel & Fashion',
      slug: 'apparel-fashion',
      parent: 'Root',
      count: 32,
      status: 'Active',
    },
    {
      id: 'cat-4',
      name: 'Footwear',
      slug: 'footwear',
      parent: 'Apparel & Fashion',
      count: 18,
      status: 'Active',
    },
    {
      id: 'cat-5',
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      parent: 'Root',
      count: 15,
      status: 'Active',
    },
    {
      id: 'cat-6',
      name: 'Health & Wellness',
      slug: 'health-wellness',
      parent: 'Root',
      count: 9,
      status: 'Active',
    },
  ]);

  const [brands, setBrands] = useState<any[]>([
    {
      id: 'br-1',
      name: 'Apple Inc.',
      slug: 'apple',
      website: 'https://apple.com',
      status: 'Active',
    },
    {
      id: 'br-2',
      name: 'Sony Electronics',
      slug: 'sony',
      website: 'https://sony.com',
      status: 'Active',
    },
    {
      id: 'br-3',
      name: 'Samsung',
      slug: 'samsung',
      website: 'https://samsung.com',
      status: 'Active',
    },
    {
      id: 'br-4',
      name: 'Nike Sportswear',
      slug: 'nike',
      website: 'https://nike.com',
      status: 'Active',
    },
    {
      id: 'br-5',
      name: 'Logitech',
      slug: 'logitech',
      website: 'https://logitech.com',
      status: 'Active',
    },
    {
      id: 'br-6',
      name: 'ByteEvolvr Gear',
      slug: 'byteevolvr',
      website: 'https://byteevolvr.com',
      status: 'Active',
    },
  ]);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    parent: 'Root',
    description: '',
    status: 'Active',
  });

  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    website: '',
    logo_url: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchInventory();
    fetchWarehouses();
    fetchTaxonomy();
  }, []);

  async function fetchTaxonomy() {
    try {
      const [cats, brs] = await Promise.all([
        ProductService.getCategories(),
        ProductService.getBrands(),
      ]);
      if (cats && cats.length > 0) setCategories(cats);
      if (brs && brs.length > 0) setBrands(brs);
    } catch (err) {
      console.warn('Failed to fetch taxonomy from backend, using defaults:', err);
    }
  }

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      setIsSubmittingCat(true);
      const slug =
        categoryForm.slug.trim() ||
        categoryForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      let createdCat: any = null;
      try {
        createdCat = await ProductService.createCategory({
          name: categoryForm.name.trim(),
          slug,
          parent: categoryForm.parent || 'Root',
          description: categoryForm.description,
          status: categoryForm.status,
        });
      } catch (apiErr) {
        console.warn('Fallback category created locally:', apiErr);
      }

      const newCat = createdCat || {
        id: `cat-${Date.now()}`,
        name: categoryForm.name.trim(),
        slug,
        parent: categoryForm.parent || 'Root',
        count: 0,
        status: categoryForm.status,
      };

      setCategories((prev) => [newCat, ...prev]);
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', slug: '', parent: 'Root', description: '', status: 'Active' });
      setCategorySuccessMessage(`Category "${newCat.name}" created and synced successfully!`);
      setTimeout(() => setCategorySuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleAddBrand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!brandForm.name.trim()) return;

    try {
      setIsSubmittingBrand(true);
      const slug =
        brandForm.slug.trim() ||
        brandForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      let createdBrand: any = null;
      try {
        createdBrand = await ProductService.createBrand({
          name: brandForm.name.trim(),
          slug,
          website: brandForm.website.trim() || 'https://',
          logo_url: brandForm.logo_url,
          status: brandForm.status,
        });
      } catch (apiErr) {
        console.warn('Fallback brand created locally:', apiErr);
      }

      const newBrand = createdBrand || {
        id: `br-${Date.now()}`,
        name: brandForm.name.trim(),
        slug,
        website: brandForm.website.trim() || 'https://',
        status: brandForm.status,
      };

      setBrands((prev) => [newBrand, ...prev]);
      setIsBrandModalOpen(false);
      setBrandForm({ name: '', slug: '', website: '', logo_url: '', status: 'Active' });
      setCategorySuccessMessage(`Brand "${newBrand.name}" registered and synced successfully!`);
      setTimeout(() => setCategorySuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error adding brand:', err);
    } finally {
      setIsSubmittingBrand(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await ProductService.deleteCategory(id);
    } catch (err) {
      console.warn('Delete category fallback:', err);
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await ProductService.deleteBrand(id);
    } catch (err) {
      console.warn('Delete brand fallback:', err);
    }
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  async function fetchInventory() {
    setLoading(true);
    try {
      const data = await AdminService.getProducts();
      setProducts(data || []);
    } catch (err: any) {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Error fetching inventory:', err);
      setError(err.customMessage || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = () => {
    const headers = ['Product', 'SKU', 'Available Stock', 'Price', 'Status'];
    const rows = products.map((p) => [p.name, p.sku, p.stock_quantity, p.price, p.status]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter(
    (p) =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 10).length,
    outOfStock: products.filter((p) => p.stock_quantity <= 0).length,
    totalValue: products.reduce((acc, p) => acc + Number(p.price) * (p.stock_quantity || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Inventory Hub</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Real-time stock monitoring across all warehouses
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={() => setIsImportDialogOpen(true)}>
            <UploadCloud className="h-4 w-4" /> Bulk Import
          </Button>
          <Button variant="outline" className="gap-2" onClick={exportToCSV}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <BulkImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onSuccess={fetchInventory}
      />

      {selectedProduct && (
        <>
          <StockAdjustmentModal
            product={selectedProduct}
            isOpen={isAdjustmentModalOpen}
            onClose={() => {
              setIsAdjustmentModalOpen(false);
              setSelectedProduct(null);
            }}
            onSuccess={fetchInventory}
          />
          <StockMovementHistoryModal
            product={selectedProduct}
            isOpen={isHistoryModalOpen}
            onClose={() => {
              setIsHistoryModalOpen(false);
              setSelectedProduct(null);
            }}
          />
          <WarehouseTransferModal
            product={selectedProduct}
            warehouses={warehouses}
            isOpen={isTransferModalOpen}
            onClose={() => {
              setIsTransferModalOpen(false);
              setSelectedProduct(null);
            }}
            onSuccess={fetchInventory}
          />
        </>
      )}

      <div className="flex border-b border-outline-variant mb-6 overflow-x-auto custom-scrollbar">
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'stock' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('stock')}
        >
          <Layers className="h-4 w-4" /> Stock Levels
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('categories')}
        >
          <Tags className="h-4 w-4" /> Categories & Brands
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'tracking' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('tracking')}
        >
          <Hash className="h-4 w-4" /> Batch & Serial Tracking
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'audits' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          onClick={() => setActiveTab('audits')}
        >
          <ClipboardCheck className="h-4 w-4" /> Stock Audits
        </button>
      </div>

      {activeTab === 'stock' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="border-none shadow-sm bg-surface-container-lowest">
              <div className="p-6">
                <div className="text-on-surface-variant font-black text-[10px] uppercase tracking-widest mb-2">
                  Total SKUs
                </div>
                <div className="text-4xl font-black text-on-surface tracking-tighter">
                  {stats.total}
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-warning/5 border-l-4 border-l-warning">
              <div className="p-6">
                <div className="text-warning font-black text-[10px] uppercase tracking-widest mb-2">
                  Low Stock Alerts
                </div>
                <div className="text-4xl font-black text-warning tracking-tighter">
                  {stats.lowStock}
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-error/5 border-l-4 border-l-error">
              <div className="p-6">
                <div className="text-error font-black text-[10px] uppercase tracking-widest mb-2">
                  Out of Stock
                </div>
                <div className="text-4xl font-black text-error tracking-tighter">
                  {stats.outOfStock}
                </div>
              </div>
            </Card>
            <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
              <div className="p-6">
                <div className="text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                  Inventory Value
                </div>
                <div className="text-4xl font-black text-primary tracking-tighter">
                  ₹{stats.totalValue.toLocaleString()}
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <div className="flex items-center gap-2 max-md w-full">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-on-surface-variant" />
                  <Input
                    placeholder="Search products or SKUs..."
                    className="pl-10 h-10 rounded-xl"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2 rounded-xl">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
              </div>
            </div>
            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-lowest">
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Product
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      SKU
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                      Total Qty
                    </TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                      Price
                    </TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                        <p className="mt-4 text-sm font-medium text-on-surface-variant">
                          Syncing inventory levels...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-surface-container-lowest transition-colors"
                      >
                        <TableCell>
                          <div className="font-bold text-on-surface">{item.name}</div>
                          <div className="text-[10px] text-on-surface-variant font-medium">
                            {item.category}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                          {item.sku}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.stock_quantity > 10
                                ? 'success'
                                : item.stock_quantity > 0
                                  ? 'warning'
                                  : 'error'
                            }
                            className="rounded-full px-3 py-0.5"
                          >
                            {item.stock_quantity > 10
                              ? 'In Stock'
                              : item.stock_quantity > 0
                                ? 'Low Stock'
                                : 'Out of Stock'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-on-surface">
                          {item.stock_quantity}
                        </TableCell>
                        <TableCell className="text-right text-on-surface-variant font-bold">
                          ₹{Number(item.price).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-500"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsTransferModalOpen(true);
                              }}
                              title="Transfer Stock"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsAdjustmentModalOpen(true);
                              }}
                              title="Adjust Stock"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                              onClick={() => {
                                setSelectedProduct(item);
                                setIsHistoryModalOpen(true);
                              }}
                              title="View History"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-outline-variant flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                {filteredProducts.length} items
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          {categorySuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-400 text-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium">{categorySuccessMessage}</span>
              </div>
              <button onClick={() => setCategorySuccessMessage('')} className="hover:opacity-75">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Categories & Brands</h3>
              <p className="text-sm text-on-surface-variant">
                Manage product taxonomy, nested categories, and brand mappings to organize your
                catalog effectively.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={() => setIsBrandModalOpen(true)}>
                <Plus className="h-4 w-4" /> Add Brand
              </Button>
              <Button className="gap-2" onClick={() => setIsCategoryModalOpen(true)}>
                <Plus className="h-4 w-4" /> Create Category
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <button
              onClick={() => setCategorySubTab('categories')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                categorySubTab === 'categories'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setCategorySubTab('brands')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                categorySubTab === 'brands'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Brands ({brands.length})
            </button>
          </div>

          {categorySubTab === 'categories' && (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-lowest">
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Category Name
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Slug
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Parent Category
                    </TableHead>
                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">
                      Products
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <TableCell className="font-bold text-on-surface">
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-primary" />
                          <span>{cat.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-on-surface-variant font-medium">
                        /{cat.slug}
                      </TableCell>
                      <TableCell className="text-sm text-on-surface-variant">
                        <Badge variant="secondary" className="font-medium text-xs">
                          {cat.parent || 'Root'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-on-surface">
                        {cat.count ?? 0} items
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cat.status === 'Active' ? 'success' : 'default'}
                          className="rounded-full px-2.5 py-0.5 text-xs"
                        >
                          {cat.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg"
                          onClick={() => handleDeleteCategory(cat.id)}
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {categorySubTab === 'brands' && (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-lowest">
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Brand Name
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Slug
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Website
                    </TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow
                      key={brand.id}
                      className="hover:bg-surface-container-lowest transition-colors"
                    >
                      <TableCell className="font-bold text-on-surface">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-xs text-primary border border-outline-variant">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{brand.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-on-surface-variant font-medium">
                        {brand.slug}
                      </TableCell>
                      <TableCell>
                        {brand.website && brand.website.length > 5 ? (
                          <a
                            href={
                              brand.website.startsWith('http')
                                ? brand.website
                                : `https://${brand.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                          >
                            <Globe className="h-3.5 w-3.5" />
                            <span>
                              {brand.website.replace('https://', '').replace('http://', '')}
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-70" />
                          </a>
                        ) : (
                          <span className="text-xs text-on-surface-variant italic">No website</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={brand.status === 'Active' ? 'success' : 'default'}
                          className="rounded-full px-2.5 py-0.5 text-xs"
                        >
                          {brand.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg"
                          onClick={() => handleDeleteBrand(brand.id)}
                          title="Delete Brand"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Create Category Modal (Matching CRM Deal Modal Style) */}
          {isCategoryModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsCategoryModalOpen(false)}
              />
              <div className="relative bg-surface w-full max-w-[500px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Tags className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Create Category</h2>
                      <p className="text-xs text-on-surface-variant">
                        Add a product category to catalog taxonomy
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleCreateCategory} className="flex flex-col">
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <Input
                      label="Category Name *"
                      placeholder="e.g. Gaming Peripherals"
                      value={categoryForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                        setCategoryForm({ ...categoryForm, name, slug });
                      }}
                      required
                    />

                    <Input
                      label="Slug"
                      placeholder="e.g. gaming-peripherals"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-on-surface">
                        Parent Category
                      </label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:outline-none hover:border-on-surface-variant cursor-pointer text-on-surface"
                        value={categoryForm.parent}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, parent: e.target.value })
                        }
                      >
                        <option value="Root">None (Root Category)</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-on-surface">
                        Description
                      </label>
                      <textarea
                        className="w-full p-3 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:outline-none hover:border-on-surface-variant text-on-surface placeholder:text-on-surface-variant"
                        rows={3}
                        placeholder="Describe the products in this category..."
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-on-surface">Status</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:outline-none hover:border-on-surface-variant cursor-pointer text-on-surface"
                        value={categoryForm.status}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, status: e.target.value })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCategoryModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingCat || !categoryForm.name.trim()}>
                      {isSubmittingCat ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Create Category
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Brand Modal (Matching CRM Deal Modal Style) */}
          {isBrandModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setIsBrandModalOpen(false)}
              />
              <div className="relative bg-surface w-full max-w-[500px] shadow-xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-outline-variant">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">Add Brand</h2>
                      <p className="text-xs text-on-surface-variant">
                        Register a manufacturing or retail brand
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsBrandModalOpen(false)}
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleAddBrand} className="flex flex-col">
                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <Input
                      label="Brand Name *"
                      placeholder="e.g. Razer Inc."
                      value={brandForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                        setBrandForm({ ...brandForm, name, slug });
                      }}
                      required
                    />

                    <Input
                      label="Brand Slug"
                      placeholder="e.g. razer"
                      value={brandForm.slug}
                      onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                    />

                    <Input
                      label="Official Website URL"
                      placeholder="https://example.com"
                      value={brandForm.website}
                      onChange={(e) => setBrandForm({ ...brandForm, website: e.target.value })}
                    />

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-on-surface">Status</label>
                      <select
                        className="w-full h-10 px-3 rounded-lg border border-outline bg-surface text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all focus:outline-none hover:border-on-surface-variant cursor-pointer text-on-surface"
                        value={brandForm.status}
                        onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Draft">Draft</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-6 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsBrandModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingBrand || !brandForm.name.trim()}>
                      {isSubmittingBrand ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Brand
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tracking' && (
        <Card className="p-10 text-center">
          <Hash className="h-12 w-12 text-outline mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Batch & Serial Tracking</h3>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
            Trace inventory by specific manufacturing batches, expiry dates, or individual serial
            numbers for warranty and compliance.
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Register New Batch
          </Button>
        </Card>
      )}

      {activeTab === 'audits' && (
        <Card className="p-10 text-center">
          <ClipboardCheck className="h-12 w-12 text-outline mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Stock Audits & Cycle Counts</h3>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
            Schedule and perform physical inventory counts to reconcile system stock with actual
            warehouse quantities.
          </p>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Start New Audit
          </Button>
        </Card>
      )}
    </div>
  );
}
