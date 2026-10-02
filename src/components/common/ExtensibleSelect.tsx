import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlobalDropdownCategory } from '../../types';

interface ExtensibleSelectProps {
  id?: string;
  label: string;
  category: GlobalDropdownCategory;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  parentValue?: string; // e.g. for Model filtered by Make
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  allowAdd?: boolean; // Can be controlled or default true
}

export const ExtensibleSelect: React.FC<ExtensibleSelectProps> = ({
  id,
  label,
  category,
  value,
  onChange,
  placeholder = 'Select an option',
  parentValue,
  required = false,
  disabled = false,
  helperText,
  allowAdd = true,
}) => {
  const { getDropdownItems, addDropdownItem } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');

  const items = getDropdownItems(category, parentValue);

  const formatCategoryTitle = (cat: GlobalDropdownCategory): string => {
    switch (cat) {
      case 'VEHICLE_MAKE': return 'Vehicle Make';
      case 'VEHICLE_MODEL': return 'Vehicle Model';
      case 'VEHICLE_COLOR': return 'Vehicle Colour';
      case 'PROFESSION': return 'Client Profession';
      case 'SERVICE_PACKAGE': return 'Service Package';
      default: return 'Option';
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanVal = newValue.trim();
    if (!cleanVal) {
      setError('Value cannot be empty');
      return;
    }

    // Check if exists
    const exists = items.some(i => i.value.toLowerCase() === cleanVal.toLowerCase());
    if (exists) {
      setError('This item already exists in the global registry');
      return;
    }

    addDropdownItem(category, cleanVal, newLabel.trim() || cleanVal, parentValue);
    onChange(cleanVal);
    setNewValue('');
    setNewLabel('');
    setError('');
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 tracking-tight">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {parentValue && (
          <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
            for {parentValue}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            className={`w-full h-10 px-3 pr-8 text-sm bg-white border rounded-lg text-slate-900 transition-colors appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 ${
              disabled 
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
            {items.map((item) => (
              <option key={item.id} value={item.value} className="text-slate-900">
                {item.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {allowAdd && !disabled && (
          <button
            type="button"
            onClick={() => {
              setError('');
              setIsModalOpen(true);
            }}
            title={`Add new ${formatCategoryTitle(category)} to database`}
            className="h-10 px-3 flex items-center justify-center gap-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-lg shadow-2xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        )}
      </div>

      {helperText && (
        <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
      )}

      {/* Add New Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Add New {formatCategoryTitle(category)}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extends global enterprise database immediately
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNew} className="p-5 space-y-4">
              {parentValue && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                  <span className="font-medium text-slate-500">Associated Make:</span>
                  <span className="font-semibold text-slate-900">{parentValue}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Name / Value <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`e.g. ${
                    category === 'VEHICLE_MAKE' ? 'Aston Martin' :
                    category === 'VEHICLE_MODEL' ? 'DB12 V8 BiTurbo' :
                    category === 'VEHICLE_COLOR' ? 'Qatari Maroon Metallic' :
                    category === 'PROFESSION' ? 'Senior Energy Consultant' :
                    'Full Front Clear PPF Shield'
                  }`}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              {category === 'SERVICE_PACKAGE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Label with Price (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Full Front Clear PPF Shield (4,500 QAR)"
                    className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-rose-600 font-medium">{error}</p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save to Global Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
