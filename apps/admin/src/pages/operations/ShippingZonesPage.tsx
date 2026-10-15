import { useState } from 'react';
import { Card, Button } from '@byteevolvr/ui';
import { Globe, Plus, Trash2, Edit2, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShippingRate {
  id: string;
  name: string;
  transitTime: string;
  condition: string;
  price: number;
  isFree?: boolean;
}

interface ShippingZone {
  id: string;
  name: string;
  regions: string;
  currency: string;
  rates: ShippingRate[];
}

export function ShippingZonesPage() {
  const [zones, setZones] = useState<ShippingZone[]>([
    {
      id: 'zone-1',
      name: 'Domestic (Pan-India)',
      regions: 'All 28 States & 8 Union Territories',
      currency: '₹',
      rates: [
        {
          id: 'rate-101',
          name: 'Standard Surface Shipping',
          transitTime: '4-7 Business Days',
          condition: '0kg - 5kg',
          price: 80,
        },
        {
          id: 'rate-102',
          name: 'Free Standard Shipping',
          transitTime: '4-7 Business Days',
          condition: 'Orders ₹999.00 and up',
          price: 0,
          isFree: true,
        },
        {
          id: 'rate-103',
          name: 'Express Air Delivery',
          transitTime: '1-2 Business Days',
          condition: 'Weight up to 2kg',
          price: 180,
        },
      ],
    },
    {
      id: 'zone-2',
      name: 'Metro Same-Day / Next-Day',
      regions: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune',
      currency: '₹',
      rates: [
        {
          id: 'rate-201',
          name: 'Guaranteed Next-Day Express',
          transitTime: 'Next Business Day',
          condition: 'Order before 2:00 PM',
          price: 140,
        },
      ],
    },
    {
      id: 'zone-3',
      name: 'Rest of World (International)',
      regions: 'North America, Europe, UAE, APAC',
      currency: '$',
      rates: [],
    },
  ]);

  // Modals state
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [addingRateZoneId, setAddingRateZoneId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms state
  const [zoneForm, setZoneForm] = useState({
    name: '',
    regions: '',
    currency: '₹',
  });

  const [rateForm, setRateForm] = useState({
    name: '',
    transitTime: '3-5 Business Days',
    condition: 'No condition',
    price: 99,
    isFree: false,
  });

  // Handlers
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneForm.name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newZone: ShippingZone = {
        id: `zone-${Date.now()}`,
        name: zoneForm.name.trim(),
        regions: zoneForm.regions.trim() || 'Worldwide',
        currency: zoneForm.currency,
        rates: [],
      };

      setZones([...zones, newZone]);
      toast.success(`Shipping zone "${zoneForm.name}" created!`);
      setIsCreateZoneOpen(false);
      setZoneForm({ name: '', regions: '', currency: '₹' });
      setIsSubmitting(false);
    }, 300);
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    if (!editingZone.name.trim()) {
      toast.error('Zone name is required');
      return;
    }

    setZones((prev) => prev.map((z) => (z.id === editingZone.id ? editingZone : z)));
    toast.success(`Zone "${editingZone.name}" updated successfully!`);
    setEditingZone(null);
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    toast.success('Shipping zone deleted');
    setEditingZone(null);
  };

  const handleAddRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingRateZoneId) return;
    if (!rateForm.name.trim()) {
      toast.error('Rate name is required');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newRate: ShippingRate = {
        id: `rate-${Date.now()}`,
        name: rateForm.name.trim(),
        transitTime: rateForm.transitTime.trim(),
        condition: rateForm.condition.trim(),
        price: rateForm.isFree ? 0 : Number(rateForm.price) || 0,
        isFree: rateForm.isFree,
      };

      setZones((prev) =>
        prev.map((z) => {
          if (z.id === addingRateZoneId) {
            return { ...z, rates: [...z.rates, newRate] };
          }
          return z;
        })
      );

      toast.success(`Rate "${rateForm.name}" added!`);
      setAddingRateZoneId(null);
      setRateForm({
        name: '',
        transitTime: '3-5 Business Days',
        condition: 'No condition',
        price: 99,
        isFree: false,
      });
      setIsSubmitting(false);
    }, 300);
  };

  const handleDeleteRate = (zoneId: string, rateId: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === zoneId) {
          return { ...z, rates: z.rates.filter((r) => r.id !== rateId) };
        }
        return z;
      })
    );
    toast.success('Rate removed');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Shipping Zones & Rates
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure geographic zones and the shipping methods available for each
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2" onClick={() => setIsCreateZoneOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Zone
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => (
          <Card key={zone.id} className="p-0 overflow-hidden shadow-sm">
            <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold text-on-surface">{zone.name}</h3>
                  <p className="text-xs text-on-surface-variant">{zone.regions}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setEditingZone(zone)}
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit Zone
                </Button>
              </div>
            </div>

            <div className="p-4 bg-surface-container-lowest">
              <h4 className="text-sm font-semibold text-on-surface mb-3 flex items-center justify-between">
                <span>Shipping Methods & Rates ({zone.rates.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-primary hover:bg-primary/10 gap-1 text-xs"
                  onClick={() => setAddingRateZoneId(zone.id)}
                >
                  <Plus className="h-3 w-3" /> Add Rate
                </Button>
              </h4>

              {zone.rates.length === 0 ? (
                <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface-container/30">
                  <div className="text-sm text-on-surface-variant">
                    No rates configured. Customers in these regions cannot check out.
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setAddingRateZoneId(zone.id)}>
                    Add Rate
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {zone.rates.map((rate) => (
                    <div
                      key={rate.id}
                      className="flex items-center justify-between p-3 border border-outline-variant rounded-lg hover:border-outline transition-colors bg-surface"
                    >
                      <div>
                        <div className="font-medium text-sm text-on-surface">{rate.name}</div>
                        <div className="text-xs text-on-surface-variant">
                          {rate.transitTime} • Condition: {rate.condition}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className={`font-semibold ${rate.isFree ? 'text-success' : 'text-on-surface'}`}
                        >
                          {rate.isFree ? 'Free' : `${zone.currency}${rate.price.toFixed(2)}`}
                        </div>
                        <button
                          onClick={() => handleDeleteRate(zone.id, rate.id)}
                          title="Remove Rate"
                          className="text-on-surface-variant hover:text-error transition-colors p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* CRM-Style Create Zone Modal */}
      {isCreateZoneOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsCreateZoneOpen(false)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[540px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Create Shipping Zone
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define geographical fulfillment zone and currency
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateZoneOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateZone} className="flex flex-col flex-1">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                    placeholder="e.g. North America, GCC Region, South India Hub"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    States / Countries Included
                  </label>
                  <textarea
                    rows={3}
                    value={zoneForm.regions}
                    onChange={(e) => setZoneForm({ ...zoneForm, regions: e.target.value })}
                    placeholder="e.g. California, New York, Texas, Washington or Karnataka, Tamil Nadu, Kerala"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Currency Symbol
                  </label>
                  <select
                    value={zoneForm.currency}
                    onChange={(e) => setZoneForm({ ...zoneForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  >
                    <option value="₹">₹ (Indian Rupee - INR)</option>
                    <option value="$">$ (US Dollar - USD)</option>
                    <option value="€">€ (Euro - EUR)</option>
                    <option value="£">£ (British Pound - GBP)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateZoneOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Shipping Zone'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM-Style Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setEditingZone(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[540px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Edit Shipping Zone
                  </h2>
                  <p className="text-xs text-slate-500">Update zone name and coverage regions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingZone(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateZone} className="flex flex-col flex-1">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingZone.name}
                    onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Coverage / Regions
                  </label>
                  <textarea
                    rows={3}
                    value={editingZone.regions}
                    onChange={(e) => setEditingZone({ ...editingZone, regions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteZone(editingZone.id)}
                    className="text-rose-600 hover:text-rose-700 text-sm font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="h-4 w-4" /> Delete this entire zone
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-850">
                <Button type="button" variant="outline" onClick={() => setEditingZone(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CRM-Style Add Rate Modal */}
      {addingRateZoneId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setAddingRateZoneId(null)}
          />
          <div className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 w-full max-w-[540px] shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Add Shipping Rate
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure delivery tier, pricing, and rules
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddingRateZoneId(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRate} className="flex flex-col flex-1">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Rate / Method Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={rateForm.name}
                    onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                    placeholder="e.g. Express Air, Heavy Cargo Surface"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Estimated Transit Time
                    </label>
                    <input
                      type="text"
                      value={rateForm.transitTime}
                      onChange={(e) => setRateForm({ ...rateForm, transitTime: e.target.value })}
                      placeholder="e.g. 2-3 Business Days"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Rate Cost
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="inline-flex items-center gap-1.5 text-sm cursor-pointer text-slate-800 dark:text-slate-200">
                        <input
                          type="checkbox"
                          checked={rateForm.isFree}
                          onChange={(e) => setRateForm({ ...rateForm, isFree: e.target.checked })}
                          className="rounded border-slate-300"
                        />
                        Free Shipping
                      </label>
                      {!rateForm.isFree && (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={rateForm.price}
                          onChange={(e) =>
                            setRateForm({ ...rateForm, price: parseFloat(e.target.value) || 0 })
                          }
                          placeholder="Price"
                          className="w-24 px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none text-sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Eligibility Condition / Rule
                  </label>
                  <input
                    type="text"
                    value={rateForm.condition}
                    onChange={(e) => setRateForm({ ...rateForm, condition: e.target.value })}
                    placeholder="e.g. Orders ₹999 and up or Weight 0kg - 5kg"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-850">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddingRateZoneId(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                    </>
                  ) : (
                    'Add Rate Method'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
