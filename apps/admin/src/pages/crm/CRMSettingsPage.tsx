import { Card, Button, Input } from '@byteevolvr/ui';
import { Save, Settings2, Plus, GripVertical, Trash2 } from 'lucide-react';

export function CRMSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">CRM Settings</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure pipelines, lead sources, and sales preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <div className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container/50 cursor-pointer transition-colors">
            General
          </div>
          <div className="bg-surface-container p-3 rounded-lg font-medium text-primary cursor-pointer">
            Pipelines & Stages
          </div>
          <div className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container/50 cursor-pointer transition-colors">
            Lead Sources
          </div>
          <div className="p-3 rounded-lg text-on-surface-variant hover:bg-surface-container/50 cursor-pointer transition-colors">
            Custom Fields
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6 border-b border-outline-variant pb-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-on-surface">Opportunity Stages</h2>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Stage
              </Button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Prospecting', prob: 20 },
                { name: 'Qualification', prob: 40 },
                { name: 'Proposal/Quote', prob: 70 },
                { name: 'Negotiation', prob: 90 },
                { name: 'Closed Won', prob: 100 },
              ].map((stage, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-outline-variant rounded-lg"
                >
                  <div className="cursor-grab text-on-surface-variant">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`stage-name-${i}`} className="sr-only">
                      Stage Name
                    </label>
                    <Input
                      id={`stage-name-${i}`}
                      aria-label="Stage Name"
                      defaultValue={stage.name}
                      className="w-full"
                    />
                  </div>
                  <div className="w-24">
                    <div className="relative">
                      <label htmlFor={`stage-prob-${i}`} className="sr-only">
                        Probability Percentage
                      </label>
                      <Input
                        id={`stage-prob-${i}`}
                        aria-label="Probability Percentage"
                        type="number"
                        defaultValue={stage.prob}
                        className="w-full pr-8"
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-on-surface-variant">
                        %
                      </span>
                    </div>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant mt-4">
              Drag to reorder stages. The probability represents the likelihood of closing a deal in
              that stage.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
